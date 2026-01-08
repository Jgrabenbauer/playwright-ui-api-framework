import { Page, Locator, expect } from '@playwright/test';

/**
 * CheckoutPage - SauceDemo checkout flow (information, overview, complete)
 * Models checkout domain behavior across multiple steps
 */
export class CheckoutPage {
  protected readonly page: Page;
  // Step 1: Checkout Information form
  readonly firstNameInput: Locator;
  readonly lastNameInput: Locator;
  readonly postalCodeInput: Locator;
  readonly continueButton: Locator;
  
  // Step 2: Checkout Overview
  readonly finishButton: Locator;
  readonly cancelButton: Locator;
  
  // Step 3: Checkout Complete
  readonly completeHeader: Locator;
  readonly completeText: Locator;
  readonly backHomeButton: Locator;

  constructor(page: Page) {
    this.page = page;
    
    // Step 1: Information form locators
    this.firstNameInput = page.locator('[data-test="firstName"]');
    this.lastNameInput = page.locator('[data-test="lastName"]');
    this.postalCodeInput = page.locator('[data-test="postalCode"]');
    this.continueButton = page.locator('[data-test="continue"]');
    
    // Step 2: Overview locators
    this.finishButton = page.locator('[data-test="finish"]');
    this.cancelButton = page.locator('[data-test="cancel"]');
    
    // Step 3: Complete locators
    this.completeHeader = page.locator('[data-test="complete-header"]');
    this.completeText = page.locator('[data-test="complete-text"]');
    this.backHomeButton = page.locator('[data-test="back-to-products"]');
  }

  /**
   * Domain method - fill shipping information (Step 1)
   */
  async fillShippingInformation(firstName: string, lastName: string, postalCode: string): Promise<void> {
    await this.firstNameInput.fill(firstName);
    await this.lastNameInput.fill(lastName);
    await this.postalCodeInput.fill(postalCode);
    await this.continueButton.click();
  }

  /**
   * Domain method - finish checkout (Step 2 -> Step 3)
   */
  async finishCheckout(): Promise<void> {
    await this.finishButton.click();
  }

  /**
   * Domain method - cancel checkout
   */
  async cancelCheckout(): Promise<void> {
    await this.cancelButton.click();
  }

  /**
   * Domain method - return to products after checkout
   */
  async backToProducts(): Promise<void> {
    await this.backHomeButton.click();
  }

  /**
   * Domain-specific assertion helper - defensive pattern that prevents flakes
   * Combines visibility check with content verification (both must pass)
   * Expresses business intent rather than implementation details
   */
  async expectCheckoutComplete(): Promise<void> {
    await expect(this.completeHeader).toBeVisible();
    await expect(this.completeHeader).toHaveText('Thank you for your order!');
  }
}

