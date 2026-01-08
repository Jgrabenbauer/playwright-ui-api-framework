import { test, expect } from '@playwright/test';
import { RestfulBookerClient } from '../../src/api/clients/RestfulBookerClient';
import { sampleBookings } from '../../src/fixtures/test-data';
import { Booking } from '../../src/api/models/booking';

/**
 * CRUD Operations Tests - Mixed Tags
 * 
 * @smoke: Core CRUD operations (Create, Read) - critical business functionality
 * @regression: Extended operations (Update, Patch, Delete, Multi) - thorough coverage
 * 
 * TAG RATIONALE:
 * - Create/Read are foundational - if these fail, nothing else works
 * - Update/Delete are important but not blocking for initial deployment
 * - Multi-booking tests validate data isolation at scale
 */
test.describe('Restful-Booker CRUD Operations', () => {
  let client: RestfulBookerClient;
  let authToken: string;
  const createdBookingIds: number[] = [];
  
  // Get credentials from environment
  const username = process.env.BOOKER_USER || 'admin';
  const password = process.env.BOOKER_PASS || 'password123';

  test.beforeAll(async ({ request }) => {
    // Create client and get auth token for update/delete operations
    const tempClient = new RestfulBookerClient(request);
    authToken = await tempClient.createToken(username, password);
    
    expect(authToken).toBeTruthy();
  });

  test.beforeEach(async ({ request }) => {
    client = new RestfulBookerClient(request);
  });

  test.afterEach(async () => {
    // Cleanup: Delete all bookings created during tests
    for (const bookingId of createdBookingIds) {
      try {
        await client.deleteBooking(bookingId, authToken);
      } catch (error) {
        // Defensive: Ignore cleanup errors - booking might already be deleted
        // or API might be temporarily unavailable. Cleanup is best-effort.
        console.log(`Cleanup: Could not delete booking ${bookingId}`);
      }
    }
    // Clear the array
    createdBookingIds.length = 0;
  });

  test('should create a new booking @smoke', async () => {
    // Defensive: Timestamp-based uniqueness prevents collisions when tests run in parallel
    // or when multiple developers/CI pipelines target the same environment
    const timestamp = Date.now();
    const bookingData = {
      ...sampleBookings.default,
      firstname: `Test_${timestamp}`,
      lastname: 'User'
    };
    
    const response = await client.createBooking(bookingData);
    
    // Validate response structure
    expect(response).toHaveProperty('bookingid');
    expect(response).toHaveProperty('booking');
    expect(response.bookingid).toBeGreaterThan(0);
    
    // Validate booking data
    expect(response.booking.firstname).toBe(bookingData.firstname);
    expect(response.booking.lastname).toBe(bookingData.lastname);
    expect(response.booking.totalprice).toBe(bookingData.totalprice);
    expect(response.booking.depositpaid).toBe(bookingData.depositpaid);
    
    // Store for cleanup
    createdBookingIds.push(response.bookingid);
  });

  test('should get booking by ID @smoke', async () => {
    // Create a booking first
    const timestamp = Date.now();
    const bookingData = {
      ...sampleBookings.default,
      firstname: `GetTest_${timestamp}`,
      lastname: 'User'
    };
    
    const createResponse = await client.createBooking(bookingData);
    createdBookingIds.push(createResponse.bookingid);
    
    // Get the booking
    const booking = await client.getBooking(createResponse.bookingid);
    
    // Validate retrieved booking matches created data
    expect(booking.firstname).toBe(bookingData.firstname);
    expect(booking.lastname).toBe(bookingData.lastname);
    expect(booking.totalprice).toBe(bookingData.totalprice);
    expect(booking.depositpaid).toBe(bookingData.depositpaid);
    expect(booking.bookingdates.checkin).toBe(bookingData.bookingdates.checkin);
    expect(booking.bookingdates.checkout).toBe(bookingData.bookingdates.checkout);
  });

  test('should update booking with PUT @regression', async () => {
    // Create a booking
    const timestamp = Date.now();
    const initialData = {
      ...sampleBookings.default,
      firstname: `Initial_${timestamp}`
    };
    
    const createResponse = await client.createBooking(initialData);
    createdBookingIds.push(createResponse.bookingid);
    
    // Update the booking
    const updatedData: Booking = {
      firstname: `Updated_${timestamp}`,
      lastname: 'NewLastName',
      totalprice: 999,
      depositpaid: false,
      bookingdates: {
        checkin: '2024-12-01',
        checkout: '2024-12-10'
      },
      additionalneeds: 'Updated needs'
    };
    
    const updatedBooking = await client.updateBooking(
      createResponse.bookingid,
      updatedData,
      authToken
    );
    
    // Validate update
    expect(updatedBooking.firstname).toBe(updatedData.firstname);
    expect(updatedBooking.lastname).toBe(updatedData.lastname);
    expect(updatedBooking.totalprice).toBe(updatedData.totalprice);
    expect(updatedBooking.depositpaid).toBe(updatedData.depositpaid);
    
    // Verify by getting the booking again
    const retrievedBooking = await client.getBooking(createResponse.bookingid);
    expect(retrievedBooking.firstname).toBe(updatedData.firstname);
  });

  test('should partially update booking with PATCH @regression', async () => {
    // Create a booking
    const timestamp = Date.now();
    const initialData = {
      ...sampleBookings.default,
      firstname: `PatchTest_${timestamp}`,
      lastname: 'OriginalLast'
    };
    
    const createResponse = await client.createBooking(initialData);
    createdBookingIds.push(createResponse.bookingid);
    
    // Partially update only firstname and totalprice
    const partialUpdate = {
      firstname: `PartiallyUpdated_${timestamp}`,
      totalprice: 777
    };
    
    const updatedBooking = await client.partialUpdateBooking(
      createResponse.bookingid,
      partialUpdate,
      authToken
    );
    
    // Validate partial update
    expect(updatedBooking.firstname).toBe(partialUpdate.firstname);
    expect(updatedBooking.totalprice).toBe(partialUpdate.totalprice);
    
    // Original lastname should remain unchanged
    expect(updatedBooking.lastname).toBe(initialData.lastname);
  });

  test('should delete booking @regression', async () => {
    // Create a booking
    const timestamp = Date.now();
    const bookingData = {
      ...sampleBookings.default,
      firstname: `DeleteTest_${timestamp}`
    };
    
    const createResponse = await client.createBooking(bookingData);
    const bookingId = createResponse.bookingid;
    
    // Delete the booking
    const deleteResponse = await client.deleteBooking(bookingId, authToken);
    
    // Validate delete response (should be 201)
    expect(deleteResponse.status()).toBe(201);
    
    // Defensive: Verify deletion by attempting retrieval - should 404
    const getResponse = await client.getBookingResponse(bookingId);
    expect(getResponse.status()).toBe(404);
    
    // Don't add to cleanup array since already deleted
  });

  test('should handle multiple bookings independently @regression', async () => {
    const timestamp = Date.now();
    
    // Create three bookings
    const booking1 = await client.createBooking({
      ...sampleBookings.default,
      firstname: `Multi1_${timestamp}`
    });
    
    const booking2 = await client.createBooking({
      ...sampleBookings.extended,
      firstname: `Multi2_${timestamp}`
    });
    
    const booking3 = await client.createBooking({
      ...sampleBookings.minimal,
      firstname: `Multi3_${timestamp}`
    });
    
    // Store all for cleanup
    createdBookingIds.push(booking1.bookingid, booking2.bookingid, booking3.bookingid);
    
    // Verify all three exist and are different
    expect(booking1.bookingid).not.toBe(booking2.bookingid);
    expect(booking2.bookingid).not.toBe(booking3.bookingid);
    expect(booking1.bookingid).not.toBe(booking3.bookingid);
    
    // Verify data integrity
    const retrieved1 = await client.getBooking(booking1.bookingid);
    const retrieved2 = await client.getBooking(booking2.bookingid);
    const retrieved3 = await client.getBooking(booking3.bookingid);
    
    expect(retrieved1.firstname).toContain('Multi1_');
    expect(retrieved2.firstname).toContain('Multi2_');
    expect(retrieved3.firstname).toContain('Multi3_');
  });
});

