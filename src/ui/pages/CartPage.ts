import { Page, Locator } from '@playwright/test';

/**
 * CartPage - SauceDemo shopping cart page
 * Models cart domain behavior
 */
export class CartPage {
  protected readonly page: Page;
  // Locators as first-class properties
  readonly cartItems: Locator;
  readonly checkoutButton: Locator;
  readonly continueShoppingButton: Locator;
  readonly cartItemNames: Locator;

  constructor(page: Page) {
    this.page = page;
    
    this.cartItems = page.locator('[data-test="inventory-item"]');
    this.checkoutButton = page.locator('[data-test="checkout"]');
    this.continueShoppingButton = page.locator('[data-test="continue-shopping"]');
    this.cartItemNames = page.locator('[data-test="inventory-item-name"]');
  }

  /**
   * Convert product name to data-test ID
   */
  private getProductDataTestId(productName: string): string {
    const idMap: Record<string, string> = {
      'Sauce Labs Backpack': 'sauce-labs-backpack',
      'Sauce Labs Bike Light': 'sauce-labs-bike-light',
      'Sauce Labs Bolt T-Shirt': 'sauce-labs-bolt-t-shirt',
      'Sauce Labs Fleece Jacket': 'sauce-labs-fleece-jacket',
      'Sauce Labs Onesie': 'sauce-labs-onesie',
      'Test.allTheThings() T-Shirt (Red)': 'test.allthethings()-t-shirt-(red)',
    };
    return idMap[productName] || productName.toLowerCase().replace(/\s+/g, '-');
  }

  /**
   * Get locator for remove button of specific item
   */
  getRemoveButtonForItem(productName: string): Locator {
    const productId = this.getProductDataTestId(productName);
    return this.page.locator(`[data-test="remove-${productId}"]`);
  }

  /**
   * Domain method - proceed to checkout
   */
  async proceedToCheckout(): Promise<void> {
    await this.checkoutButton.click();
  }

  /**
   * Domain method - continue shopping
   */
  async continueShopping(): Promise<void> {
    await this.continueShoppingButton.click();
  }

  /**
   * Domain method - remove item from cart
   */
  async removeItem(productName: string): Promise<void> {
    const removeButton = this.getRemoveButtonForItem(productName);
    await removeButton.click();
  }

  /**
   * Helper - get all cart item names
   */
  async getCartItemNames(): Promise<string[]> {
    return await this.cartItemNames.allTextContents();
  }
}

