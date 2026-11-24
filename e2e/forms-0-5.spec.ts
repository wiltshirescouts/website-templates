import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

test("combobox: type, arrow, Enter, Escape and notListed by keyboard", async ({ page }) => {
  await page.goto("/forms-0-5?mode=light");
  const input = page.getByRole("combobox", { name: /^Country/ });
  await input.focus();
  await expect(input).toHaveAttribute("aria-expanded", "true");
  await input.fill("");
  await page.keyboard.type("deutsch");
  await expect(page.getByRole("option")).toHaveCount(2);
  await page.keyboard.press("Enter");
  await expect(input).toHaveValue("Germany");
  await expect(input).toHaveAttribute("aria-expanded", "false");

  await page.keyboard.press("ArrowDown");
  await expect(input).toHaveAttribute("aria-expanded", "true");
  await page.keyboard.press("End");
  const active = await input.getAttribute("aria-activedescendant");
  await expect(page.locator(`#${active}`)).toHaveText("My country is not listed");
  await page.keyboard.press("Escape");
  await expect(input).toHaveValue("Germany");
  await expect(input).toHaveAttribute("aria-expanded", "false");
  await expect(input).toBeFocused();

  await page.keyboard.press("ArrowDown");
  await page.keyboard.press("End");
  await page.keyboard.press("Enter");
  await expect(input).toHaveValue("My country is not listed");
});

test("combobox popup has no axe violations when open, in both modes and on a phone", async ({ page }) => {
  for (const mode of ["light", "dark"]) {
    for (const size of [
      { width: 1280, height: 800 },
      { width: 390, height: 844 },
    ]) {
      await page.setViewportSize(size);
      await page.goto(`/forms-0-5?mode=${mode}`);
      const input = page.getByRole("combobox", { name: /^Destination country/ });
      await input.focus();
      await page.keyboard.press("ArrowDown");
      await expect(page.getByRole("listbox", { name: /Destination country/ })).toBeVisible();
      const box = await input.boundingBox();
      const list = await page.getByRole("listbox", { name: /Destination country/ }).boundingBox();
      expect(Math.round(list?.width ?? 0)).toBe(Math.round(box?.width ?? -1));
      const results = await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
        .analyze();
      expect(
        results.violations.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(" ")).join(", ")}`),
      ).toEqual([]);
    }
  }
});

test("repeatable fieldset: Add focuses the new row, Remove keeps focus in the list", async ({ page }) => {
  await page.goto("/forms-0-5?mode=light");
  const add = page.getByRole("button", { name: "Add another destination" });
  await add.focus();
  await page.keyboard.press("Enter");
  await expect(page.getByRole("group", { name: "Destination 2" })).toBeVisible();
  await expect(page.getByLabel("Place 2")).toBeFocused();
  await page.keyboard.type("Lyon");
  await page.getByRole("button", { name: "Remove destination 2" }).focus();
  await page.keyboard.press("Enter");
  await expect(page.getByRole("group", { name: "Destination 2" })).toHaveCount(0);
  await expect(page.getByLabel("Place 1")).toBeFocused();
  await expect(page.getByRole("status").filter({ hasText: "Destination 2 removed. 1 left." })).toHaveCount(1);
});

test("file upload: failure shows the error and returns focus to the file input", async ({ page }) => {
  await page.goto("/forms-0-5?mode=light");
  await page.getByRole("button", { name: "Upload" }).click();
  const input = page.getByLabel("Add a document");
  await expect(page.getByText("Select a file to upload")).toBeVisible();
  await expect(input).toBeFocused();
  await input.setInputFiles({ name: "a.pdf", mimeType: "application/pdf", buffer: Buffer.from("x") });
  await page.getByRole("button", { name: "Upload" }).click();
  await expect(page.getByText("The upload was interrupted. Try again.")).toBeVisible();
  await expect(input).toBeFocused();
});
