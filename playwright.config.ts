import { defineConfig, devices } from '@playwright/test';
import * as os from 'os';

/**
 * Read environment variables from .env file if present.
 * https://github.com/motdotla/dotenv
 */
require('dotenv').config({ quiet: true });

/**
 * Environment Configuration - Single Source of Truth
 * 
 * This config is the ONLY place where baseURL defaults should be defined.
 * The baseURL is injected into test contexts (Page and APIRequestContext) automatically.
 * 
 * Supported environment variables:
 * - UI_BASE_URL: Override for web UI testing (default: https://www.saucedemo.com)
 * - API_BASE_URL: Override for API testing (default: https://restful-booker.herokuapp.com)
 * - BOOKER_USER: API authentication username (default: admin)
 * - BOOKER_PASS: API authentication password (default: password123)
 * - CI: Set to 'true' or '1' for CI environment behavior
 * 
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
  testDir: './tests',
  
  /* Maximum time one test can run for */
  timeout: 30 * 1000,
  
  /* Run tests in files in parallel */
  fullyParallel: true,
  
  /* Fail the build on CI if you accidentally left test.only in the source code */
  forbidOnly: !!process.env.CI,
  
  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,
  
  /**
   * WORKER ALLOCATION STRATEGY - Critical for Scale
   * 
   * Workers run test files in parallel. Optimal count depends on:
   * 1. Test type (API = I/O bound, UI = CPU/memory bound)
   * 2. Environment (local = shared resources, CI = dedicated)
   * 3. Machine capacity (CPU cores, available memory)
   * 
   * TRADEOFFS:
   * - More workers = faster execution BUT higher resource contention
   * - API tests can handle high parallelism (lightweight, I/O bound)
   * - UI tests need headroom (each browser instance = ~100-200MB RAM, CPU for rendering)
   * 
   * LOCAL DEVELOPMENT:
   * - Use 50% of CPU cores (leave half for IDE, OS, active browser debugging)
   * - Preserves system responsiveness during test execution
   * - Example: 8-core machine → 4 workers
   * 
   * CI ENVIRONMENT:
   * - Use 100% of CPU cores (dedicated runner, no competing processes)
   * - Maximizes throughput for faster feedback
   * - Example: GitHub Actions 2-core runner → 2 workers
   * 
   * SHARDING READINESS:
   * When test suite exceeds ~50 tests or 15-minute runtime, enable sharding
   * to split execution across multiple CI jobs:
   * 
   * Example GitHub Actions matrix:
   *   strategy:
   *     matrix:
   *       shard: [1/4, 2/4, 3/4, 4/4]
   *   
   *   Command: playwright test --shard=${{ matrix.shard }}
   * 
   * With 100 tests and 4 shards (each with 8 workers):
   *   - Each shard runs ~25 tests in parallel (8 workers)
   *   - Total runtime: ~3-5 minutes (vs 12-15 minutes without sharding)
   * 
   * See: https://playwright.dev/docs/test-sharding
   */
  workers: process.env.CI 
    ? os.cpus().length  // CI: Full utilization of dedicated resources
    : Math.max(1, Math.floor(os.cpus().length / 2)),  // Local: Balanced (preserve dev experience)
  
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: process.env.CI 
    ? [
        ['html', { outputFolder: 'playwright-report' }],
        ['list'],
        ['junit', { outputFile: 'test-results/junit.xml' }]
      ]
    : [
        ['html', { outputFolder: 'playwright-report' }],
        ['list']
      ],
  
  /**
   * TEST EXECUTION SETTINGS - Optimized for Scale
   * 
   * Each test runs in isolated context (fresh browser/API context).
   * This isolation is CRITICAL for parallel execution at scale:
   * - Prevents state pollution between tests
   * - Enables safe parallelization without coordination
   * - Allows test execution in any order
   * 
   * ARTIFACT STRATEGY (scale consideration):
   * - trace: 'on-first-retry' → Only capture detailed traces on failures
   *   (full traces are ~5-10MB each, would balloon storage at 100+ tests)
   * - screenshot: 'only-on-failure' → Quick diagnostic without storage overhead
   * - video: 'retain-on-failure' → Full reproduction capability for failed tests
   * 
   * At 100 tests with 5% failure rate:
   * - Screenshots: ~5 images (~500KB)
   * - Videos: ~5 videos (~50MB)
   * - Traces: ~5 traces (~25-50MB)
   * Total: ~75-100MB (reasonable for CI artifact storage)
   */
  use: {
    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: 'on-first-retry',
    
    /* Screenshot on failure */
    screenshot: 'only-on-failure',
    
    /* Video on failure */
    video: 'retain-on-failure',
  },

  /**
   * PROJECT CONFIGURATION - UI and API Test Separation
   * 
   * Separating UI and API into distinct projects enables:
   * 1. Independent execution (npm run test:api vs test:ui)
   * 2. Different resource allocation (API tests can run with higher parallelism)
   * 3. Selective execution by tag (--grep @smoke --project=api)
   * 4. Clear test organization and reporting
   * 
   * SCALE IMPLICATIONS:
   * - At 100+ tests, you can run API smoke tests (~30sec) before UI tests
   * - CI can run API and UI in parallel GitHub Actions jobs
   * - API tests provide fast feedback loop (no browser overhead)
   * - UI tests isolated to visual regression and critical user flows
   */
  projects: [
    {
      name: 'ui',
      testMatch: /tests\/ui\/.*\.spec\.ts/,
      use: { 
        ...devices['Desktop Chrome'],
        // UI baseURL - SINGLE SOURCE OF TRUTH for web application URL
        baseURL: process.env.UI_BASE_URL || 'https://www.saucedemo.com',
        viewport: { width: 1280, height: 720 },
        actionTimeout: 10 * 1000,
        navigationTimeout: 30 * 1000,
      },
    },

    {
      name: 'api',
      testMatch: /tests\/api\/.*\.spec\.ts/,
      use: {
        // API baseURL - SINGLE SOURCE OF TRUTH for API endpoint
        baseURL: process.env.API_BASE_URL || 'https://restful-booker.herokuapp.com',
        extraHTTPHeaders: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
      },
    },
  ],
});

