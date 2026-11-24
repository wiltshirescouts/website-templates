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
    expect(overflow, "no sideways scroll").toBeLessThanOrEqual(0);
  });
}

for (const mode of ["light", "dark"] as const) {
  test(`plain lists in cards and callouts sit inside the box: ${mode}, 320px`, async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 800 });
    await page.goto(`/pieces-0-6?mode=${mode}`);
    const indent = (testId: string) =>
      page.getByTestId(testId).evaluate((el) => Number.parseFloat(getComputedStyle(el).paddingLeft));

    const card = page.getByTestId("list-card").locator("ul");
    expect(
      await card.evaluate((el) => Number.parseFloat(getComputedStyle(el).paddingLeft)),
      "card list indent",
    ).toBeGreaterThanOrEqual(20);
    expect(await indent("list-callout"), "callout list indent").toBeGreaterThanOrEqual(20);
    // A list that has its own class is left to its site.
    expect(await indent("list-classed"), "classed list untouched").toBe(0);

    // Room between items.
    const rects = await card
      .locator("li")
      .evaluateAll((els) =>
        els.map((e) => ({ top: e.getBoundingClientRect().top, bottom: e.getBoundingClientRect().bottom })),
      );
    for (let i = 1; i < rects.length; i++) {
      expect(
        (rects[i]?.top ?? 0) - (rects[i - 1]?.bottom ?? 0),
        "space between items",
      ).toBeGreaterThanOrEqual(4);
    }

    // The long web address wraps inside the card instead of pushing the page sideways.
    const [box, last] = await Promise.all([card.boundingBox(), card.locator("li").last().boundingBox()]);
    if (!box || !last) throw new Error("the list is not on the page");
    expect(last.x + last.width, "long item stays inside the list").toBeLessThanOrEqual(box.x + box.width + 1);
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
    );
    expect(overflow, "no sideways scroll").toBeLessThanOrEqual(0);
  });
}
