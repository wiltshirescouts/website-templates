// Screenshots. Run: node _build/shoot.mjs   (needs playwright; pages must be built first)
import { createRequire } from "node:module"; const { chromium } = createRequire(import.meta.url)("playwright");
import path from "node:path";
import fs from "node:fs";
import { fileURLToPath } from "node:url";
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const out = path.join(root, "screenshots"); fs.mkdirSync(path.join(out, "parts"), { recursive: true });
const url = (f, q = "") => `file://${root}/pages/${f}.html${q}`;
const browser = await chromium.launch();
const sizes = { desktop: { width: 1280, height: 800 }, mobile: { width: 390, height: 844 } };
async function open(f, size, mode, q = "") {
  const ctx = await browser.newContext({ viewport: sizes[size], deviceScaleFactor: 2, reducedMotion: "reduce" });
  const page = await ctx.newPage();
  await page.goto(url(f, `?mode=${mode}${q}`));
  await page.evaluate(() => document.fonts.ready);
  return { page, ctx };
}
const pages = { content: "1-content-page", form: "2-form-page", table: "3-table-page", library: "4-library", info: "5-information-panel", signin: "6-sign-in", "signin-not-allowed": "6b-sign-in-account-not-allowed", emails: "7-email-library", "emails-brevo-not-set-up": "7b-email-library-brevo-not-set-up", "email-edit": "8-email-edit" };
for (const mode of ["light", "dark"]) for (const size of ["desktop", "mobile"]) for (const [k, f] of Object.entries(pages)) {
  const { page, ctx } = await open(f, size, mode);
  await page.screenshot({ path: path.join(out, `${k}-${size}-${mode}.png`), fullPage: true });
  await ctx.close();
}
for (const mode of ["light", "dark"]) {
  // parts for the component sheet
  let { page, ctx } = await open("1-content-page", "desktop", mode);
  await page.locator("header.site-header").screenshot({ path: `${out}/parts/header-desktop-${mode}.png` });
  await page.locator("footer").screenshot({ path: `${out}/parts/footer-desktop-${mode}.png` });
  await page.keyboard.press("Tab"); await page.keyboard.press("Tab"); await page.keyboard.press("Tab");
  await page.locator("header.site-header").screenshot({ path: `${out}/parts/header-focus-${mode}.png` });
  await ctx.close();
  ({ page, ctx } = await open("1-content-page", "mobile", mode));
  await page.locator("header.site-header").screenshot({ path: `${out}/parts/header-mobile-${mode}.png` });
  await page.locator("footer").screenshot({ path: `${out}/parts/footer-mobile-${mode}.png` });
  await ctx.close();
  ({ page, ctx } = await open("3-table-page", "desktop", mode, "&popover=open"));
  await page.screenshot({ path: `${out}/parts/popover-desktop-${mode}.png`, clip: { x: 640, y: 0, width: 640, height: 460 } });
  await page.screenshot({ path: `${out}/table-desktop-${mode}-account-menu-open.png` });
  await ctx.close();
  ({ page, ctx } = await open("1-content-page", "mobile", mode, "&popover=open"));
  await page.screenshot({ path: `${out}/parts/popover-mobile-${mode}.png`, clip: { x: 0, y: 0, width: 390, height: 520 } });
  await page.screenshot({ path: `${out}/content-mobile-${mode}-account-menu-open.png` });
  await ctx.close();
  ({ page, ctx } = await open("1-content-page", "mobile", mode, "&menu=open"));
  await page.screenshot({ path: `${out}/parts/menu-mobile-${mode}.png` });
  await page.screenshot({ path: `${out}/content-mobile-${mode}-menu-open.png` });
  await ctx.close();
  ({ page, ctx } = await open("3-table-page", "mobile", mode, "&sort=0:ascending"));
  await page.locator(".mobile-sort").screenshot({ path: `${out}/parts/_t.png` }).catch(() => {});
  const box1 = await page.locator(".mobile-sort").boundingBox(), box2 = await page.locator(".table-wrap").boundingBox();
  await page.screenshot({ path: `${out}/parts/table-cards-mobile-${mode}.png`, clip: { x: 0, y: box1.y - 8, width: 390, height: Math.min(box2.y + box2.height, box1.y + 780) - box1.y + 8 }, fullPage: true });
  await page.screenshot({ path: `${out}/table-mobile-${mode}-sorted-name-asc.png`, fullPage: true });
  await ctx.close();
  // extras on desktop
  ({ page, ctx } = await open("3-table-page", "desktop", mode, "&sort=0:ascending"));
  await page.screenshot({ path: `${out}/table-desktop-${mode}-sorted-name-asc.png`, fullPage: true });
  await page.locator('th[data-label="Group size"] .sort-btn').focus(); await page.keyboard.press("Shift+Tab"); await page.keyboard.press("Tab");
  await page.screenshot({ path: `${out}/table-desktop-${mode}-sort-focus.png`, clip: { x: 0, y: 200, width: 1280, height: 420 } });
  await ctx.close();
  ({ page, ctx } = await open("2-form-page", "desktop", mode));
  await page.locator("#first").focus(); await page.keyboard.press("Tab");
  await page.locator("#surname").evaluate((e) => e.scrollIntoView({ block: "center" }));
  await page.screenshot({ path: `${out}/form-desktop-${mode}-focus.png` });
  await ctx.close();
}
fs.rmSync(path.join(out, "parts/_t.png"), { force: true });
// extras for new pages
for (const mode of ["light", "dark"]) {
  let { page, ctx } = await open("5-information-panel", "desktop", mode, "&tab=t-deposit");
  await page.screenshot({ path: `${out}/info-desktop-${mode}-viewport.png` }); await ctx.close();
  ({ page, ctx } = await open("6-sign-in", "desktop", mode, "&popover=open"));
  await page.screenshot({ path: `${out}/signin-desktop-${mode}-account-menu-open.png` }); await ctx.close();
  ({ page, ctx } = await open("6-sign-in", "desktop", mode));
  await page.locator(".btn-ms").focus(); await page.keyboard.press("Shift+Tab"); await page.keyboard.press("Tab");
  await page.screenshot({ path: `${out}/signin-desktop-${mode}-keyboard-focus.png` }); await ctx.close();
  ({ page, ctx } = await open("2-form-page", "mobile", mode));
  await page.screenshot({ path: `${out}/parts/hero-mobile-${mode}.png`, clip: { x: 0, y: 0, width: 390, height: 520 } });
  await page.close(); await ctx.close();
  ({ page, ctx } = await open("2-form-page", "desktop", mode));
  await page.screenshot({ path: `${out}/parts/hero-desktop-${mode}.png`, clip: { x: 0, y: 0, width: 1280, height: 640 } }); await ctx.close();
  ({ page, ctx } = await open("7-email-library", "mobile", mode));
  await page.locator(".subnav-m summary").click(); await page.screenshot({ path: `${out}/emails-mobile-${mode}-admin-menu-open.png`, clip: { x: 0, y: 0, width: 390, height: 900 } }); await ctx.close();
}
// component sheet (after parts exist)
for (const mode of ["light", "dark"]) {
  const { page, ctx } = await open("0-component-sheet", "desktop", mode);
  await page.screenshot({ path: `${out}/component-sheet-${mode}.png`, fullPage: true });
  await ctx.close();
}
await browser.close();
console.log("done");
