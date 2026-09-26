import { normalizeLang, OFFLINE_STEPS, LANG_NAME_EN } from "@/lib/i18n";

const ANTHROPIC_MODEL = "claude-sonnet-5";
const REQUEST_TIMEOUT_MS = 9000;

function buildOfflineSteps(lang, ctx) {
  return OFFLINE_STEPS[lang](ctx);
}

function buildPrompt(lang, ctx) {
  const second = ctx.secondAddress
    ? ` A second option, further away: ${ctx.secondAddress}, ${ctx.secondDistanceText}.`
    : "";
  return `You are a calm emergency guide for people in Sweden, including people who just moved there and may not know local procedures. Write short, calm, numbered instructions (exactly 5 steps, max 20 words each) in ${LANG_NAME_EN[lang]}.

Nearest shelter (skyddsrum): ${ctx.address}, ${ctx.distanceText}, about ${ctx.walkMinutes} minutes walking.${second}

The 5 steps must cover, in this order:
1. Stay calm and go now to the nearest shelter named above, mentioning the address and walking time.
2. What to bring: phone, charger, water, medicine, ID, warm clothes.
3. What to do if they cannot reach the shelter: go to a basement or the innermost part of a building, away from windows.
4. Follow official information: Sveriges Radio P4 and krisinformation.se.
5. Help children, elderly people and neighbours; call 112 if someone is hurt.

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

  const lang = normalizeLang(body.lang);
  const ctx = {
    address: body.shelter?.address ?? "",
    distanceText: body.shelter?.distanceText ?? "",
    walkMinutes: body.shelter?.walkMinutes ?? "",
    secondAddress: body.second?.address ?? "",
    secondDistanceText: body.second?.distanceText ?? "",
  };

  const offlineSteps = buildOfflineSteps(lang, ctx);
  const apiKey = process.env.ANTHROPIC_API_KEY;

  if (!apiKey) {
    return Response.json({ steps: offlineSteps, source: "offline" });
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
      return Response.json({ steps: offlineSteps, source: "offline" });
    }

    const data = await res.json();
    const text = data.content?.map((block) => block.text ?? "").join("\n") ?? "";
    const steps = parseNumberedSteps(text);

    if (!steps) {
      return Response.json({ steps: offlineSteps, source: "offline" });
    }

    return Response.json({ steps, source: "claude" });
  } catch {
    return Response.json({ steps: offlineSteps, source: "offline" });
  } finally {
    clearTimeout(timeout);
  }
}
