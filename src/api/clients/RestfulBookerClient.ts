import { APIRequestContext, APIResponse } from '@playwright/test';
import {
  Booking,
  BookingResponse,
  CreateBookingRequest,
  UpdateBookingRequest,
  PartialUpdateBookingRequest,
  AuthCredentials,
  AuthTokenResponse
} from '../models/booking';

/**
 * RestfulBookerClient - Typed wrapper for Restful-Booker API
 * Thin, explicit client with dedicated methods for each endpoint
 * 
 * baseURL is inherited from APIRequestContext (configured in playwright.config.ts)
 * Do not pass baseURL unless you need to override the default configuration.
 */
export class RestfulBookerClient {
  private request: APIRequestContext;
  private baseURL: string;

  constructor(request: APIRequestContext, baseURL?: string) {
    this.request = request;
    // baseURL comes from Playwright config's APIRequestContext
    this.baseURL = baseURL || '';
  }

  /**
   * Health check - ping the API
   * Returns true if API is reachable (status 201)
   */
  async healthCheck(): Promise<boolean> {
    try {
      const response = await this.request.get(`${this.baseURL}/ping`);
      return response.status() === 201;
    } catch (error) {
      return false;
    }
  }

  /**
   * Create authentication token
   * @param username - API username
   * @param password - API password
   * @returns Auth token string
   */
  async createToken(username: string, password: string): Promise<string> {
    const credentials: AuthCredentials = { username, password };
    const response = await this.request.post(`${this.baseURL}/auth`, {
      data: credentials
    });
    
    const tokenResponse: AuthTokenResponse = await response.json();
    return tokenResponse.token;
  }

  /**
   * Create a new booking
   * @param bookingData - Booking details
   * @returns Booking response with ID
   */
  async createBooking(bookingData: CreateBookingRequest): Promise<BookingResponse> {
    const response = await this.request.post(`${this.baseURL}/booking`, {
      data: bookingData
    });
    
    return await response.json();
  }

  /**
   * Get booking by ID
   * @param bookingId - Booking ID
   * @returns Booking details
   */
  async getBooking(bookingId: number): Promise<Booking> {
    const response = await this.request.get(`${this.baseURL}/booking/${bookingId}`);
    return await response.json();
  }

  /**
   * Get booking by ID (returns full response for status checking)
   */
  async getBookingResponse(bookingId: number): Promise<APIResponse> {
    return await this.request.get(`${this.baseURL}/booking/${bookingId}`);
  }

  /**
   * Update booking (full replacement)
   * @param bookingId - Booking ID
   * @param bookingData - Complete booking data
   * @param token - Auth token
   * @returns Updated booking
   */
  async updateBooking(bookingId: number, bookingData: UpdateBookingRequest, token: string): Promise<Booking> {
    const response = await this.request.put(`${this.baseURL}/booking/${bookingId}`, {
      data: bookingData,
      headers: {
        'Cookie': `token=${token}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    });
    
    return await response.json();
  }

  /**
   * Partially update booking
   * @param bookingId - Booking ID
   * @param partialData - Partial booking data
   * @param token - Auth token
   * @returns Updated booking
   */
  async partialUpdateBooking(
    bookingId: number, 
    partialData: PartialUpdateBookingRequest, 
    token: string
  ): Promise<Booking> {
    const response = await this.request.patch(`${this.baseURL}/booking/${bookingId}`, {
      data: partialData,
      headers: {
        'Cookie': `token=${token}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    });
    
    return await response.json();
  }

  /**
   * Delete booking
   * @param bookingId - Booking ID
   * @param token - Auth token
   * @returns API Response
   */
  async deleteBooking(bookingId: number, token: string): Promise<APIResponse> {
    return await this.request.delete(`${this.baseURL}/booking/${bookingId}`, {
      headers: {
        'Cookie': `token=${token}`,
        'Content-Type': 'application/json'
      }
    });
  }
}

