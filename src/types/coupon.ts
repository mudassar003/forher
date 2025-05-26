// src/types/coupon.ts
export type DiscountType = 'percentage' | 'fixed';

export interface Coupon {
  _id: string;
  code: string;
  description?: string;
  discountType: DiscountType;
  discountValue: number;
  subscriptions?: Array<{
    _id: string;
    title: string;
  }>;
  usageLimit?: number;
  usageCount: number;
  validFrom: string;
  validUntil: string;
  isActive: boolean;
  minimumPurchaseAmount?: number;
}

export interface CouponValidationResult {
  isValid: boolean;
  error?: string;
  coupon?: Coupon;
  discountedPrice?: number;
  discountAmount?: number;
}

export interface ValidateCouponRequest {
  code: string;
  subscriptionId: string;
  variantKey?: string;
}

export interface ValidateCouponResponse {
  success: boolean;
  isValid: boolean;
  coupon?: Coupon;
  discountedPrice?: number;
  discountAmount?: number;
  originalPrice?: number;
  error?: string;
}

export interface ApplyCouponRequest {
  code: string;
  subscriptionId: string;
  variantKey?: string;
  userId: string;
  userEmail: string;
}