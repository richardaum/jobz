import { expect, test } from "@playwright/test";

test.describe("Navigation", () => {
  test("should navigate to about page if it exists", async ({ page }) => {
    await page.goto("/");

    // Check if about link exists and navigate
    const aboutLink = page.getByRole("link", { name: /about/i });
    if (await aboutLink.isVisible()) {
      await aboutLink.click();
      await expect(page).toHaveURL(/.*about.*/);
    }
  });

  test("should handle page navigation", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    // Verify we're on the homepage
    await expect(page.locator("main")).toBeVisible();
  });
});
