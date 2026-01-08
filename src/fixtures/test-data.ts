/**
 * Shared test data and fixtures for UI and API tests
 */

/**
 * SauceDemo user credentials
 */
export const sauceDemoUsers = {
  standard: {
    username: 'standard_user',
    password: 'secret_sauce',
  },
  locked: {
    username: 'locked_out_user',
    password: 'secret_sauce',
  },
  problem: {
    username: 'problem_user',
    password: 'secret_sauce',
  },
  performance: {
    username: 'performance_glitch_user',
    password: 'secret_sauce',
  },
  error: {
    username: 'error_user',
    password: 'secret_sauce',
  },
  visual: {
    username: 'visual_user',
    password: 'secret_sauce',
  },
};

/**
 * Sample booking data for Restful-booker API
 */
export const sampleBookings = {
  default: {
    firstname: 'John',
    lastname: 'Doe',
    totalprice: 150,
    depositpaid: true,
    bookingdates: {
      checkin: '2024-01-01',
      checkout: '2024-01-05',
    },
    additionalneeds: 'Breakfast',
  },
  extended: {
    firstname: 'Jane',
    lastname: 'Smith',
    totalprice: 500,
    depositpaid: false,
    bookingdates: {
      checkin: '2024-03-15',
      checkout: '2024-03-30',
    },
    additionalneeds: 'Late checkout',
  },
  minimal: {
    firstname: 'Bob',
    lastname: 'Wilson',
    totalprice: 100,
    depositpaid: true,
    bookingdates: {
      checkin: '2024-02-10',
      checkout: '2024-02-11',
    },
    additionalneeds: '',
  },
};

/**
 * Common test constants
 */
export const testConstants = {
  defaultTimeout: 30000,
  shortTimeout: 5000,
  apiTimeout: 10000,
};

/**
 * Generate a random booking with current dates
 */
export function generateRandomBooking() {
  const firstnames = ['Alice', 'Bob', 'Charlie', 'Diana', 'Edward'];
  const lastnames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones'];
  const additionalNeeds = ['Breakfast', 'Late checkout', 'Early checkin', 'Parking', ''];

  const checkinDate = new Date();
  checkinDate.setDate(checkinDate.getDate() + Math.floor(Math.random() * 30) + 1);
  const checkoutDate = new Date(checkinDate);
  checkoutDate.setDate(checkoutDate.getDate() + Math.floor(Math.random() * 10) + 1);

  return {
    firstname: firstnames[Math.floor(Math.random() * firstnames.length)],
    lastname: lastnames[Math.floor(Math.random() * lastnames.length)],
    totalprice: Math.floor(Math.random() * 500) + 100,
    depositpaid: Math.random() > 0.5,
    bookingdates: {
      checkin: checkinDate.toISOString().split('T')[0],
      checkout: checkoutDate.toISOString().split('T')[0],
    },
    additionalneeds: additionalNeeds[Math.floor(Math.random() * additionalNeeds.length)],
  };
}

/**
 * Generate unique email for testing
 */
export function generateUniqueEmail(prefix: string = 'test'): string {
  const timestamp = Date.now();
  return `${prefix}+${timestamp}@example.com`;
}

/**
 * Generate random string for testing
 */
export function generateRandomString(length: number = 10): string {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

