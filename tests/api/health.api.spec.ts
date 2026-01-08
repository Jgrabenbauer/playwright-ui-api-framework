import { test, expect } from '@playwright/test';
import { RestfulBookerClient } from '../../src/api/clients/RestfulBookerClient';

/**
 * Health Check Tests - Tagged @smoke
 * 
 * Quick validation that API is reachable and responding.
 * These tests should run on every PR and before deployment.
 * 
 * Execution time: <5 seconds
 * Purpose: Fast feedback on API availability
 */
test.describe('Restful-Booker Health Check @smoke', () => {
  let client: RestfulBookerClient;

  test.beforeEach(async ({ request }) => {
    client = new RestfulBookerClient(request);
  });

  test('should return 201 from ping endpoint', async ({ request }) => {
    // Use relative path - baseURL is configured in playwright.config.ts
    const response = await request.get('/ping');
    
    expect(response.status()).toBe(201);
  });

  test('should confirm API is reachable via healthCheck', async () => {
    const isHealthy = await client.healthCheck();
    
    expect(isHealthy).toBe(true);
  });
});

