// src/types/admin-price-sync.ts

// Types for Sanity subscription data
export interface SanityVariant {
  _key: string;
  title: string;
  titleEs?: string;
  price: number;
  billingPeriod: string;
  customBillingPeriodMonths?: number | null;
  stripePriceId?: string;
}

export interface SanitySubscription {
  _id: string;
  title: string;
  price: number;
  billingPeriod: string;
  customBillingPeriodMonths?: number | null;
  stripePriceId?: string;
  stripeProductId?: string;
  hasVariants?: boolean;
  variants?: SanityVariant[];
}

// Types for Stripe price data
export interface StripePrice {
  id: string;
  unit_amount: number | null;
  currency: string;
  active: boolean;
}

// Status types for price comparison
export type PriceComparisonStatus = 'OK' | 'DIFFERENT' | 'MISSING' | 'NOT_FOUND' | 'ERROR';
export type SyncActionType = 'sync' | 'create';

// Main comparison row interface
export interface PriceComparisonRow {
  subscriptionId: string;
  subscriptionTitle: string;
  variantKey?: string;
  variantTitle?: string;
  sanityPrice: number;
  stripePrice?: number;
  stripePriceId?: string;
  status: PriceComparisonStatus;
  statusMessage: string;
  needsAction: boolean;
  actionType?: SyncActionType;
  error?: string;
}

// API Response types
export interface PriceComparisonResponse {
  success: boolean;
  rows: PriceComparisonRow[];
  error?: string;
}

export interface SyncPriceRequest {
  subscriptionId: string;
  variantKey?: string;
  action: SyncActionType;
}

export interface SyncPriceResponse {
  success: boolean;
  message: string;
  newPriceId?: string;
  error?: string;
}

// UI State types
export interface SyncingState {
  [itemKey: string]: boolean;
}

export interface PriceSyncPageState {
  rows: PriceComparisonRow[];
  loading: boolean;
  error: string;
  syncingItems: Set<string>;
}

// Utility types
export interface StripeIntervalConfig {
  interval: 'month' | 'year';
  intervalCount: number;
}

export interface SyncProgress {
  total: number;
  completed: number;
  failed: number;
  inProgress: boolean;
}