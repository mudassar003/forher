// src/types/subscriptionDetails.ts

export interface Translations {
  home: string;
  subscriptions: string;
  included: string;
  description: string;
  viewMoreDetails: string;
  relatedPlans: string;
  viewPlan: string;
  selectVariant: string;
  dosage: string;
  bestValue: string;
  mostPopular: string;
  savePercent: string;
  baseOption: string;
  standardPlan: string;
  imageDisclaimer: string;
  lowestPrice: string;
  totalPerMonth: string;
  totalFor3Months: string;
  totalFor6Months: string;
  totalFor1Year: string;
  total: string;
  month: string;
  monthPlan: string;
  originalPrice: string;
  discountedPrice: string;
  processing: string;
  buyNow: string;
  dismiss: string;
}

export interface PriceInfo {
  effectivePrice: number;
  originalPrice: number;
  billingPeriod: string;
  customMonths?: number | null;
}

export interface CouponState {
  appliedCode: string;
  discountedPrice: number | null;
  discountAmount: number;
}

export interface PricingDisplay {
  monthlyEquivalent: string;
  totalPriceText: string;
  formattedPrice: string;
  showDecimals: boolean;
}

export interface VariantPricing {
  price: number;
  billingPeriod: string;
  customBillingPeriodMonths?: number | null;
  monthlyPrice: number;
  formattedMonthly: string;
  formattedTotal: string;
}