import { expect, test } from "@playwright/test";

test("disclosure toggles with the keyboard", async ({ page }) => {
  await page.goto("/pieces-0-6?mode=light");
  const details = page.locator("details", { hasText: "What happens next?" });
  const summary = details.locator("summary");
  await expect(details).not.toHaveAttribute("open", "");
  await summary.focus();
  await page.keyboard.press("Enter");
  await expect(details).toHaveAttribute("open", "");
  await expect(page.getByText(/replies within ten working days/).first()).toBeVisible();
  await page.keyboard.press("Space");
  await expect(details).not.toHaveAttribute("open", "");
});

test("nav tabs are reached in order and the current one is marked", async ({ page }) => {
  await page.goto("/pieces-0-6?mode=light");
  const nav = page.getByRole("navigation", { name: "Visit sections" });
  const links = nav.getByRole("link");
  await expect(links).toHaveCount(4);
  await expect(links.first()).toHaveAttribute("aria-current", "page");
  await links.first().focus();
  for (const name of ["Itinerary", "Participants", "History"]) {
    await page.keyboard.press("Tab");
    await expect(nav.getByRole("link", { name })).toBeFocused();
  }
});

test("data table with sortable=false has no sort controls", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/pieces-0-6?mode=light");
  const table = page.locator("table", { has: page.locator("caption", { hasText: "Visits by country" }) });
  await expect(table).toBeAttached();
  await expect(table.getByRole("button")).toHaveCount(0);
  await expect(table.locator("[aria-sort]")).toHaveCount(0);
  await expect(page.getByLabel("Sort by")).toHaveCount(0);
});

for (const width of [320, 390, 1280]) {
  test(`no horizontal overflow at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 800 });
    await page.goto("/pieces-0-6?mode=light");
    await expect(page.locator("h1").first()).toBeVisible();
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
    );
    expect(overflow).toBeLessThanOrEqual(0);
  });
}
