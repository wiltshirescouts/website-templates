import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";
import { ROUTES } from "./pages";

for (const mode of ["light", "dark"] as const) {
  for (const route of ROUTES) {
    for (const size of [
      { width: 1280, height: 800 },
      { width: 390, height: 844 },
    ]) {
      test(`axe: ${route} in ${mode} at ${size.width}px`, async ({ page }) => {
        await page.setViewportSize(size);
        await page.goto(`/${route}?mode=${mode}`);
        await expect(page.locator("h1").first()).toBeVisible();
        const results = await new AxeBuilder({ page })
          .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
          .analyze();
        expect(
          results.violations.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(" ")).join(", ")}`),
        ).toEqual([]);
      });
    }
  }
}

test("axe: account popover open in both modes", async ({ page }) => {
  for (const mode of ["light", "dark"]) {
    await page.goto(`/content?mode=${mode}`);
    await page.getByRole("button", { name: "Account and colour mode" }).click();
    const results = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag22aa"]).analyze();
    expect(results.violations).toEqual([]);
  }
});
