// src/app/api/stripe/subscriptions/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createCheckoutSession } from '@/lib/stripe';
import { client as sanityClient } from '@/sanity/lib/client';
import { getAuthenticatedUser } from '@/utils/apiAuth';
import { Subscription, SubscriptionVariant } from '@/types/subscription-page';
import { Coupon } from '@/types/coupon';

interface SubscriptionPurchaseRequest {
  subscriptionId: string;
  userId: string;
  userEmail: string;
  variantKey?: string;
  couponCode?: string;
}

interface SubscriptionPurchaseResponse {
  success: boolean;
  sessionId?: string;
  url?: string;
  error?: string;
  metadata?: {
    subscriptionId: string;
    variantKey?: string;
    price: number;
    billingPeriod: string;
    couponApplied?: boolean;
    couponCode?: string;
    originalPrice?: number;
    discountedPrice?: number;
    discountAmount?: number;
  };
}

interface SanitySubscription extends Subscription {
  allowCoupons?: boolean;
  excludedCoupons?: Array<{ _id: string }>;
}

export async function POST(req: NextRequest): Promise<NextResponse<SubscriptionPurchaseResponse>> {
  try {
    // Verify authentication
    const user = await getAuthenticatedUser();
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    const data: SubscriptionPurchaseRequest = await req.json();
    
    // Validate required fields
    if (!data.subscriptionId || !data.userId || !data.userEmail) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Verify the user matches the authenticated user
    if (data.userId !== user.id) {
      return NextResponse.json(
        { success: false, error: 'User mismatch' },
        { status: 403 }
      );
    }

    // Fetch subscription details from Sanity
    const subscription = await sanityClient.fetch<SanitySubscription>(
      `*[_type == "subscription" && _id == $id && isActive == true && isDeleted != true][0] {
        _id,
        title,
        price,
        compareAtPrice,
        billingPeriod,
        customBillingPeriodMonths,
        hasVariants,
        variants[]{
          _key,
          title,
          price,
          compareAtPrice,
          billingPeriod,
          customBillingPeriodMonths,
          stripePriceId
        },
        stripePriceId,
        stripeProductId,
        allowCoupons,
        "excludedCoupons": excludedCoupons[]->{ _id }
      }`,
      { id: data.subscriptionId }
    );

    if (!subscription) {
      return NextResponse.json(
        { success: false, error: 'Subscription not found or not active' },
        { status: 404 }
      );
    }

    // Determine which price and Stripe price ID to use
    let finalPrice: number;
    let stripePriceId: string | undefined;
    let selectedVariant: SubscriptionVariant | null = null;
    let billingPeriod: string;
    let customBillingPeriodMonths: number | null | undefined;

    if (subscription.hasVariants && data.variantKey) {
      // Find the specific variant
      selectedVariant = subscription.variants?.find(v => v._key === data.variantKey) || null;
      
      if (!selectedVariant) {
        return NextResponse.json(
          { success: false, error: 'Selected variant not found' },
          { status: 404 }
        );
      }
      
      finalPrice = selectedVariant.price;
      stripePriceId = selectedVariant.stripePriceId;
      billingPeriod = selectedVariant.billingPeriod;
      customBillingPeriodMonths = selectedVariant.customBillingPeriodMonths;
    } else {
      // Use base subscription pricing
      finalPrice = subscription.price;
      stripePriceId = subscription.stripePriceId;
      billingPeriod = subscription.billingPeriod;
      customBillingPeriodMonths = subscription.customBillingPeriodMonths;
    }

    // Store original price for coupon calculations
    const originalPrice = finalPrice;
    let discountAmount = 0;
    let appliedCoupon: Coupon | null = null;

    // Handle coupon validation and application
    if (data.couponCode) {
      const couponValidation = await validateAndApplyCoupon(
        data.couponCode,
        subscription,
        data.variantKey,
        finalPrice
      );

      if (!couponValidation.isValid) {
        return NextResponse.json(
          { success: false, error: couponValidation.error || 'Invalid coupon' },
          { status: 400 }
        );
      }

      if (couponValidation.coupon && couponValidation.discountedPrice !== undefined) {
        appliedCoupon = couponValidation.coupon;
        finalPrice = couponValidation.discountedPrice;
        discountAmount = couponValidation.discountAmount || 0;
      }
    }

    // Prepare line items for Stripe
    const lineItems = [
      {
        price_data: {
          currency: 'usd',
          product_data: {
            name: selectedVariant 
              ? `${subscription.title} - ${selectedVariant.title}`
              : subscription.title,
            metadata: {
              subscriptionId: subscription._id,
              variantKey: data.variantKey || '',
              originalPrice: originalPrice.toString(),
              ...(appliedCoupon && {
                couponCode: appliedCoupon.code,
                discountAmount: discountAmount.toString(),
              }),
            },
          },
          unit_amount: Math.round(finalPrice * 100), // Convert to cents
        },
        quantity: 1,
      },
    ];

    // Create checkout session
    const checkoutSession = await createCheckoutSession({
      lineItems,
      successUrl: `${process.env.NEXT_PUBLIC_BASE_URL}/subscription-success?session_id={CHECKOUT_SESSION_ID}`,
      cancelUrl: `${process.env.NEXT_PUBLIC_BASE_URL}/subscriptions/${subscription._id}`,
      metadata: {
        subscriptionId: subscription._id,
        userId: data.userId,
        userEmail: data.userEmail,
        variantKey: data.variantKey || '',
        originalPrice: originalPrice.toString(),
        finalPrice: finalPrice.toString(),
        ...(appliedCoupon && {
          couponCode: appliedCoupon.code,
          couponId: appliedCoupon._id,
          discountAmount: discountAmount.toString(),
        }),
      },
      customerEmail: data.userEmail,
    });

    // Prepare response metadata
    const responseMetadata = {
      subscriptionId: subscription._id,
      variantKey: data.variantKey,
      price: finalPrice,
      billingPeriod,
      couponApplied: !!appliedCoupon,
      couponCode: appliedCoupon?.code,
      originalPrice,
      discountedPrice: appliedCoupon ? finalPrice : undefined,
      discountAmount: appliedCoupon ? discountAmount : undefined,
    };

    return NextResponse.json({
      success: true,
      sessionId: checkoutSession.id,
      url: checkoutSession.url || undefined,
      metadata: responseMetadata,
    });

  } catch (error) {
    console.error('Subscription purchase error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to create subscription purchase' 
      },
      { status: 500 }
    );
  }
}

/**
 * Validates and applies a coupon to a subscription
 */
async function validateAndApplyCoupon(
  couponCode: string,
  subscription: SanitySubscription,
  variantKey?: string,
  currentPrice?: number
): Promise<{
  isValid: boolean;
  error?: string;
  coupon?: Coupon;
  discountedPrice?: number;
  discountAmount?: number;
}> {
  try {
    // Validate coupon via API
    const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/coupons/validate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        code: couponCode,
        subscriptionId: subscription._id,
        variantKey,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      return {
        isValid: false,
        error: errorData.error || 'Coupon validation failed',
      };
    }

    const result = await response.json();
    
    if (!result.success || !result.isValid) {
      return {
        isValid: false,
        error: result.error || 'Invalid coupon',
      };
    }

    return {
      isValid: true,
      coupon: result.coupon,
      discountedPrice: result.discountedPrice,
      discountAmount: result.discountAmount,
    };

  } catch (error) {
    console.error('Error validating coupon:', error);
    return {
      isValid: false,
      error: 'Failed to validate coupon',
    };
  }
}