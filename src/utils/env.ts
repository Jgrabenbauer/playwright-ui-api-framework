/**
 * Runtime Environment Configuration
 * 
 * This module handles runtime configuration for test execution, such as credentials.
 * 
 * NOTE: baseURL configuration is handled in playwright.config.ts, not here.
 * Playwright's config is the single source of truth for infrastructure URLs.
 * 
 * This file focuses on test runtime settings like authentication credentials
 * and CI environment detection.
 */

export interface EnvironmentConfig {
  bookerUser: string;
  bookerPass: string;
  isCI: boolean;
}

/**
 * Load runtime environment configuration
 * Returns test credentials and CI detection
 */
export function loadEnvironmentConfig(): EnvironmentConfig {
  const bookerUser = process.env.BOOKER_USER || 'admin';
  const bookerPass = process.env.BOOKER_PASS || 'password123';
  const isCI = process.env.CI === 'true' || process.env.CI === '1';

  return {
    bookerUser,
    bookerPass,
    isCI,
  };
}

/**
 * Get a specific environment variable with optional default
 */
export function getEnvVar(name: string, defaultValue?: string): string {
  const value = process.env[name];
  if (value === undefined) {
    if (defaultValue !== undefined) {
      return defaultValue;
    }
    throw new Error(`Required environment variable ${name} is not set`);
  }
  return value;
}

/**
 * Check if running in CI environment
 */
export function isCI(): boolean {
  return process.env.CI === 'true' || process.env.CI === '1';
}

// Export a singleton instance of the runtime configuration
export const env = loadEnvironmentConfig();

