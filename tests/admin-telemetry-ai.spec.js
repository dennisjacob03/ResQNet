import { test, expect } from "@playwright/test";

test.describe("Admin IoT Smart Collar & AI Vision Telemetry Suite", () => {
  const mockAdminUser = {
    id: "admin-test-user-id",
    fullName: "System Admin",
    email: "admin@resqnet.org",
    role: "Admin",
  };

  test.beforeEach(async ({ page }) => {
    // Pre-seed localStorage with Admin token and user details
    await page.addInitScript((admin) => {
      localStorage.setItem("resqnet_token", "mock-admin-jwt-token");
      localStorage.setItem("resqnet_user", JSON.stringify(admin));
    }, mockAdminUser);

    // Intercept backend requests
    await page.route("**/api/auth/me", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ success: true, user: mockAdminUser }),
      });
    });

    await page.route("**/api/users**", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ success: true, users: [mockAdminUser] }),
      });
    });

    await page.route("**/api/shelters**", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ success: true, shelters: [] }),
      });
    });

    await page.route("**/api/animals**", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ success: true, data: [] }),
      });
    });

    await page.route("**/api/notifications**", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ success: true, notifications: [] }),
      });
    });

    await page.route("**/api/rescue-requests**", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ success: true, data: [] }),
      });
    });
  });

  test("Admin can navigate to Smart Collar Telemetry Dashboard and simulate geofence breach", async ({
    page,
  }) => {
    await page.goto("/dashboard/smart-collar");
    await expect(page).toHaveURL(/\/dashboard\/smart-collar$/);

    // Verify header title
    const heading = page.getByRole("heading", { name: /Smart Collar Live Telemetry/i });
    await expect(heading).toBeVisible({ timeout: 10000 });

    // Verify animal unit tabs exist
    await expect(page.getByText(/Bruno/i).first()).toBeVisible();
    await expect(page.getByText(/Luna/i).first()).toBeVisible();
    await expect(page.getByText(/Max/i).first()).toBeVisible();

    // Test clicking Luna tab
    const lunaTabBtn = page.getByText(/Luna/i).first();
    await lunaTabBtn.click();
    await expect(page.getByText(/Telemetry Stream: Luna/i)).toBeVisible();

    // Click "Simulate Breach" button and verify geofence breach alert banner appears
    const simulateBreachBtn = page.getByRole("button", { name: /Simulate Breach/i });
    await simulateBreachBtn.click();
    await expect(page.getByText(/GEOFENCE BREACH ALERT/i).first()).toBeVisible();

    // Test clicking "Reset Safe Status" button
    const resetStatusBtn = page.getByRole("button", { name: /Reset Safe Status/i });
    await resetStatusBtn.click();
    await expect(page.getByText(/INSIDE SAFE ZONE/i).first()).toBeVisible();
  });

  test("Admin can navigate to AI Module and run AI diagnostic scans across clinical cases", async ({
    page,
  }) => {
    await page.goto("/dashboard/ai-module");
    await expect(page).toHaveURL(/\/dashboard\/ai-module$/);

    // Verify AI Vision Suite header
    const heading = page.getByRole("heading", { name: /AI Vision & Diagnostics Suite/i });
    await expect(heading).toBeVisible({ timeout: 10000 });

    // Verify pre-loaded clinical cases exist
    await expect(page.getByText(/Stray Dog - Limb Trauma/i).first()).toBeVisible();
    await expect(page.getByText(/Adoptable Golden Retriever/i).first()).toBeVisible();

    // Select "Adoptable Golden Retriever" test case
    const adoptableCaseBtn = page.getByText(/Adoptable Golden Retriever/i).first();
    await adoptableCaseBtn.click();

    // Verify severity grade updates to NORMAL
    await expect(page.getByText(/Triage Grade: NORMAL/i)).toBeVisible();
    await expect(page.getByText(/Passed AI Health Audit/i)).toBeVisible();

    // Click "Re-Run AI Scan" button
    const scanBtn = page.getByRole("button", { name: /Re-Run AI Scan/i });
    await scanBtn.click();

    // Select "Stray Dog - Limb Trauma" test case
    const traumaCaseBtn = page.getByText(/Stray Dog - Limb Trauma/i).first();
    await traumaCaseBtn.click();

    // Verify severity grade updates to CRITICAL
    await expect(page.getByText(/Triage Grade: CRITICAL/i)).toBeVisible();
    await expect(
      page.getByText(/Right Hind Limb Fracture/i).first()
    ).toBeVisible();
  });
});
