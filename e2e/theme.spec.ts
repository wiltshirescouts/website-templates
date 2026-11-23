import { expect, test } from "@playwright/test";

test("Auto follows the device and is the default", async ({ page }) => {
  await page.emulateMedia({ colorScheme: "dark" });
  await page.goto("/content");
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  await page.emulateMedia({ colorScheme: "light" });
  await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
});

test("choice persists across reloads (localStorage on localhost), and Auto clears it", async ({ page }) => {
  await page.goto("/content");
  await page.getByRole("button", { name: "Account and colour mode" }).click();
  await page.getByText("Dark", { exact: true }).click();
  await page.reload();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  await page.getByRole("button", { name: "Account and colour mode" }).click();
  await page.getByText("Auto", { exact: true }).click();
  await page.reload();
  expect(await page.evaluate(() => localStorage.getItem("ws-theme"))).toBeNull();
});

test("a ws-theme cookie from another wiltshirescouts site is honoured before first paint", async ({ context, page }) => {
  await context.addCookies([{ name: "ws-theme", value: "dark", url: "http://localhost:5199" }]);
  await page.emulateMedia({ colorScheme: "light" });
  await page.addInitScript(() => {
    (window as unknown as { __first?: string }).__first = undefined;
    document.addEventListener("DOMContentLoaded", () => {
      (window as unknown as { __first?: string }).__first = document.documentElement.getAttribute("data-theme") ?? "";
    });
  });
  await page.goto("/content");
  expect(await page.evaluate(() => (window as unknown as { __first?: string }).__first)).toBe("dark");
});

test("header and footer stay purple in dark mode", async ({ page }) => {
  await page.goto("/content?mode=dark");
  await expect(page.locator("header.chrome")).toHaveCSS("background-color", "rgb(116, 19, 220)");
  await expect(page.locator("footer.chrome")).toHaveCSS("background-color", "rgb(116, 19, 220)");
});

test("reduced motion removes the colour slider animation", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/content");
  await page.getByRole("button", { name: "Account and colour mode" }).click();
  const t = await page.locator(".mode-seg").evaluate((el) => getComputedStyle(el, "::before").transitionDuration);
  expect(t).toBe("0s");
});
