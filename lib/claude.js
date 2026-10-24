// Shared Claude client, model and official facts for the server routes.
import Anthropic from "@anthropic-ai/sdk";

export const ANTHROPIC_MODEL = "claude-sonnet-5";

// One client for every route. Routes pass their own per-request timeout.
export const client = process.env.ANTHROPIC_API_KEY ? new Anthropic({ maxRetries: 0 }) : null;

// In English, "shelter" alone suggests a homeless shelter, so the app says
// "bunker"; Claude's English answers must match.
export function wordingRule(lang) {
  return lang === "en" ? 'In English, call a skyddsrum a "bunker", never just a "shelter".' : "";
}

export const MODE_PHRASE = { walk: "on foot", bike: "by bicycle", car: "by car" };

// Official guidance from MCF (mcf.se) and krisinformation.se. Claude must
// stick to these facts rather than add its own.
export const OFFICIAL_FACTS = `Official Swedish guidance (MCF and krisinformation.se). Use only these facts; do not add other rules:
- Shelters (skyddsrum) are opened within 48 hours after the government declares heightened alert (höjd beredskap). Before that they may be closed. If the alarm sounds before they are open, go to a basement or the middle of the building, away from windows.
- Bring: phone, charger, water and food for 3 days, medicine, ID, hygiene products, warm clothes. Pets are not allowed in shelters.
- Beredskapslarm (30 s signal, 15 s pause, for 5 minutes): go inside and listen to Sveriges Radio P4.
- Flyglarm (many short blasts for 1 minute): take cover immediately.
- Follow official information: Sveriges Radio P4 and krisinformation.se.
- Call 112 if someone is hurt or in immediate danger.`;

export function logClaudeError(route, error) {
  if (error instanceof Anthropic.APIError) {
    console.error(`${route}: Anthropic API error ${error.status ?? ""} ${error.name}`);
  } else {
    console.error(`${route}: ${error?.name ?? "error"}`);
  }
}
