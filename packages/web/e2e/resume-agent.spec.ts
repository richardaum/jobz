import { expect, test } from "@playwright/test";

test.describe("Resume Agent", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");
  });

  test("should display toolbar with action buttons", async ({ page }) => {
    // Look for toolbar elements - check for buttons that are typically in the toolbar
    await page.waitForLoadState("networkidle");

    // Check for common toolbar buttons
    const addResumeButton = page.getByRole("button", { name: /add resume/i }).first();
    await expect(addResumeButton).toBeVisible();
  });

  test("should show empty state initially", async ({ page }) => {
    const emptyState = page.getByText("Get Started");
    await expect(emptyState).toBeVisible();
  });

  test("should navigate through the application", async ({ page }) => {
    // Check that main content area is visible
    const mainContent = page.locator("main");
    await expect(mainContent).toBeVisible();
  });

  test("should have responsive layout", async ({ page }) => {
    // Test mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await expect(page.locator("main")).toBeVisible();

    // Test desktop viewport
    await page.setViewportSize({ width: 1920, height: 1080 });
    await expect(page.locator("main")).toBeVisible();
  });
});
