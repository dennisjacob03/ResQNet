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
});