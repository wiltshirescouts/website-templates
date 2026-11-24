import { expect, test } from "@playwright/test";

test("sorting updates aria-sort, hidden state text and the live region", async ({ page }) => {
  await page.goto("/table?mode=light");
  const status = page.locator('[aria-live="polite"]').first();
  const name = page.getByRole("columnheader").filter({ has: page.getByRole("button", { name: /^Name/ }) });
  await page.getByRole("button", { name: /^Name/ }).click();
  await expect(name).toHaveAttribute("aria-sort", "ascending");
  await expect(status).toContainText("sorted by Name, ascending");
  await page.getByRole("button", { name: /^Name/ }).click();
  await expect(name).toHaveAttribute("aria-sort", "descending");
  await expect(status).toContainText("descending");
  await expect(page.getByRole("button", { name: /^Name/ })).toContainText(
    "sorted descending. Activate to sort ascending",
  );
});

test("below 640px rows become cards with a Sort by select and direction button", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/table?mode=light");
  await expect(page.getByLabel("Sort by")).toBeVisible();
  const dir = page.getByRole("button", { name: /Sort direction/ });
  await expect(dir).toBeVisible();
  await dir.click();
  await expect(dir).toHaveAttribute("aria-label", /descending|ascending/);
  await expect(page.locator("table tbody tr").first()).toHaveCSS("display", "block");
  await expect(page.locator("table thead")).toHaveCSS("position", "absolute");
});

test("on wide screens the table has a visible header row", async ({ page }) => {
  await page.goto("/table?mode=light");
  await expect(page.locator("table thead")).toBeVisible();
  await expect(page.locator("table tbody tr").first()).toHaveCSS("display", "table-row");
});

test("toolbar fields in a site-built flex row sit level, with room under the heading", async ({ page }) => {
  await page.goto("/table-toolbar?mode=dark");
  const search = page.getByLabel("Search links");
  const show = page.getByLabel("Show");
  const a = await search.boundingBox();
  const b = await show.boundingBox();
  if (!a || !b) throw new Error("fields not found");
  expect(Math.abs(a.y + a.height - (b.y + b.height))).toBeLessThanOrEqual(1);
  expect(Math.abs(a.y - b.y)).toBeLessThanOrEqual(1);
  // the placeholder is not cut off
  expect(a.width).toBeGreaterThan(260);
  const h = await page.getByRole("heading", { name: "Your links" }).boundingBox();
  const field = await page.locator(".data-table-toolbar").boundingBox();
  if (!h || !field) throw new Error("not found");
  expect(field.y - (h.y + h.height)).toBeGreaterThanOrEqual(11);
});

test("a table wider than its card scrolls sideways on desktop instead of clipping the last column", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1024, height: 800 });
  await page.goto("/table?mode=light");
  // Force the table wider than any card, as seven or more columns are on a laptop.
  await page.addStyleTag({ content: "table.data { min-width: 1600px; }" });
  const wrap = page.locator(".table-wrap").first();
  await expect(wrap).toHaveCSS("overflow-x", "auto");
  const sizes = await wrap.evaluate((el) => ({ scroll: el.scrollWidth, client: el.clientWidth }));
  expect(sizes.scroll).toBeGreaterThan(sizes.client);
  // The last column can be scrolled into view and used.
  const last = page.locator("table.data tbody tr").first().locator("td, th").last();
  await last.scrollIntoViewIfNeeded();
  const box = await last.boundingBox();
  const wrapBox = await wrap.boundingBox();
  if (!box || !wrapBox) throw new Error("not found");
  expect(box.x + box.width).toBeLessThanOrEqual(wrapBox.x + wrapBox.width + 1);
});
