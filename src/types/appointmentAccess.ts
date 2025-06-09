// src/types/appointmentAccess.ts

/**
 * Response interface for appointment access API
 */
export interface AppointmentAccessResponse {
    success: boolean;
    hasAccess: boolean;
    isFirstTime: boolean;
    timeRemaining: number; // in seconds
    accessExpired: boolean;
    subscriptionId?: string;
    message?: string;
    error?: string;
  }
  
  /**
   * Request interface for appointment access API
   */
  export interface AppointmentAccessRequest {
    userId: string;
  }
  
  /**
   * Database subscription interface for appointment access
   */
  export interface SubscriptionAppointmentData {
    id: string;
    user_id: string;
    has_appointment_access: boolean;
    appointment_accessed_at: string | null;
    appointment_access_expired: boolean;
    appointment_access_duration: number;
    is_active: boolean;
    status: string;
    plan_name: string;
    is_deleted: boolean;
    created_at: string;
    updated_at: string;
  }
  
  /**
   * Appointment access status for UI components
   */
  export interface AppointmentAccessStatus {
    hasAccess: boolean;
    isFirstTime: boolean;
    timeRemaining: number;
    accessExpired: boolean;
    subscriptionId?: string;
    lastAccessedAt?: string;
    message?: string;
  }
  
  /**
   * Appointment access error types
   */
  export type AppointmentAccessError = 
    | 'NOT_AUTHENTICATED'
    | 'NO_SUBSCRIPTION'
    | 'ACCESS_EXPIRED'
    | 'SERVER_ERROR'
    | 'INVALID_REQUEST';
  
  /**
   * Business logic constants
   */
  export const APPOINTMENT_ACCESS_CONSTANTS = {
    DEFAULT_DURATION_SECONDS: 1200, // 20 minutes
    DEFAULT_DURATION_MINUTES: 20,
    COUNTDOWN_UPDATE_INTERVAL: 1000, // 1 second
    STATUS_CHECK_INTERVAL: 30000, // 30 seconds
    VALID_SUBSCRIPTION_STATUSES: ['active', 'trialing', 'cancelling', 'past_due'] as const,
  } as const;
  
  /**
   * Subscription status type for appointment access
   */
  export type ValidSubscriptionStatus = typeof APPOINTMENT_ACCESS_CONSTANTS.VALID_SUBSCRIPTION_STATUSES[number];
  
  /**
   * Utility type for time formatting
   */
  export interface TimeFormat {
    minutes: number;
    seconds: number;
    formatted: string; // MM:SS format
  }
  
  /**
   * API endpoint paths
   */
  export const APPOINTMENT_ACCESS_ENDPOINTS = {
    CHECK_ACCESS: '/api/appointment-access',
    GET_STATUS: '/api/appointment-access',
  } as const;
  
  /**
   * Update constants to include endpoints
   */
  export const APPOINTMENT_ACCESS_CONSTANTS_WITH_ENDPOINTS = {
    ...APPOINTMENT_ACCESS_CONSTANTS,
    ENDPOINTS: APPOINTMENT_ACCESS_ENDPOINTS,
  } as const;