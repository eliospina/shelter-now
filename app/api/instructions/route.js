import Anthropic from "@anthropic-ai/sdk";
import { normalizeLang, offlineSteps, LANG_NAME_EN } from "@/lib/i18n";
import { normalizeMode, tripContext, roundDistance, FAR_THRESHOLD_MIN } from "@/lib/geo";
import { getShelterById } from "@/lib/shelters";
import { createRateLimiter, createTtlCache, clientIp } from "@/lib/protect";

const ANTHROPIC_MODEL = "claude-sonnet-5";
const REQUEST_TIMEOUT_MS = 9000;
const MAX_BODY_BYTES = 2048;
const MAX_DISTANCE_M = 2_000_000;

// Limits on paid Claude calls (cache hits don't count). Over a limit the
// request still gets the offline instructions, never an error.
const perIp = createRateLimiter({ limit: 10, windowMs: 60_000 });
const perInstance = createRateLimiter({ limit: 120, windowMs: 60_000 });
const answers = createTtlCache({ ttlMs: 6 * 60 * 60 * 1000, maxEntries: 2000 });

const client = process.env.ANTHROPIC_API_KEY
  ? new Anthropic({ timeout: REQUEST_TIMEOUT_MS, maxRetries: 0 })
  : null;

const MODE_PHRASE = { walk: "on foot", bike: "by bicycle", car: "by car" };
const MODE_RULE = {
  walk: "They are travelling on foot.",
  bike: 'They are travelling by bicycle. Never say "walk" or "walking"; describe travel as cycling.',
  car: 'They are travelling by car. Never say "walk" or "walking"; describe travel as driving.',
};

// Official guidance from MCF (mcf.se) and krisinformation.se. Claude must
// stick to these facts rather than add its own.
const OFFICIAL_FACTS = `Official Swedish guidance (MCF and krisinformation.se). Use only these facts; do not add other rules:
- Shelters (skyddsrum) are opened within 48 hours after the government declares heightened alert (höjd beredskap). Before that they may be closed. If the alarm sounds before they are open, go to a basement or the middle of the building, away from windows.
- Bring: phone, charger, water and food for 3 days, medicine, ID, hygiene products, warm clothes. Pets are not allowed in shelters.
- Beredskapslarm (30 s signal, 15 s pause, for 5 minutes): go inside and listen to Sveriges Radio P4.
- Flyglarm (many short blasts for 1 minute): take cover immediately.`;

function buildPrompt(lang, ctx) {
  const shelterLine = `Nearest shelter (skyddsrum): ${ctx.address}, ${ctx.distanceText}, about ${ctx.minutes} minutes ${MODE_PHRASE[ctx.mode]}.`;

  const steps = ctx.far
    ? `The nearest shelter is more than ${FAR_THRESHOLD_MIN} minutes away, which is too far. Taking cover where they are now is the priority. The 5 steps must cover, in this order:
1. Stay calm; no shelter within ${FAR_THRESHOLD_MIN} minutes, so take cover where they are now.
2. Go to a basement or the middle of the building, away from windows.
3. Only if it is safe to travel: the nearest shelter above, with its address and travel time; shelters open within 48 hours of heightened alert.
4. Follow official information: Sveriges Radio P4 and krisinformation.se.
5. Help children, elderly people and neighbours; call 112 if someone is hurt.`
    : `The 5 steps must cover, in this order:
1. Stay calm and go now to the nearest shelter above, mentioning the address and travel time.
2. What to bring: phone, charger, water and food for 3 days, medicine, ID, hygiene products, warm clothes; no pets.
3. Shelters open within 48 hours of heightened alert; if it is not open or they cannot get there, go to a basement or the middle of the building, away from windows.
4. Follow official information: Sveriges Radio P4 and krisinformation.se.
5. Help children, elderly people and neighbours; call 112 if someone is hurt.`;

  return `You are a calm emergency guide for people in Sweden, including people who just moved there and may not know local procedures. Write short, calm, numbered instructions (exactly 5 steps, max 30 words each) in ${LANG_NAME_EN[lang]}.

${OFFICIAL_FACTS}

${shelterLine}
${MODE_RULE[ctx.mode]}

${steps}

Output ONLY the 5 numbered lines, no title, no intro, no extra commentary.`;
}

function parseNumberedSteps(text) {
  const lines = text
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean)
    .map((l) => l.replace(/^\d+[.)]\s*/, ""))
    .filter(Boolean);
  return lines.length >= 3 ? lines : null;
}

function offline(steps, reason) {
  return Response.json({ steps, source: "offline", reason });
}

export async function POST(request) {
  const raw = await request.text();
  if (raw.length > MAX_BODY_BYTES) {
    return Response.json({ error: "Request body too large" }, { status: 413 });
  }
  let body;
  try {
    body = JSON.parse(raw);
  } catch {
    return Response.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  // Only real shelters from the dataset reach the prompt; the client sends an
  // id, never free text, so the endpoint can't be used as a general chatbot.
  const shelter = typeof body.shelterId === "string" ? getShelterById(body.shelterId) : null;
  if (!shelter) {
    return Response.json({ error: "Unknown shelterId" }, { status: 400 });
  }
  const distanceMeters = Number(body.distanceMeters);
  if (!Number.isFinite(distanceMeters) || distanceMeters < 0 || distanceMeters > MAX_DISTANCE_M) {
    return Response.json({ error: "distanceMeters must be between 0 and 2,000,000" }, { status: 400 });
  }

  const lang = normalizeLang(body.lang);
  const mode = normalizeMode(body.mode);
  const ctx = tripContext({ address: shelter.address, distanceMeters }, mode);
  const fallback = offlineSteps(lang, ctx);

  if (!client) return offline(fallback, "no_api_key");

  const cacheKey = `${lang}|${mode}|${shelter.id}|${roundDistance(distanceMeters)}`;
  const cached = answers.get(cacheKey);
  if (cached) return Response.json({ steps: cached, source: "claude" });

  if (!perIp(clientIp(request)) || !perInstance("all")) {
    return offline(fallback, "rate_limited");
  }

  try {
    const response = await client.messages.create({
      model: ANTHROPIC_MODEL,
      max_tokens: 1024,
      output_config: { effort: "low" },
      messages: [{ role: "user", content: buildPrompt(lang, ctx) }],
    });
    if (response.stop_reason !== "end_turn") {
      console.warn(`instructions: stop_reason ${response.stop_reason}`);
      return offline(fallback, "unusable_response");
    }
    const text = response.content
      .filter((block) => block.type === "text")
      .map((block) => block.text)
      .join("\n");
    const steps = parseNumberedSteps(text);
    if (!steps) return offline(fallback, "unusable_response");

    answers.set(cacheKey, steps);
    return Response.json({ steps, source: "claude" });
  } catch (error) {
    if (error instanceof Anthropic.APIError) {
      console.error(`instructions: Anthropic API error ${error.status ?? ""} ${error.name}`);
    } else {
      console.error(`instructions: ${error?.name ?? "error"}`);
    }
    return offline(fallback, "api_error");
  }
}
