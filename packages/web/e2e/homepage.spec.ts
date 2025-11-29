import { expect, test } from "@playwright/test";

test.describe("Homepage", () => {
  test("should load the homepage", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveTitle(/Jobz/i);
  });

  test("should display the main application", async ({ page }) => {
    await page.goto("/");

    // Check for main elements
    await expect(page.locator("main")).toBeVisible();
  });

  test("should display empty state when no inputs are provided", async ({ page }) => {
    await page.goto("/");

    // Wait for the page to load
    await page.waitForLoadState("networkidle");

    // Check for empty state elements
    const emptyState = page.getByText("Get Started");
    await expect(emptyState).toBeVisible();

    // Check for instructions - use more specific selectors
    await expect(page.getByRole("heading", { name: "Add Resume" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Add Job Description" })).toBeVisible();
  });
});
