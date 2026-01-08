/**
 * TypeScript interfaces for Restful-booker API
 * Documentation: https://restful-booker.herokuapp.com/apidoc/index.html
 */

/**
 * Booking dates interface
 */
export interface BookingDates {
  checkin: string;
  checkout: string;
}

/**
 * Booking interface - represents a booking object
 */
export interface Booking {
  firstname: string;
  lastname: string;
  totalprice: number;
  depositpaid: boolean;
  bookingdates: BookingDates;
  additionalneeds?: string;
}

/**
 * Booking response interface - includes booking ID
 */
export interface BookingResponse {
  bookingid: number;
  booking: Booking;
}

/**
 * Create booking request interface
 */
export interface CreateBookingRequest extends Booking {}

/**
 * Update booking request interface
 */
export interface UpdateBookingRequest extends Booking {}

/**
 * Partial update booking request interface
 */
export interface PartialUpdateBookingRequest extends Partial<Booking> {}

/**
 * Get booking response interface (single booking)
 */
export interface GetBookingResponse extends Booking {}

/**
 * Auth token response
 */
export interface AuthTokenResponse {
  token: string;
}

/**
 * Auth credentials request
 */
export interface AuthCredentials {
  username: string;
  password: string;
}

/**
 * Booking IDs list item
 */
export interface BookingIdItem {
  bookingid: number;
}

/**
 * Query parameters for filtering bookings
 */
export interface BookingQueryParams {
  firstname?: string;
  lastname?: string;
  checkin?: string;
  checkout?: string;
}

