import { Page, Locator } from '@playwright/test';

/**
 * LoginPage - SauceDemo login page
 * Models domain behavior, uses Locators as first-class objects
 */
export class LoginPage {
  protected readonly page: Page;
  // Locators defined as class properties - Playwright best practice
  readonly usernameInput: Locator;
  readonly passwordInput: Locator;
  readonly loginButton: Locator;
  readonly errorMessage: Locator;

  constructor(page: Page) {
    this.page = page;
    
    // Define locators using data-test attributes (SauceDemo uses these)
    this.usernameInput = page.locator('[data-test="username"]');
    this.passwordInput = page.locator('[data-test="password"]');
    this.loginButton = page.locator('[data-test="login-button"]');
    this.errorMessage = page.locator('[data-test="error"]');
  }

  /**
   * Domain method - login with credentials
   * No unnecessary wrappers - uses Locator methods directly
   */
  async login(username: string, password: string): Promise<void> {
    await this.usernameInput.fill(username);
    await this.passwordInput.fill(password);
    await this.loginButton.click();
  }

  /**
   * Domain method - login as standard user
   */
  async loginAsStandardUser(): Promise<void> {
    await this.login('standard_user', 'secret_sauce');
  }
}

