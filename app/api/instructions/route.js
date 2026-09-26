import { normalizeLang, offlineSteps, LANG_NAME_EN } from "@/lib/i18n";
import { normalizeMode, tripContext, FAR_THRESHOLD_MIN } from "@/lib/geo";

const ANTHROPIC_MODEL = "claude-sonnet-5";
const REQUEST_TIMEOUT_MS = 9000;

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

export async function POST(request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const distanceMeters = Number(body.shelter?.distanceMeters);
  if (!Number.isFinite(distanceMeters)) {
    return Response.json({ error: "shelter.distanceMeters is required" }, { status: 400 });
  }

  const lang = normalizeLang(body.lang);
  const ctx = tripContext(
    { address: String(body.shelter?.address ?? ""), distanceMeters },
    normalizeMode(body.mode)
  );

  const fallback = offlineSteps(lang, ctx);
  const apiKey = process.env.ANTHROPIC_API_KEY;

  if (!apiKey) {
    return Response.json({ steps: fallback, source: "offline" });
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: ANTHROPIC_MODEL,
        max_tokens: 500,
        messages: [{ role: "user", content: buildPrompt(lang, ctx) }],
      }),
      signal: controller.signal,
    });

    if (!res.ok) {
      return Response.json({ steps: fallback, source: "offline" });
    }

    const data = await res.json();
    const text = data.content?.map((block) => block.text ?? "").join("\n") ?? "";
    const steps = parseNumberedSteps(text);

    if (!steps) {
      return Response.json({ steps: fallback, source: "offline" });
    }

    return Response.json({ steps, source: "claude" });
  } catch {
    return Response.json({ steps: fallback, source: "offline" });
  } finally {
    clearTimeout(timeout);
  }
}
