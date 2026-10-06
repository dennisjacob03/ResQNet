import { test, expect } from "@playwright/test";

test.describe("Registration Flow", () => {
  const mockUser = {
    id: "playwright-registered-user",
    email: "alex.johnson@example.com",
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
    // Enable Playwright test mode for Firebase Phone Auth
    await page.addInitScript(() => {
      window.__PLAYWRIGHT_TEST_MODE__ = true;
    });

    // Mock Send Email OTP
    await page.route("**/api/auth/send-otp", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          success: true,
          message: "A 6-digit verification code has been sent",
        }),
      });
    });

    // Mock Verify Email OTP
    await page.route("**/api/auth/verify-otp", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          success: true,
          message: "Email address verified successfully",
        }),
      });
    });

    // Mock Complete Registration
    await page.route("**/api/auth/register", async (route) => {
      const requestBody = route.request().postDataJSON();

      expect(requestBody).toMatchObject({
        fullName: "Alex Johnson",
        email: "alex.johnson@example.com",
        phoneNumber: "9876543210",
        role: "Public User",
        isPhoneVerified: true,
      });

      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          success: true,
          token: "playwright-registered-token",
          user: mockUser,
        }),
      });
    });

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

  test("shows validation errors when submitting empty form", async ({ page }) => {
    await page.goto("/register");

    // Click continue on empty form
    await page.locator('button[type="submit"]').click();

    // Verify validation errors are displayed
    await expect(page.locator("text=Full name is required")).toBeVisible();
    await expect(page.locator("text=Email address is required")).toBeVisible();
    await expect(page.locator("text=Phone number is required")).toBeVisible();
    await expect(page.locator("text=Password is required")).toBeVisible();
  });

  test("shows password mismatch validation error", async ({ page }) => {
    await page.goto("/register");

    await page.locator('input[name="password"]').fill("Password@123");
    await page.locator('input[name="confirmPassword"]').fill("Mismatch@123");
    await page.locator('input[name="confirmPassword"]').blur();

    await expect(page.locator("text=Passwords do not match")).toBeVisible();
  });

  test("completes full registration flow with dual phone and email verification", async ({ page }) => {
    await page.goto("/register");

    // 1. Fill Step 1 Form
    await page.locator('input[name="fullName"]').fill("Alex Johnson");
    await page.locator('input[name="email"]').fill("alex.johnson@example.com");
    await page.locator('input[name="phoneNumber"]').fill("9876543210");
    await page.locator('input[name="password"]').fill("Password@123");
    await page.locator('input[name="confirmPassword"]').fill("Password@123");

    // 2. Submit Step 1
    await page.locator('button[type="submit"]').click();

    // 3. Verify transition to Step 2 (Dual OTP Verification)
    await expect(page.getByRole("heading", { name: /dual otp verification required/i })).toBeVisible();
    await expect(page.getByText(/1\. phone number verification/i)).toBeVisible();
    await expect(page.getByText(/2\. email address verification/i)).toBeVisible();

    // 4. Verify Phone Code
    const phoneInput = page.locator('input[placeholder="123456"]');
    await phoneInput.fill("123456");
    await page.getByRole("button", { name: "Verify Phone" }).click();

    // Verify phone section shows Verified badge
    await expect(page.locator("text=Phone number verified successfully ✓")).toBeVisible();

    // 5. Verify Email Code
    const emailInput = page.locator('input[placeholder="000000"]');
    await emailInput.fill("654321");
    await page.getByRole("button", { name: "Verify Email" }).click();

    // Verify email section shows Verified badge
    await expect(page.locator("text=Email address verified successfully ✓")).toBeVisible();

    // 6. Complete Registration
    const completeBtn = page.getByRole("button", { name: /complete registration & login/i });
    await expect(completeBtn).toBeEnabled();
    await completeBtn.click();

    // 7. Verify Navigation to Dashboard
    await expect(page).toHaveURL(/\/dashboard$/);
  });
});
