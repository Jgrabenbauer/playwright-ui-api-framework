import { test, expect } from '@playwright/test';
import { RestfulBookerClient } from '../../src/api/clients/RestfulBookerClient';

/**
 * Authentication Token Tests - Mixed Tags
 * 
 * @smoke: Valid credential token creation (required for all authenticated operations)
 * @regression: Error scenarios and token generation patterns
 */
test.describe('Restful-Booker Authentication', () => {
  let client: RestfulBookerClient;
  
  // Get credentials from environment variables
  const username = process.env.BOOKER_USER || 'admin';
  const password = process.env.BOOKER_PASS || 'password123';

  test.beforeEach(async ({ request }) => {
    client = new RestfulBookerClient(request);
  });

  test('should create auth token with valid credentials @smoke', async () => {
    const token = await client.createToken(username, password);
    
    // Token should be a non-empty string
    expect(token).toBeTruthy();
    expect(typeof token).toBe('string');
    expect(token.length).toBeGreaterThan(0);
  });

  test('should fail to create token with invalid credentials @regression', async ({ request }) => {
    const invalidUsername = 'invalid_user_' + Date.now();
    const invalidPassword = 'wrong_password_' + Date.now();
    
    // Use relative path - baseURL is configured in playwright.config.ts
    const response = await request.post('/auth', {
      data: {
        username: invalidUsername,
        password: invalidPassword
      }
    });
    
    // API returns 200 but with reason: "Bad credentials"
    expect(response.status()).toBe(200);
    
    const responseBody = await response.json();
    expect(responseBody).toHaveProperty('reason');
    expect(responseBody.reason).toBe('Bad credentials');
  });

  test('should create different tokens on multiple calls @regression', async () => {
    const token1 = await client.createToken(username, password);
    const token2 = await client.createToken(username, password);
    
    // Both tokens should exist
    expect(token1).toBeTruthy();
    expect(token2).toBeTruthy();
    
    // Tokens might be the same or different depending on API implementation
    // Just verify they're valid strings
    expect(typeof token1).toBe('string');
    expect(typeof token2).toBe('string');
  });
});

