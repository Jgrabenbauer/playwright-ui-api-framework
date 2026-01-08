import { Page, Locator } from '@playwright/test';

/**
 * InventoryPage - SauceDemo products/inventory page
 * Models shopping domain behavior
 */
export class InventoryPage {
  protected readonly page: Page;
  // Locators as first-class properties
  readonly pageTitle: Locator;
  readonly inventoryContainer: Locator;
  readonly shoppingCartBadge: Locator;
  readonly shoppingCartLink: Locator;
  readonly hamburgerMenu: Locator;
  readonly logoutLink: Locator;

  constructor(page: Page) {
    this.page = page;
    
    this.pageTitle = page.locator('[data-test="title"]');
    this.inventoryContainer = page.locator('[data-test="inventory-container"]');
    this.shoppingCartBadge = page.locator('[data-test="shopping-cart-badge"]');
    this.shoppingCartLink = page.locator('[data-test="shopping-cart-link"]');
    this.hamburgerMenu = page.locator('#react-burger-menu-btn');
    this.logoutLink = page.locator('#logout_sidebar_link');
  }

  /**
   * Get locator for specific product by name
   * Returns a Locator (first-class object), not a selector string
   */
  getProductByName(productName: string): Locator {
    return this.page.locator('[data-test="inventory-item"]', { hasText: productName });
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
   * Get add to cart button for a specific product
   */
  getAddToCartButton(productName: string): Locator {
    const productId = this.getProductDataTestId(productName);
    return this.page.locator(`[data-test="add-to-cart-${productId}"]`);
  }

  /**
   * Get remove button for a specific product
   */
  getRemoveButton(productName: string): Locator {
    const productId = this.getProductDataTestId(productName);
    return this.page.locator(`[data-test="remove-${productId}"]`);
  }

  /**
   * Domain method - add product to cart
   */
  async addItemToCart(productName: string): Promise<void> {
    const addButton = this.getAddToCartButton(productName);
    await addButton.click();
  }

  /**
   * Domain method - remove product from cart
   */
  async removeItemFromCart(productName: string): Promise<void> {
    const removeButton = this.getRemoveButton(productName);
    await removeButton.click();
  }

  /**
   * Domain method - get cart item count
   */
  async getCartItemCount(): Promise<number> {
    const isVisible = await this.shoppingCartBadge.isVisible();
    if (!isVisible) {
      return 0;
    }
    const count = await this.shoppingCartBadge.textContent();
    return parseInt(count || '0', 10);
  }

  /**
   * Domain method - navigate to cart
   */
  async goToCart(): Promise<void> {
    await this.shoppingCartLink.click();
  }

  /**
   * Domain method - logout
   */
  async logout(): Promise<void> {
    await this.hamburgerMenu.click();
    await this.logoutLink.click();
  }
}

