// tests/navigation.spec.js
import { test, expect } from '@playwright/test';

test.describe('ResQNet Homepage & Navigation', () => {
  test('should load the homepage successfully', async ({ page }) => {
    // Navigate to base URL (http://localhost:5173)
    await page.goto('/');

    // Check page title or navbar presence
    await expect(page).toHaveTitle(/ResQNet/i);
    await expect(page.locator('nav')).toBeVisible();
  });

  test('should navigate to login page', async ({ page }) => {
    await page.goto('/');

    // Find and click the login link/button
    const loginBtn = page.getByRole('link', { name: /login/i });
    await loginBtn.click();

    // Verify URL change
    await expect(page).toHaveURL(/\/login/);
  });

  test('should support back and forward browser navigation across dashboard tabs', async ({ page }) => {
    const mockUser = {
      id: "playwright-test-user",
      email: "test.user@example.com",
      role: "Public User",
      fullName: "Test User",
      phoneNumber: "9876543210",
      state: "Kerala",
      district: "Ernakulam",
      city: "Kochi",
      pincode: "682001",
      address: "123 Test Street",
      dob: "1995-01-01",
    };

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
        body: JSON.stringify({ success: true, data: [] }),
      });
    });

    // 1. Login and arrive at /dashboard
    await page.goto("/login");
    await page.locator('input[name="email"]').fill("test.user@example.com");
    await page.locator('input[name="password"]').fill("password123");
    await page.locator('button[type="submit"]').click();

    await expect(page).toHaveURL(/\/dashboard$/);

    // 2. Click "Rescue & Shelter Map" tab -> URL updates to /dashboard/rescue-map
    const mapTabBtn = page.getByRole('button', { name: 'Rescue & Shelter Map' }).first();
    await mapTabBtn.click();
    await expect(page).toHaveURL(/\/dashboard\/rescue-map$/);

    // 3. Click "Adopt a Pet" tab -> URL updates to /dashboard/adopt-pet
    const adoptTabBtn = page.getByRole('button', { name: 'Adopt a Pet' }).first();
    await adoptTabBtn.click();
    await expect(page).toHaveURL(/\/dashboard\/adopt-pet$/);

    // 4. Click browser BACK button -> URL should go back to /dashboard/rescue-map
    await page.goBack();
    await expect(page).toHaveURL(/\/dashboard\/rescue-map$/);

    // 5. Click browser BACK button again -> URL should go back to /dashboard
    await page.goBack();
    await expect(page).toHaveURL(/\/dashboard$/);

    // 6. Click browser FORWARD button -> URL should advance to /dashboard/rescue-map
    await page.goForward();
    await expect(page).toHaveURL(/\/dashboard\/rescue-map$/);

    // 7. Click browser FORWARD button again -> URL should advance to /dashboard/adopt-pet
    await page.goForward();
    await expect(page).toHaveURL(/\/dashboard\/adopt-pet$/);
  });

  test('should deep-link directly into dashboard sub-pages', async ({ page }) => {
    const mockUser = {
      id: "playwright-test-user",
      email: "test.user@example.com",
      role: "Public User",
      fullName: "Test User",
      phoneNumber: "9876543210",
      state: "Kerala",
      district: "Ernakulam",
      city: "Kochi",
      pincode: "682001",
      address: "123 Test Street",
      dob: "1995-01-01",
    };

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
        body: JSON.stringify({ success: true, data: [] }),
      });
    });

    // Set auth token in localStorage so user is recognized as logged in
    await page.addInitScript(() => {
      localStorage.setItem("resqnet_token", "playwright-test-token");
      localStorage.setItem(
        "resqnet_user",
        JSON.stringify({
          id: "playwright-test-user",
          email: "test.user@example.com",
          role: "Public User",
          fullName: "Test User",
        })
      );
    });

    // Direct navigate to /dashboard/rescue-map
    await page.goto("/dashboard/rescue-map");
    await expect(page).toHaveURL(/\/dashboard\/rescue-map$/);

    // Verify the map tab button is marked active
    const mapTabBtn = page.getByRole('button', { name: 'Rescue & Shelter Map' });
    await expect(mapTabBtn).toHaveClass(/bg-\[#237737\]/);
  });
});