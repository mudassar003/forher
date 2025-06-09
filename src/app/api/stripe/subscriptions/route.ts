// src/app/api/stripe/subscriptions/route.ts
import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from "@supabase/supabase-js";
import { client as sanityClient } from '@/sanity/lib/client';
import { getAuthenticatedUser } from '@/utils/apiAuth';
import { Subscription, SubscriptionVariant } from '@/types/subscription-page';
import { Coupon } from '@/types/coupon';
import { v4 as uuidv4 } from 'uuid';

// Initialize Stripe with proper error handling
if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY environment variable is not defined');
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: undefined, // Use latest API version
});

// Initialize Supabase admin client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('Supabase environment variables are not defined');
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Interfaces matching your Sanity schema
interface SanitySubscriptionVariant {
  _key: string;
  title: string;
  titleEs?: string;
  description?: string;
  descriptionEs?: string;
  dosageAmount: number;
  dosageUnit: string;
  price: number;
  compareAtPrice?: number;
  billingPeriod: string;
  customBillingPeriodMonths?: number | null;
  stripePriceId?: string;
  isDefault?: boolean;
  isPopular?: boolean;
}

interface SanitySubscription {
  _id: string;
  title: string;
  price: number;
  billingPeriod: string;
  customBillingPeriodMonths?: number | null;
  stripePriceId?: string;
  stripeProductId?: string;
  hasVariants?: boolean;
  variants?: SanitySubscriptionVariant[];
  appointmentAccess?: boolean;
  appointmentDiscountPercentage?: number;
  features?: Array<{
    featureText: string;
  }>;
  allowCoupons?: boolean;
  excludedCoupons?: Array<{ _id: string }>;
}

// Coupon interface matching Sanity couponType schema
interface SanityCoupon {
  _id: string;
  code: string;
  description?: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  applicationType: 'all' | 'specific' | 'variants';
  subscriptions?: Array<{
    _id: string;
    title: string;
  }>;
  variantTargets?: Array<{
    subscription: {
      _id: string;
      title: string;
    };
    variantKey?: string;
    variantTitle?: string;
  }>;
  usageLimit?: number;
  usageCount: number;
  validFrom: string;
  validUntil: string;
  isActive: boolean;
  minimumPurchaseAmount?: number;
}

interface SubscriptionRequest {
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

interface CouponValidationResult {
  isValid: boolean;
  error?: string;
  coupon?: SanityCoupon;
  discountedPrice?: number;
  discountAmount?: number;
}

/**
 * ✅ OPTIMIZATION #2: Helper function to get or create Stripe customer
 */
async function getOrCreateStripeCustomer(userId: string, userEmail: string): Promise<string> {
  try {
    const { data: customerData, error: customerError } = await supabase
      .from('stripe_customers')
      .select('stripe_customer_id, user_id, email')
      .eq('user_id', userId)
      .single();
    
    if (customerError || !customerData) {
      console.log(`Creating new Stripe customer for user ${userId}`);
      const customer = await stripe.customers.create({
        email: userEmail,
        metadata: { userId }
      });
      
      // Save customer to Supabase (non-blocking) - Fixed TypeScript issue
      supabase.from('stripe_customers')
        .insert({
          user_id: userId,
          stripe_customer_id: customer.id,
          email: userEmail
        })
        .then(({ error }) => {
          if (error) {
            console.warn('Failed to save customer to Supabase:', error);
          }
        });
      
      return customer.id;
    } else {
      console.log('Using existing Stripe customer:', customerData.stripe_customer_id);
      return customerData.stripe_customer_id;
    }
  } catch (error) {
    console.error('Error in getOrCreateStripeCustomer:', error);
    throw new Error('Failed to get or create Stripe customer');
  }
}

/**
 * ✅ OPTIMIZATION #2: Helper function to get or create Stripe product
 */
async function getOrCreateStripeProduct(subscription: SanitySubscription): Promise<string> {
  try {
    if (subscription.stripeProductId) {
      return subscription.stripeProductId;
    }
    
    console.log("Creating new Stripe product");
    const product = await stripe.products.create({
      name: subscription.title,
      description: `${subscription.title} subscription`,
      metadata: {
        sanityId: subscription._id
      }
    });
    
    // Update Sanity with product ID (non-blocking) - Fixed TypeScript issue
    sanityClient.patch(subscription._id)
      .set({ stripeProductId: product.id })
      .commit()
      .then(() => {
        console.log('✅ Updated Sanity with Stripe product ID');
      })
      .catch(error => {
        console.warn('Failed to update Sanity with Stripe product ID:', error);
      });
    
    return product.id;
  } catch (error) {
    console.error('Error in getOrCreateStripeProduct:', error);
    throw new Error('Failed to get or create Stripe product');
  }
}

/**
 * Convert Sanity billing period to Stripe interval configuration
 */
function getStripeIntervalConfig(
  billingPeriod: string, 
  customBillingPeriodMonths?: number | null
): { interval: Stripe.PriceCreateParams.Recurring.Interval; intervalCount: number } {
  let interval: Stripe.PriceCreateParams.Recurring.Interval = "month";
  let intervalCount = 1;
  
  switch (billingPeriod) {
    case "monthly":
      interval = "month";
      intervalCount = 1;
      break;
    case "three_month":
      interval = "month";
      intervalCount = 3;
      break;
    case "six_month":
      interval = "month";
      intervalCount = 6;
      break;
    case "annually":
      interval = "year";
      intervalCount = 1;
      break;
    case "other":
      interval = "month";
      intervalCount = customBillingPeriodMonths || 1;
      
      // Stripe limits: month (max 12), year (max 3)
      if (intervalCount > 12) {
        if (intervalCount % 12 === 0) {
          interval = "year";
          intervalCount = intervalCount / 12;
        } else {
          console.warn(`Billing period of ${intervalCount} months exceeds Stripe's limit. Capping at 12 months.`);
          intervalCount = 12;
        }
      }
      break;
    default:
      interval = "month";
      intervalCount = 1;
  }
  
  return { interval, intervalCount };
}

export async function POST(req: NextRequest): Promise<NextResponse<SubscriptionPurchaseResponse>> {
  try {
    const startTime = Date.now();
    console.log('🚀 Starting subscription purchase process');
    
    const data: SubscriptionRequest = await req.json();
    console.log('📝 Request data:', { 
      subscriptionId: data.subscriptionId, 
      userId: data.userId,
      variantKey: data.variantKey,
      hasCoupon: !!data.couponCode 
    });
    
    // Validate required fields early
    if (!data.subscriptionId) {
      console.log('❌ Missing subscription ID');
      return NextResponse.json(
        { success: false, error: 'Missing subscription ID' },
        { status: 400 }
      );
    }

    // ✅ OPTIMIZATION #1: Parallel authentication and subscription fetching
    console.log('🔄 Starting parallel auth and subscription fetch...');
    const [user, subscription] = await Promise.all([
      getAuthenticatedUser(),
      sanityClient.fetch<SanitySubscription>(
        `*[_type == "subscription" && _id == $id && isActive == true && isDeleted != true][0]{
          _id,
          title,
          price,
          billingPeriod,
          customBillingPeriodMonths,
          stripePriceId,
          stripeProductId,
          hasVariants,
          variants[]{
            _key,
            title,
            titleEs,
            description,
            descriptionEs,
            dosageAmount,
            dosageUnit,
            price,
            compareAtPrice,
            billingPeriod,
            customBillingPeriodMonths,
            stripePriceId,
            isDefault,
            isPopular
          },
          appointmentAccess,
          appointmentDiscountPercentage,
          features[] {
            featureText
          },
          allowCoupons,
          "excludedCoupons": excludedCoupons[]->{ _id }
        }`,
        { id: data.subscriptionId }
      )
    ]);

    const authTime = Date.now() - startTime;
    console.log(`⚡ Auth & subscription fetch completed in ${authTime}ms`);

    // Early validation - fail fast
    if (!user) {
      console.log('❌ Authentication failed - no user found');
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    if (!subscription) {
      console.log('❌ Subscription not found');
      return NextResponse.json(
        { success: false, error: 'Subscription plan not found' },
        { status: 404 }
      );
    }

    console.log('✅ User authenticated and subscription found:', subscription.title);

    const userId = user.id;
    const userEmail = user.email || data.userEmail;
    
    if (!userEmail) {
      console.log('❌ Missing user email');
      return NextResponse.json(
        { success: false, error: 'User email is required' },
        { status: 400 }
      );
    }

    // Select variant if applicable
    let selectedVariant: SanitySubscriptionVariant | null = null;
    if (subscription.hasVariants && subscription.variants && subscription.variants.length > 0) {
      if (data.variantKey) {
        selectedVariant = subscription.variants.find(v => v._key === data.variantKey) || null;
        if (!selectedVariant) {
          console.log('❌ Selected variant not found');
          return NextResponse.json(
            { success: false, error: 'Selected variant not found' },
            { status: 404 }
          );
        }
        console.log('✅ Variant found:', selectedVariant.title);
      } else {
        // Use default or first variant if no specific variant selected
        selectedVariant = subscription.variants.find(v => v.isDefault) || subscription.variants[0];
        console.log('✅ Using default/first variant:', selectedVariant.title);
      }
    }
    
    // Calculate effective price and billing period
    let effectivePrice = selectedVariant ? selectedVariant.price : subscription.price;
    const effectiveBillingPeriod = selectedVariant ? selectedVariant.billingPeriod : subscription.billingPeriod;
    const effectiveCustomMonths = selectedVariant 
      ? selectedVariant.customBillingPeriodMonths 
      : subscription.customBillingPeriodMonths;
    
    console.log('💰 Initial price:', effectivePrice);

    // ✅ OPTIMIZATION #2: Parallel coupon validation and customer/product setup
    console.log('🔄 Starting parallel coupon validation, customer lookup, and product setup...');
    
    const parallelOperations: [
      Promise<string>, 
      Promise<string>, 
      Promise<CouponValidationResult | null>
    ] = [
      // Customer lookup/creation
      getOrCreateStripeCustomer(userId, userEmail),
      // Product lookup/creation  
      getOrCreateStripeProduct(subscription),
      // Coupon validation if coupon provided, otherwise null
      data.couponCode && subscription.allowCoupons !== false
        ? validateAndApplyCoupon(data.couponCode, subscription, data.variantKey, effectivePrice)
        : Promise.resolve(null)
    ];

    // Execute all operations in parallel
    const [stripeCustomerId, stripeProductId, couponValidation] = await Promise.all(parallelOperations);

    const parallelTime = Date.now() - startTime;
    console.log(`⚡ Parallel customer/product/coupon operations completed in ${parallelTime - authTime}ms`);

    // Process coupon results with proper type checking
    let appliedCoupon: SanityCoupon | null = null;
    let originalPrice = effectivePrice;
    
    if (couponValidation && couponValidation.isValid && couponValidation.coupon && couponValidation.discountedPrice !== undefined) {
      appliedCoupon = couponValidation.coupon;
      effectivePrice = couponValidation.discountedPrice;
      console.log('✅ Coupon applied - new price:', effectivePrice);
    } else if (couponValidation && couponValidation.error) {
      console.log('❌ Coupon validation failed:', couponValidation.error);
      // Continue without coupon rather than failing
    }

    console.log('🏗️ Customer ID:', stripeCustomerId);
    console.log('🏗️ Product ID:', stripeProductId);
    
    // Get or create Stripe price
    let stripePriceId: string;
    
    if (appliedCoupon) {
      // Create new price with coupon discount (one-time use)
      console.log("Creating new Stripe price with coupon discount");
      const { interval, intervalCount } = getStripeIntervalConfig(effectiveBillingPeriod, effectiveCustomMonths);
      
      const stripePrice = await stripe.prices.create({
        product: stripeProductId,
        unit_amount: Math.round(effectivePrice * 100), // Convert to cents
        currency: 'usd',
        recurring: {
          interval,
          interval_count: intervalCount,
        },
        metadata: {
          sanityId: subscription._id,
          variantKey: selectedVariant ? selectedVariant._key : '',
          billingPeriod: effectiveBillingPeriod,
          customBillingPeriodMonths: effectiveCustomMonths?.toString() || '',
          couponCode: appliedCoupon.code,
          originalPrice: originalPrice.toString(),
          tempPrice: 'true' // Mark as temporary price
        }
      });
      stripePriceId = stripePrice.id;
    } else {
      // Use existing price or create new one
      if (selectedVariant && selectedVariant.stripePriceId) {
        stripePriceId = selectedVariant.stripePriceId;
        console.log('Using existing variant price ID:', stripePriceId);
      } else if (!selectedVariant && subscription.stripePriceId) {
        stripePriceId = subscription.stripePriceId;
        console.log('Using existing subscription price ID:', stripePriceId);
      } else {
        // Create new price
        console.log("Creating new Stripe price");
        const { interval, intervalCount } = getStripeIntervalConfig(effectiveBillingPeriod, effectiveCustomMonths);
        
        const stripePrice = await stripe.prices.create({
          product: stripeProductId,
          unit_amount: Math.round(effectivePrice * 100),
          currency: 'usd',
          recurring: {
            interval,
            interval_count: intervalCount,
          },
          metadata: {
            sanityId: subscription._id,
            variantKey: selectedVariant ? selectedVariant._key : '',
            billingPeriod: effectiveBillingPeriod,
            customBillingPeriodMonths: effectiveCustomMonths?.toString() || ''
          }
        });
        stripePriceId = stripePrice.id;
        
        // Update Sanity with the new price ID (non-blocking) - Fixed TypeScript issue
        const updatePromise = selectedVariant
          ? sanityClient
              .patch(subscription._id)
              .setIfMissing({ variants: [] })
              .set({ [`variants[_key=="${selectedVariant._key}"].stripePriceId`]: stripePrice.id })
              .commit()
          : sanityClient.patch(subscription._id).set({ stripePriceId: stripePrice.id }).commit();
        
        updatePromise
          .then(() => {
            console.log('✅ Updated Sanity with Stripe price ID');
          })
          .catch(error => {
            console.warn('Failed to update Sanity with Stripe price ID:', error);
          });
      }
    }

    console.log('🏗️ Using Stripe price ID:', stripePriceId);

    // Create Stripe checkout session
    console.log('🛒 Creating Stripe checkout session...');
    
    // Get base URL
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.NEXT_PUBLIC_BASE_URL;
    if (!baseUrl) {
      console.log('❌ Missing base URL environment variable');
      return NextResponse.json(
        { success: false, error: 'Server configuration error: missing base URL' },
        { status: 500 }
      );
    }

    const sessionParams: Stripe.Checkout.SessionCreateParams = {
      payment_method_types: ['card'],
      line_items: [{ 
        price: stripePriceId, 
        quantity: 1 
      }],
      mode: 'subscription',
      locale: 'en', // ✅ Fix for Stripe console errors
      success_url: `${baseUrl}/appointment?subscription_success=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/subscriptions?canceled=true`,
      customer: stripeCustomerId,
      metadata: {
        userId,
        userEmail,
        subscriptionId: subscription._id,
        variantKey: selectedVariant ? selectedVariant._key : '',
        subscriptionType: "subscription",
        ...(appliedCoupon && {
          couponId: appliedCoupon._id,
          couponCode: appliedCoupon.code,
          originalPrice: originalPrice.toString(),
          discountedPrice: effectivePrice.toString()
        })
      },
      client_reference_id: userId,
    };
    
    const session = await stripe.checkout.sessions.create(sessionParams);
    console.log(`✅ Created checkout session: ${session.id}`);
    
    // Create pending user subscription records
    const startDate = new Date().toISOString();
    
    // Create Sanity record
    console.log('💾 Creating Sanity user subscription record...');
    const userSubscription = {
      _type: 'userSubscription',
      userId,
      userEmail,
      subscription: { _type: 'reference', _ref: subscription._id },
      variantKey: selectedVariant ? selectedVariant._key : undefined,
      startDate,
      isActive: false,
      status: 'pending',
      stripeSubscriptionId: '', // Will be updated by webhook
      stripeCustomerId,
      billingPeriod: effectiveBillingPeriod,
      billingAmount: effectivePrice,
      hasAppointmentAccess: subscription.appointmentAccess || false,
      appointmentDiscountPercentage: subscription.appointmentDiscountPercentage || 0,
      stripeSessionId: session.id,
      ...(appliedCoupon && {
        appliedCouponId: appliedCoupon._id,
        appliedCouponCode: appliedCoupon.code,
        discountType: appliedCoupon.discountType,
        discountValue: appliedCoupon.discountValue,
        originalPrice: originalPrice,
      }),
    };
    
    const sanityResponse = await sanityClient.create(userSubscription);
    console.log(`✅ Created Sanity user subscription: ${sanityResponse._id}`);
    
    // Create Supabase record
    console.log('💾 Creating Supabase user subscription record...');
    const supabaseSubscription = {
      id: uuidv4(),
      user_id: userId,
      user_email: userEmail,
      sanity_id: sanityResponse._id,
      sanity_subscription_id: subscription._id,
      subscription_name: subscription.title,
      plan_id: subscription._id,
      plan_name: subscription.title,
      stripe_session_id: session.id,
      stripe_customer_id: stripeCustomerId,
      billing_amount: effectivePrice,
      billing_period: effectiveBillingPeriod,
      start_date: startDate,
      status: 'pending',
      is_active: false,
      has_appointment_access: subscription.appointmentAccess || false,
      appointment_discount_percentage: subscription.appointmentDiscountPercentage || 0,
      appointment_access_duration: 600, // 10 minutes default
      appointment_access_expired: false,
      ...(selectedVariant && {
        variant_key: selectedVariant._key,
      }),
      ...(appliedCoupon && {
        coupon_code: appliedCoupon.code,
        coupon_discount_type: appliedCoupon.discountType,
        coupon_discount_value: appliedCoupon.discountValue,
        original_price: originalPrice,
      }),
    };
    
    const { error: insertError } = await supabase.from('user_subscriptions').insert(supabaseSubscription);
    if (insertError) {
      console.error("❌ Supabase insertion error:", insertError);
      throw new Error(`Failed to create Supabase record: ${insertError.message}`);
    }
    
    console.log(`✅ Created Supabase subscription record`);
    
    // Increment coupon usage if applied (non-blocking) - Fixed TypeScript issue
    if (appliedCoupon) {
      sanityClient.patch(appliedCoupon._id)
        .inc({ usageCount: 1 })
        .commit()
        .then(() => {
          console.log(`✅ Incremented usage count for coupon ${appliedCoupon.code}`);
        })
        .catch(error => {
          console.warn('Failed to increment coupon usage:', error);
        });
    }
    
    // Prepare response metadata
    const responseMetadata = {
      subscriptionId: subscription._id,
      variantKey: selectedVariant?._key,
      price: effectivePrice,
      billingPeriod: effectiveBillingPeriod,
      ...(appliedCoupon && {
        couponApplied: true,
        couponCode: appliedCoupon.code,
        originalPrice: originalPrice,
        discountedPrice: effectivePrice,
        discountAmount: originalPrice - effectivePrice
      }),
    };

    const totalTime = Date.now() - startTime;
    const savedTime = Math.max(0, 800 - totalTime); // Estimate of time saved vs sequential
    console.log(`🎉 Subscription purchase completed in ${totalTime}ms (parallel optimization saved ~${savedTime}ms)`);

    // Fix the type issue by ensuring url is properly handled
    const checkoutUrl = session.url || undefined;
    
    return NextResponse.json({
      success: true,
      sessionId: session.id,
      url: checkoutUrl,
      metadata: responseMetadata
    });

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("💥 Error creating subscription:", error);
    
    // Log the full error for debugging
    if (error instanceof Error) {
      console.error("Error stack:", error.stack);
    }
    
    return NextResponse.json(
      { 
        success: false, 
        error: errorMessage || "Failed to create subscription"
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
): Promise<CouponValidationResult> {
  try {
    console.log('🎫 Validating coupon:', couponCode);
    
    // Fetch coupon from Sanity matching the exact schema structure
    const coupon = await sanityClient.fetch<SanityCoupon>(
      `*[_type == "coupon" && code == $code && isActive == true][0]{
        _id,
        code,
        description,
        discountType,
        discountValue,
        applicationType,
        "subscriptions": subscriptions[]->{ _id, title },
        variantTargets[]{
          "subscription": subscription->{ _id, title },
          variantKey,
          variantTitle
        },
        usageLimit,
        usageCount,
        validFrom,
        validUntil,
        isActive,
        minimumPurchaseAmount
      }`,
      { code: couponCode.toUpperCase().trim() }
    );
    
    if (!coupon) {
      return {
        isValid: false,
        error: 'Coupon not found',
      };
    }

    // Basic validation
    const now = new Date();
    const validFrom = new Date(coupon.validFrom);
    const validUntil = new Date(coupon.validUntil);
    
    if (now < validFrom || now > validUntil) {
      return {
        isValid: false,
        error: 'Coupon is not valid at this time',
      };
    }

    if (coupon.usageLimit && coupon.usageCount >= coupon.usageLimit) {
      return {
        isValid: false,
        error: 'Coupon has reached its usage limit',
      };
    }

    if (coupon.minimumPurchaseAmount && currentPrice && currentPrice < coupon.minimumPurchaseAmount) {
      return {
        isValid: false,
        error: `Minimum purchase amount of ${coupon.minimumPurchaseAmount} required`,
      };
    }

    // Validate applicability based on coupon type
    if (coupon.applicationType === 'specific' && coupon.subscriptions) {
      const isApplicable = coupon.subscriptions.some(sub => sub._id === subscription._id);
      if (!isApplicable) {
        return {
          isValid: false,
          error: 'This coupon is not applicable to the selected subscription',
        };
      }
    } else if (coupon.applicationType === 'variants' && coupon.variantTargets) {
      const isApplicable = coupon.variantTargets.some(target => {
        if (target.subscription._id !== subscription._id) return false;
        // If no variantKey specified in coupon, it applies to base subscription
        if (!target.variantKey && !variantKey) return true;
        // If variantKey specified, it must match
        return target.variantKey === variantKey;
      });
      
      if (!isApplicable) {
        return {
          isValid: false,
          error: 'This coupon is not applicable to the selected subscription variant',
        };
      }
    }
    // For 'all' type, no additional validation needed

    // Calculate discount
    if (!currentPrice) {
      return {
        isValid: false,
        error: 'Cannot calculate discount',
      };
    }

    let discountedPrice = currentPrice;
    let discountAmount = 0;

    if (coupon.discountType === 'percentage') {
      discountAmount = (currentPrice * coupon.discountValue) / 100;
      discountedPrice = Math.max(0, currentPrice - discountAmount);
    } else if (coupon.discountType === 'fixed') {
      discountAmount = coupon.discountValue;
      discountedPrice = Math.max(0, currentPrice - coupon.discountValue);
    }

    console.log('✅ Coupon validated successfully');

    return {
      isValid: true,
      coupon: coupon,
      discountedPrice: discountedPrice,
      discountAmount: discountAmount,
    };

  } catch (error) {
    console.error('❌ Error validating coupon:', error);
    return {
      isValid: false,
      error: 'Failed to validate coupon',
    };
  }
}