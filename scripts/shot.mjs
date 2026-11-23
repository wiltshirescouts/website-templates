// Usage: node scripts/shot.mjs <route> <light|dark> <desktop|mobile> <outfile> [extra query]
import { chromium } from "@playwright/test";
const [route, mode, size, out, extra = ""] = process.argv.slice(2);
const vp = size === "mobile" ? { width: 390, height: 844 } : { width: 1280, height: 800 };
const b = await chromium.launch();
const p = await b.newPage({ viewport: vp });
const errors = [];
p.on("console", (m) => m.type() === "error" && errors.push(m.text()));
p.on("pageerror", (e) => errors.push(String(e)));
await p.goto(`http://localhost:5199/${route}?mode=${mode}${extra}`);
await p.waitForLoadState("networkidle");
await p.screenshot({ path: out, fullPage: true });
if (errors.length) console.log("ERRORS:\n" + errors.join("\n"));
await b.close();
