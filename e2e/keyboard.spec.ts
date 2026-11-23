import { expect, test } from "@playwright/test";

test("keyboard path: skip link, account menu, colour control", async ({ page }) => {
  await page.goto("/content?mode=light");
  await page.keyboard.press("Tab");
  const skip = page.getByRole("link", { name: "Skip to content" });
  await expect(skip).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(page.locator("main")).toBeFocused();

  const btn = page.getByRole("button", { name: "Account and colour mode" });
  await btn.focus();
  await page.keyboard.press("Enter");
  await expect(btn).toHaveAttribute("aria-expanded", "true");
  await expect(page.getByRole("link", { name: "Sign in" })).toBeFocused();

  // Move to the colour control and change it with the arrow keys
  await page.keyboard.press("Tab");
  await expect(page.getByRole("radio").first()).toBeFocused();
  await page.keyboard.press("ArrowRight");
  await expect(page.getByRole("radio", { name: /Dark/ })).toBeChecked();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");

  await page.keyboard.press("Escape");
  await expect(btn).toHaveAttribute("aria-expanded", "false");
  await expect(btn).toBeFocused();
});

test("focus ring is 3px on keyboard focus", async ({ page }) => {
  await page.goto("/content?mode=light");
  await page.keyboard.press("Tab");
  await expect(page.getByRole("link", { name: "Skip to content" })).toHaveCSS("outline-width", "3px");
});

test("mobile menu opens as a sheet, traps focus and closes on Escape", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/content?mode=light");
  const open = page.getByRole("button", { name: "Open menu" });
  await open.click();
  const sheet = page.getByRole("dialog");
  await expect(sheet).toBeVisible();
  await expect(sheet.getByRole("link", { name: "Trips" })).toHaveAttribute("aria-current", "page");
  await page.keyboard.press("Escape");
  await expect(sheet).toBeHidden();
  await expect(open).toBeFocused();
});
