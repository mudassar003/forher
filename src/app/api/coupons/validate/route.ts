// src/app/api/coupons/validate/route.ts
import { NextRequest, NextResponse } from "next/server";
import { client as sanityClient } from "@/sanity/lib/client";
import { ValidateCouponRequest, ValidateCouponResponse, Coupon } from "@/types/coupon";
import { Subscription, SubscriptionVariant } from "@/types/subscription-page";

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const data: ValidateCouponRequest = await req.json();
    
    // Validate required fields
    if (!data.code || !data.subscriptionId) {
      return NextResponse.json(
        { 
          success: false, 
          isValid: false,
          error: "Missing required fields" 
        },
        { status: 400 }
      );
    }
    
    // Normalize coupon code to uppercase
    const couponCode = data.code.toUpperCase().trim();
    
    // Fetch the coupon
    const coupon = await sanityClient.fetch<Coupon>(
      `*[_type == "coupon" && code == $code][0]{
        _id,
        code,
        description,
        discountType,
        discountValue,
        "subscriptions": subscriptions[]->{ _id, title },
        usageLimit,
        usageCount,
        validFrom,
        validUntil,
        isActive,
        minimumPurchaseAmount
      }`,
      { code: couponCode }
    );
    
    if (!coupon) {
      return NextResponse.json(
        { 
          success: false, 
          isValid: false,
          error: "Invalid coupon code" 
        },
        { status: 404 }
      );
    }
    
    // Check if coupon is active
    if (!coupon.isActive) {
      return NextResponse.json(
        { 
          success: false, 
          isValid: false,
          error: "This coupon is no longer active" 
        },
        { status: 400 }
      );
    }
    
    // Check validity dates
    const now = new Date();
    const validFrom = new Date(coupon.validFrom);
    const validUntil = new Date(coupon.validUntil);
    
    if (now < validFrom) {
      return NextResponse.json(
        { 
          success: false, 
          isValid: false,
          error: "This coupon is not yet valid" 
        },
        { status: 400 }
      );
    }
    
    if (now > validUntil) {
      return NextResponse.json(
        { 
          success: false, 
          isValid: false,
          error: "This coupon has expired" 
        },
        { status: 400 }
      );
    }
    
    // Check usage limit
    if (coupon.usageLimit && coupon.usageCount >= coupon.usageLimit) {
      return NextResponse.json(
        { 
          success: false, 
          isValid: false,
          error: "This coupon has reached its usage limit" 
        },
        { status: 400 }
      );
    }
    
    // Fetch the subscription to check if coupons are allowed
    const subscription = await sanityClient.fetch<Subscription & { allowCoupons?: boolean; excludedCoupons?: Array<{ _id: string }> }>(
      `*[_type == "subscription" && _id == $id][0]{
        _id,
        title,
        price,
        billingPeriod,
        customBillingPeriodMonths,
        hasVariants,
        variants[]{
          _key,
          title,
          price,
          billingPeriod,
          customBillingPeriodMonths
        },
        allowCoupons,
        "excludedCoupons": excludedCoupons[]->{ _id }
      }`,
      { id: data.subscriptionId }
    );
    
    if (!subscription) {
      return NextResponse.json(
        { 
          success: false, 
          isValid: false,
          error: "Subscription not found" 
        },
        { status: 404 }
      );
    }
    
    // Check if coupons are allowed for this subscription
    if (subscription.allowCoupons === false) {
      return NextResponse.json(
        { 
          success: false, 
          isValid: false,
          error: "Coupons are not allowed for this subscription" 
        },
        { status: 400 }
      );
    }
    
    // Check if this coupon is excluded from this subscription
    if (subscription.excludedCoupons?.some(excluded => excluded._id === coupon._id)) {
      return NextResponse.json(
        { 
          success: false, 
          isValid: false,
          error: "This coupon cannot be used with this subscription" 
        },
        { status: 400 }
      );
    }
    
    // Check if coupon is restricted to specific subscriptions
    if (coupon.subscriptions && coupon.subscriptions.length > 0) {
      const isApplicable = coupon.subscriptions.some(sub => sub._id === data.subscriptionId);
      if (!isApplicable) {
        return NextResponse.json(
          { 
            success: false, 
            isValid: false,
            error: "This coupon is not valid for this subscription" 
          },
          { status: 400 }
        );
      }
    }
    
    // Determine the price to use (variant or base)
    let originalPrice = subscription.price;
    
    if (subscription.hasVariants && data.variantKey) {
      const variant = subscription.variants?.find(v => v._key === data.variantKey);
      if (variant) {
        originalPrice = variant.price;
      }
    }
    
    // Check minimum purchase amount
    if (coupon.minimumPurchaseAmount && originalPrice < coupon.minimumPurchaseAmount) {
      return NextResponse.json(
        { 
          success: false, 
          isValid: false,
          error: `Minimum purchase amount of $${coupon.minimumPurchaseAmount} required` 
        },
        { status: 400 }
      );
    }
    
    // Calculate discount
    let discountAmount = 0;
    let discountedPrice = originalPrice;
    
    if (coupon.discountType === 'percentage') {
      discountAmount = (originalPrice * coupon.discountValue) / 100;
      discountedPrice = originalPrice - discountAmount;
    } else if (coupon.discountType === 'fixed') {
      discountAmount = Math.min(coupon.discountValue, originalPrice);
      discountedPrice = originalPrice - discountAmount;
    }
    
    // Ensure price doesn't go below 0
    discountedPrice = Math.max(0, discountedPrice);
    
    return NextResponse.json({
      success: true,
      isValid: true,
      coupon: {
        _id: coupon._id,
        code: coupon.code,
        discountType: coupon.discountType,
        discountValue: coupon.discountValue,
      },
      originalPrice,
      discountAmount,
      discountedPrice,
    });
    
  } catch (error) {
    console.error("Error validating coupon:", error);
    return NextResponse.json(
      { 
        success: false, 
        isValid: false,
        error: error instanceof Error ? error.message : "Failed to validate coupon" 
      },
      { status: 500 }
    );
  }
}