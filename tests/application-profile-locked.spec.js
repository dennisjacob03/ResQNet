import { test, expect } from "@playwright/test";

test.describe("Application Forms Profile Sync & Inactive State", () => {
  test.beforeEach(async ({ page }) => {
    // Mock user profile details
    const mockUser = {
      _id: "user-profile-test-123",
      fullName: "Anoop Narayanan",
      email: "anoop.narayanan@example.com",
      phoneNumber: "9847123456",
      district: "Ernakulam",
      city: "Aluva",
      state: "Kerala",
      address: "House #42, Netaji Road, Aluva",
      role: "Public User",
      isPhoneVerified: true,
      dob: "1995-05-15T00:00:00.000Z",
      pincode: "683101",
    };

    await page.route("**/api/auth/me", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ success: true, user: mockUser }),
      });
    });

    await page.route("**/api/auth/login", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          success: true,
          token: "mock-test-jwt-token-12345",
          user: mockUser,
        }),
      });
    });

    await page.route("**/api/notifications**", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          success: true,
          notifications: [],
          unreadCount: 0,
        }),
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

    await page.route("**/api/volunteers/my-application", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          success: true,
          application: null,
          applications: [],
        }),
      });
    });

    await page.route("**/api/rescue-teams/my-application", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          success: true,
          application: null,
          applications: [],
        }),
      });
    });

    await page.route("**/api/veterinary/my-application", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ success: true, application: null }),
      });
    });

    await page.route("**/api/shelters/my-application", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          success: true,
          application: null,
          applications: [],
        }),
      });
    });

    // Login and navigate to dashboard
    await page.goto("/login");
    await page
      .locator('input[name="email"]')
      .fill("anoop.narayanan@example.com");
    await page.locator('input[name="password"]').fill("password123");
    await page.locator('button[type="submit"]').click();
    await expect(page).toHaveURL(/\/dashboard$/);
  });

  test("Volunteer application locks all profile-backed fields", async ({
    page,
  }) => {
    // Navigate to Volunteer tab
    await page.goto("/dashboard/volunteer");
    await expect(page).toHaveURL(/\/dashboard\/volunteer$/);

    // Verify info banner is visible
    await expect(page.getByText(/Profile-linked details/i)).toBeVisible();

    // Verify fullName is prefilled and disabled/readonly
    const nameInput = page.locator('input[placeholder="e.g. Dennis Jacob"]');
    await expect(nameInput).toHaveValue("Anoop Narayanan");
    await expect(nameInput).toBeDisabled();

    // Verify email is prefilled and disabled/readonly
    const emailInput = page.locator(
      'input[placeholder="e.g. volunteer@example.com"]',
    );
    await expect(emailInput).toHaveValue("anoop.narayanan@example.com");
    await expect(emailInput).toBeDisabled();

    // Verify phone is prefilled and disabled/readonly
    const phoneInput = page.locator('input[placeholder="e.g. 9876543210"]');
    await expect(phoneInput).toHaveValue("9847123456");
    await expect(phoneInput).toBeDisabled();

    // Verify district select is disabled
    const districtSelect = page.locator("select").first();
    await expect(districtSelect).toHaveValue("Ernakulam");
    await expect(districtSelect).toBeDisabled();

    // Verify city input is disabled
    const cityInput = page.locator('input[placeholder="e.g. Aluva, Kochi"]');
    await expect(cityInput).toHaveValue("Aluva");
    await expect(cityInput).toBeDisabled();

    // Verify residential address is disabled
    const addressInput = page.locator(
      'input[placeholder="Street address, building, or landmark"]',
    );
    await expect(addressInput).toHaveValue("House #42, Netaji Road, Aluva");
    await expect(addressInput).toBeDisabled();
  });

  test("Rescue Team application keeps team contact fields independent from profile", async ({
    page,
  }) => {
    await page.goto("/dashboard/rescue");
    await expect(page).toHaveURL(/\/dashboard\/rescue$/);

    // Verify team leader name is prefilled and disabled
    const leadInput = page.locator('input[placeholder="e.g. Rahul Nair"]');
    await expect(leadInput).toHaveValue("Anoop Narayanan");
    await expect(leadInput).toBeDisabled();

    // Official team contact phone is independent from the applicant profile
    const phoneInput = page.locator('input[placeholder="e.g. 9876543210"]');
    await expect(phoneInput).toBeEnabled();

    // Official team email is independent from the applicant profile
    const emailInput = page.locator(
      'input[placeholder="e.g. rescue@resqnet.org"]',
    );
    await expect(emailInput).toBeEnabled();

    // Verify non-profile field (Team Name) remains active and editable
    const teamNameInput = page.locator(
      'input[placeholder="e.g. Ernakulam Animal Emergency Responders"]',
    );
    await expect(teamNameInput).toBeEnabled();
    await teamNameInput.fill("Kochi Animal Rescue Unit");
    await expect(teamNameInput).toHaveValue("Kochi Animal Rescue Unit");
  });

  test("Veterinary Staff application locks candidate profile fields", async ({
    page,
  }) => {
    await page.goto("/dashboard/vet");
    await expect(page).toHaveURL(/\/dashboard\/vet$/);

    // Verify candidate name is prefilled and disabled
    const vetNameInput = page.locator('input[placeholder="Dr. Rajesh Nair"]');
    await expect(vetNameInput).toHaveValue("Anoop Narayanan");
    await expect(vetNameInput).toBeDisabled();

    // Verify email and phone in dashboard credentials section are disabled
    const vetEmailInput = page.locator(
      'input[placeholder="doctor@clinic.com"]',
    );
    await expect(vetEmailInput).toHaveValue("anoop.narayanan@example.com");
    await expect(vetEmailInput).toBeDisabled();

    const vetPhoneInput = page.locator('input[placeholder="9876543210"]');
    await expect(vetPhoneInput).toHaveValue("9847123456");
    await expect(vetPhoneInput).toBeDisabled();
  });

  test("Shelter application locks applicant email and contact phone", async ({
    page,
  }) => {
    await page.goto("/dashboard/shelter");
    await expect(page).toHaveURL(/\/dashboard\/shelter$/);

    // Verify shelter email is prefilled and disabled
    const shelterEmailInput = page.locator(
      'input[placeholder="shelter@example.com"]',
    );
    await expect(shelterEmailInput).toHaveValue("anoop.narayanan@example.com");
    await expect(shelterEmailInput).toBeDisabled();

    // Verify contact phone is prefilled and disabled
    const shelterPhoneInput = page.locator(
      'input[placeholder="10-digit mobile number"]',
    );
    await expect(shelterPhoneInput).toHaveValue("9847123456");
    await expect(shelterPhoneInput).toBeDisabled();

    // Verify non-profile field (Shelter Name) remains editable
    const shelterNameInput = page.locator(
      'input[placeholder="e.g. Paws & Care Animal Shelter"]',
    );
    await expect(shelterNameInput).toBeEnabled();
    await shelterNameInput.fill("Aluva Pet Sanctuary");
    await expect(shelterNameInput).toHaveValue("Aluva Pet Sanctuary");
  });
});
