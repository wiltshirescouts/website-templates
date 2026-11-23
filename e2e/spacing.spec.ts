import { expect, test } from "@playwright/test";

test("fields have no margin of their own, and stacked fields are still spaced by their container", async ({
  page,
}) => {
  await page.goto("/form?mode=light");
  await expect(page.locator("h1")).toBeVisible();
  const margins = await page
    .locator(".field")
    .evaluateAll((els) => els.map((e) => getComputedStyle(e).marginBottom));
  expect(new Set(margins)).toEqual(new Set(["0px"]));

  const gap = await page.evaluate(() => {
    const first = document.querySelector(
      "#s1 + p ~ fieldset.field, .card__body > fieldset.field",
    ) as HTMLElement | null;
    const next = first?.nextElementSibling as HTMLElement | null;
    if (!first || !next) return null;
    return next.getBoundingClientRect().top - first.getBoundingClientRect().bottom;
  });
  expect(gap).toBeGreaterThanOrEqual(19);
});

test("fields in a flex row sit level", async ({ page }) => {
  await page.goto("/form?mode=light");
  await page.evaluate(() => {
    const row = document.createElement("div");
    row.id = "probe";
    row.style.cssText = "display:flex;gap:1rem;align-items:flex-end";
    row.innerHTML = `<div class="field"><label class="label" for="a">A</label><input class="input" id="a"></div><div class="field"><label class="label" for="b">B</label><input class="input" id="b"></div>`;
    document.body.append(row);
  });
  const a = await page.locator("#a").boundingBox();
  const b = await page.locator("#b").boundingBox();
  expect((a?.y ?? 0) + (a?.height ?? 0)).toBe((b?.y ?? 1) + (b?.height ?? 1));
});
