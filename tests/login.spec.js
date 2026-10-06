import { test, expect } from "@playwright/test";

test.describe("Login Flow", () => {
  const mockUser = {
    id: "playwright-test-user",
    email: "test.user@example.com",
    fullName: "Alex Johnson",
    phoneNumber: "9876543210",
    role: "Public User",
    state: "Kerala",
    district: "Ernakulam",
    city: "Kochi",
    pincode: "682001",
    address: "123 Green Valley",
    dob: "1998-05-15",
  };

  test.beforeEach(async ({ page }) => {
    // Mock Session Restoration / Current User
    await page.route("**/api/auth/me", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          success: true,
          user: mockUser,
        }),
      });
    });

    // Mock Public Stats for AuthLayout
    await page.route("**/api/public/stats", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          success: true,
          stats: {
            animalsRescued: 120,
            partnerShelters: 15,
            petsAdopted: 85,
          },
        }),
      });
    });

    // Mock Dashboard API dependencies
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
        body: JSON.stringify({ success: true, animals: [] }),
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
    await page.locator('button[type="submit"]').click();

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
    await page.locator('button[type="submit"]').click();

    // Verify error banner is visible with expected message
    await expect(
      page.locator("text=Invalid email address or password"),
    ).toBeVisible();

    // Verify user remains on the login page
    await expect(page).toHaveURL(/\/login/);
  });

  test("logs in successfully with valid credentials and arrives at dashboard", async ({
    page,
  }) => {
    // Mock successful login API response
    await page.route("**/api/auth/login", async (route) => {
      const requestBody = route.request().postDataJSON();

      expect(requestBody).toMatchObject({
        email: "test.user@example.com",
        password: "password123",
      });

      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          success: true,
          token: "playwright-test-token",
          user: mockUser,
        }),
      });
    });

    await page.goto("/login");

    await page.locator('input[name="email"]').fill("test.user@example.com");
    await page.locator('input[name="password"]').fill("password123");
    await page.locator('button[type="submit"]').click();

    // Verify redirection to dashboard
    await expect(page).toHaveURL(/\/dashboard$/);
  });

  test("navigates to forgot password page when clicking link", async ({
    page,
  }) => {
    await page.goto("/login");

    const forgotPasswordLink = page.getByRole("link", {
      name: /forgot password\?/i,
    });
    await expect(forgotPasswordLink).toBeVisible();
    await forgotPasswordLink.click();

    await expect(page).toHaveURL(/\/forgot-password$/);
  });

  test("respects redirect query parameter after successful login", async ({
    page,
  }) => {
    // Mock successful login API response
    await page.route("**/api/auth/login", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          success: true,
          token: "playwright-test-token",
          user: mockUser,
        }),
      });
    });

    // Navigate to login with ?redirect=report query parameter
    await page.goto("/login?redirect=report");

    await page.locator('input[name="email"]').fill("test.user@example.com");
    await page.locator('input[name="password"]').fill("password123");
    await page.locator('button[type="submit"]').click();

    // Verify redirect preserves the tab destination
    await expect(page).toHaveURL(/\/dashboard\?tab=report$/);
  });
});
