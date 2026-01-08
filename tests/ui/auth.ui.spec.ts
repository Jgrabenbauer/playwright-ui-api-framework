import { test, expect } from '@playwright/test';
import { LoginPage } from '../../src/ui/pages/LoginPage';
import { InventoryPage } from '../../src/ui/pages/InventoryPage';
import { sauceDemoUsers } from '../../src/fixtures/test-data';

/**
 * Authentication Tests - Mixed Tags
 * 
 * @smoke: Critical path authentication (successful login/logout)
 * @regression: Error scenarios and edge cases
 * 
 * TAG STRATEGY:
 * - Smoke tests run on every PR (~30-60 seconds)
 * - Regression tests run nightly and pre-release
 */
test.describe('SauceDemo Authentication', () => {
  test('should login successfully with valid credentials @smoke', async ({ page }) => {
    const loginPage = new LoginPage(page);
    
    // Navigate using relative path - baseURL from config
    await page.goto('/');
    
    // Domain method - no low-level wrappers
    await loginPage.login(sauceDemoUsers.standard.username, sauceDemoUsers.standard.password);
    
    // Defensive: Regex pattern tolerates baseURL variations - prevents flakes when testing
    // against different environments (local dev, staging, production)
    await expect(page).toHaveURL(/.*inventory.html/);
    
    // Verify inventory page loaded
    const inventoryPage = new InventoryPage(page);
    await expect(inventoryPage.pageTitle).toBeVisible();
    await expect(inventoryPage.pageTitle).toHaveText('Products');
  });

  test('should show error message for locked out user @regression', async ({ page }) => {
    const loginPage = new LoginPage(page);
    
    await page.goto('/');
    await loginPage.login(sauceDemoUsers.locked.username, sauceDemoUsers.locked.password);
    
    // Assertions use Playwright expect - auto-waits
    await expect(loginPage.errorMessage).toBeVisible();
    await expect(loginPage.errorMessage).toContainText('Epic sadface: Sorry, this user has been locked out');
  });

  test('should show error for invalid credentials @regression', async ({ page }) => {
    const loginPage = new LoginPage(page);
    
    await page.goto('/');
    await loginPage.login('invalid_user', 'wrong_password');
    
    await expect(loginPage.errorMessage).toBeVisible();
    await expect(loginPage.errorMessage).toContainText('Username and password do not match');
  });

  test('should logout successfully @smoke', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const inventoryPage = new InventoryPage(page);
    
    // Login first
    await page.goto('/');
    await loginPage.loginAsStandardUser();
    
    // Verify we're on inventory page
    await expect(page).toHaveURL(/.*inventory.html/);
    
    // Logout - domain method
    await inventoryPage.logout();
    
    // Assert redirected to login page
    await expect(page).toHaveURL(/.*\/$/);
    await expect(loginPage.loginButton).toBeVisible();
  });

  test('should allow login after logout @regression', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const inventoryPage = new InventoryPage(page);
    
    // First login
    await page.goto('/');
    await loginPage.loginAsStandardUser();
    await expect(page).toHaveURL(/.*inventory.html/);
    
    // Logout
    await inventoryPage.logout();
    await expect(page).toHaveURL(/.*\/$/);
    
    // Login again
    await loginPage.loginAsStandardUser();
    await expect(page).toHaveURL(/.*inventory.html/);
    await expect(inventoryPage.pageTitle).toHaveText('Products');
  });
});

