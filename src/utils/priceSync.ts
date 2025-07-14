// src/utils/priceSync.ts
import type { 
  StripeIntervalConfig, 
  SanityVariant, 
  SanitySubscription 
} from '@/types/admin-price-sync';
import { formatPriceDisplay } from './subscriptionHelpers';

/**
 * Convert Sanity billing period to Stripe interval configuration
 */
export function getStripeIntervalConfig(
  billingPeriod: string,
  customBillingPeriodMonths?: number | null
): StripeIntervalConfig {
  let interval: 'month' | 'year' = 'month';
  let intervalCount = 1;

  switch (billingPeriod) {
    case 'monthly':
      interval = 'month';
      intervalCount = 1;
      break;
    case 'three_month':
      interval = 'month';
      intervalCount = 3;
      break;
    case 'six_month':
      interval = 'month';
      intervalCount = 6;
      break;
    case 'annually':
      interval = 'year';
      intervalCount = 1;
      break;
    case 'other':
      interval = 'month';
      intervalCount = customBillingPeriodMonths || 1;

      // Stripe limits: month (max 12), year (max 3)
      if (intervalCount > 12) {
        if (intervalCount % 12 === 0) {
          interval = 'year';
          intervalCount = intervalCount / 12;
        } else {
          console.warn(`Billing period of ${intervalCount} months exceeds Stripe's limit. Capping at 12 months.`);
          intervalCount = 12;
        }
      }
      break;
    default:
      interval = 'month';
      intervalCount = 1;
  }

  return { interval, intervalCount };
}

/**
 * Generate unique item key for sync tracking
 */
export function generateItemKey(subscriptionId: string, variantKey?: string): string {
  return `${subscriptionId}-${variantKey || 'base'}`;
}

/**
 * Validate price value
 */
export function isValidPrice(price: unknown): price is number {
  return typeof price === 'number' && price > 0 && isFinite(price);
}

/**
 * Format price for display using consistent smart formatting
 * @param price The price to format
 * @param currency The currency code
 * @returns Formatted price string
 */
export function formatPrice(price: number, currency: string = 'USD'): string {
  try {
    return formatPriceDisplay(price, currency, 'en-US');
  } catch (error) {
    console.warn('Error formatting price:', error);
    const hasDecimals = price % 1 !== 0;
    return hasDecimals ? `$${price.toFixed(2)}` : `$${Math.round(price)}`;
  }
}

/**
 * Validate Stripe Price ID format
 */
export function isValidStripePriceId(priceId: unknown): priceId is string {
  return typeof priceId === 'string' && priceId.startsWith('price_') && priceId.length > 8;
}

/**
 * Validate Stripe Product ID format
 */
export function isValidStripeProductId(productId: unknown): productId is string {
  return typeof productId === 'string' && productId.startsWith('prod_') && productId.length > 8;
}

/**
 * Get display title for variant or base subscription
 */
export function getDisplayTitle(
  subscription: SanitySubscription, 
  variant?: SanityVariant
): string {
  if (variant) {
    return variant.title || `Variant ${variant._key}`;
  }
  return 'Base Plan';
}

/**
 * Get target price for variant or base subscription
 */
export function getTargetPrice(
  subscription: SanitySubscription, 
  variant?: SanityVariant
): number {
  return variant ? variant.price : subscription.price;
}

/**
 * Get target billing period for variant or base subscription
 */
export function getTargetBillingPeriod(
  subscription: SanitySubscription, 
  variant?: SanityVariant
): string {
  return variant ? variant.billingPeriod : subscription.billingPeriod;
}

/**
 * Get target custom months for variant or base subscription
 */
export function getTargetCustomMonths(
  subscription: SanitySubscription, 
  variant?: SanityVariant
): number | null | undefined {
  return variant ? variant.customBillingPeriodMonths : subscription.customBillingPeriodMonths;
}

/**
 * Get current Stripe price ID for variant or base subscription
 */
export function getCurrentPriceId(
  subscription: SanitySubscription, 
  variant?: SanityVariant
): string | undefined {
  return variant ? variant.stripePriceId : subscription.stripePriceId;
}

/**
 * Validate sync request data
 */
export function validateSyncRequest(data: unknown): data is {
  subscriptionId: string;
  variantKey?: string;
  action: 'sync' | 'create';
} {
  if (!data || typeof data !== 'object') return false;
  
  const request = data as Record<string, unknown>;
  
  return (
    typeof request.subscriptionId === 'string' &&
    request.subscriptionId.length > 0 &&
    (request.variantKey === undefined || typeof request.variantKey === 'string') &&
    (request.action === 'sync' || request.action === 'create')
  );
}

/**
 * Create error response
 */
export function createErrorResponse(
  message: string, 
  error?: unknown, 
  statusCode: number = 500
): {
  success: false;
  message: string;
  error?: string;
  statusCode: number;
} {
  return {
    success: false,
    message,
    error: error instanceof Error ? error.message : undefined,
    statusCode,
  };
}

/**
 * Create success response
 */
export function createSuccessResponse<T>(
  message: string, 
  data?: T
): {
  success: true;
  message: string;
  data?: T;
} {
  return {
    success: true,
    message,
    ...(data && { data }),
  };
}

/**
 * Safely truncate string for display
 */
export function truncateString(str: string, maxLength: number = 50): string {
  if (str.length <= maxLength) return str;
  return `${str.substring(0, maxLength)}...`;
}

/**
 * Extract last 8 characters of ID for display
 */
export function getShortId(id: string): string {
  return id.length > 8 ? id.slice(-8) : id;
}