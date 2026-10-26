// Google Play phone screenshots (1080 × 1920, 9:16) of the running app in demo mode.
// Usage: node play-shots.mjs <url-with-?demo> <outDir>
import { spawn } from "node:child_process";
import fs from "node:fs";
const [url, outDir] = process.argv.slice(2);
const port = 9336;
const chrome = spawn("/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  ["--headless=new", `--remote-debugging-port=${port}`, "--user-data-dir=/tmp/bn-chrome-play", "--hide-scrollbars", "about:blank"], { stdio: "ignore" });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
let ws;
for (let i = 0; i < 50 && !ws; i++) {
  try {
    const targets = await (await fetch(`http://127.0.0.1:${port}/json`)).json();
    const page = targets.find((t) => t.type === "page");
    if (page) ws = new WebSocket(page.webSocketDebuggerUrl);
  } catch { await sleep(200); }
}
await new Promise((r) => ws.addEventListener("open", r, { once: true }));
let id = 0; const pending = new Map();
ws.addEventListener("message", (e) => { const m = JSON.parse(e.data); if (m.id && pending.has(m.id)) { pending.get(m.id)(m.result); pending.delete(m.id); } });
const send = (method, params = {}) => new Promise((r) => { const i = ++id; pending.set(i, r); ws.send(JSON.stringify({ id: i, method, params })); });
const evaluate = (expression) => send("Runtime.evaluate", { expression, awaitPromise: true });
const shot = async (name) => {
  const { data } = await send("Page.captureScreenshot", { format: "png" });
  fs.writeFileSync(`${outDir}/${name}.png`, Buffer.from(data, "base64"));
  console.log(name);
};
await send("Page.enable");
await send("Emulation.setDeviceMetricsOverride", { width: 540, height: 960, deviceScaleFactor: 2, mobile: true });
await send("Emulation.setEmulatedMedia", { features: [{ name: "prefers-color-scheme", value: "light" }] });

const load = async (lang) => {
  await send("Page.navigate", { url });
  await sleep(2500);
  // Pick the language through the select, as a user would (React-controlled).
  await evaluate(`(() => { const s = document.getElementById('lang'); Object.getOwnPropertyDescriptor(HTMLSelectElement.prototype, 'value').set.call(s, '${lang}'); s.dispatchEvent(new Event('change', { bubbles: true })); })()`);
  await sleep(800);
  // The Next.js dev indicator is not part of the app.
  await evaluate("document.querySelector('nextjs-portal')?.remove()");
};
const emergency = async () => {
  await evaluate("document.querySelector('.sos').click()");
  await sleep(3500);
};
const scrollTo = async (selector, offset = 24) => {
  await evaluate(`window.scrollTo(0, document.querySelector('${selector}').getBoundingClientRect().top + window.scrollY - ${offset})`);
  await sleep(500);
};

await load("en");
await shot("en-1-home");
await emergency();
await scrollTo(".card.first");
await shot("en-2-result");
await scrollTo(".compass");
await shot("en-3-compass");
await scrollTo(".ask", 420);
await shot("en-4-instructions");

await load("ar");
await emergency();
await scrollTo(".card.first");
await shot("ar-5-result");

chrome.kill();
process.exit(0);
