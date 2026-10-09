import { test, expect } from "@playwright/test";

test.describe("Login Flow", () => {
  test.beforeEach(async ({ page }) => {
    // Intercept API endpoints to prevent external backend dependence
    await page.route("**/api/notifications**", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ success: true, notifications: [] }),
      });
    });

    await page.route("**/api/animals**", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ success: true, data: [] }),
      });
    });

    await page.route("**/api/shelters**", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ success: true, shelters: [] }),
      });
    });

    await page.route("**/api/rescue-requests**", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ success: true, requests: [] }),
      });
    });
  });

  test("shows validation errors when submitting empty form", async ({
    page,
  }) => {
    await page.goto("/login");

    // Click submit without entering credentials
    await page.locator('button[type="submit"]').click({ force: true });

    // Verify required field validation messages appear
    await expect(page.locator("text=Email address is required")).toBeVisible();
    await expect(page.locator("text=Password is required")).toBeVisible();
    await expect(
      page.locator(
        "text=Please fix all field validation errors before logging in.",
      ),
    ).toBeVisible();
  });

  test("shows validation error for invalid email format", async ({ page }) => {
    await page.goto("/login");

    await page.locator('input[name="email"]').fill("invalid-email");
    await page.locator('input[name="email"]').blur();

    await expect(
      page.locator(
        "text=Please enter a valid email address (e.g. name@example.com)",
      ),
    ).toBeVisible();
  });

  test("shows error banner when credentials are wrong", async ({ page }) => {
    // Mock login failure response from API
    await page.route("**/api/auth/login", async (route) => {
      await route.fulfill({
        status: 401,
        contentType: "application/json",
        body: JSON.stringify({
          success: false,
          message: "Invalid email address or password",
        }),
      });
    });

    await page.goto("/login");

    await page.locator('input[name="email"]').fill("wrong.user@example.com");
    await page.locator('input[name="password"]').fill("WrongPassword123");
    await page.locator('button[type="submit"]').click({ force: true });

    // Verify error banner is visible with expected message
    await expect(
      page.locator("text=Invalid email address or password"),
    ).toBeVisible();
  });

  test("logs in successfully with valid credentials and arrives at dashboard", async ({
    page,
  }) => {
    const mockUser = {
      id: "user-123",
      email: "dennis@example.com",
      fullName: "Dennis Jacob",
      role: "Public User",
    };

    await page.route("**/api/auth/login", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          success: true,
          token: "mock-jwt-token-12345",
          user: mockUser,
        }),
      });
    });

    await page.route("**/api/auth/me", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ success: true, user: mockUser }),
      });
    });

    await page.goto("/login");

    await page.locator('input[name="email"]').fill("dennis@example.com");
    await page.locator('input[name="password"]').fill("Password123!");
    await page.locator('button[type="submit"]').click();

    // Should redirect to /dashboard
    await expect(page).toHaveURL(/\/dashboard$/);
  });

  test("navigates to forgot password page when clicking link", async ({
    page,
  }) => {
    await page.goto("/login");

    const forgotLink = page.getByRole("link", {
      name: /Forgot password\?/i,
    });
    await forgotLink.click();

    await expect(page).toHaveURL(/\/forgot-password$/);
  });

  test("respects redirect query parameter after successful login", async ({
    page,
  }) => {
    const mockUser = {
      id: "user-123",
      email: "dennis@example.com",
      fullName: "Dennis Jacob",
      role: "Public User",
    };

    await page.route("**/api/auth/login", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          success: true,
          token: "mock-jwt-token-12345",
          user: mockUser,
        }),
      });
    });

    await page.route("**/api/auth/me", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ success: true, user: mockUser }),
      });
    });

    await page.goto("/login?redirect=/dashboard/rescue-map");

    await page.locator('input[name="email"]').fill("dennis@example.com");
    await page.locator('input[name="password"]').fill("Password123!");
    await page.locator('button[type="submit"]').click();

    await expect(page).toHaveURL(/\/dashboard\/rescue-map$/);
  });
});
