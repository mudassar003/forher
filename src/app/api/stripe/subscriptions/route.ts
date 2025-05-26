// src/app/api/stripe/subscriptions/route.ts
import { NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";
import { client as sanityClient } from "@/sanity/lib/client";
import { cookies } from "next/headers";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { v4 as uuidv4 } from 'uuid';
import { Coupon } from '@/types/coupon';

// Interfaces for strict typing
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

interface UserSubscription {
  _type: string;
  userId: string;
  userEmail: string;
  subscription: {
    _type: string;
    _ref: string;
  };
  variantKey?: string;
  startDate: string;
  isActive: boolean;
  status: string;
  stripeSubscriptionId: string;
  stripeCustomerId: string;
  billingPeriod: string;
  billingAmount: number;
  hasAppointmentAccess: boolean;
  appointmentDiscountPercentage: number;
  stripeSessionId: string;
  // Coupon fields
  appliedCouponId?: string;
  appliedCouponCode?: string;
  discountType?: string;
  discountValue?: number;
  originalPrice?: number;
}

interface SupabaseUserSubscription {
  id: string;
  user_id: string;
  user_email: string;
  sanity_id: string;
  sanity_subscription_id: string;
  subscription_name: string;
  variant_key?: string;
  variant_title?: string;
  variant_dosage?: string;
  plan_id: string;
  plan_name: string;
  stripe_session_id: string;
  stripe_customer_id: string;
  billing_amount: number;
  billing_period: string;
  start_date: string;
  status: string;
  is_active: boolean;
  has_appointment_access: boolean;
  appointment_discount_percentage: number;
  // Coupon fields
  coupon_code?: string;
  coupon_discount_type?: string;
  coupon_discount_value?: number;
  original_price?: number;
}

interface SubscriptionRequest {
  subscriptionId: string;
  userId: string;
  userEmail: string;
  variantKey?: string;
  couponCode?: string; // New field for coupon code
}

interface StripeCustomer {
  stripe_customer_id: string;
  user_id: string;
  email: string;
}

interface CouponMetadata {
  couponId?: string;
  couponCode?: string;
  discountType?: string;
  discountValue?: number;
  originalPrice?: number;
  discountedPrice?: number;
}

// Initialize Stripe with latest API version
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: undefined, // Use latest API version
});

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error("Missing required Supabase environment variables");
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

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

export async function POST(req: Request): Promise<NextResponse> {
  try {
    // Authenticate user
    const cookieStore = cookies();
    const authClient = createRouteHandlerClient({ cookies: () => cookieStore });
    const { data: { user }, error: authError } = await authClient.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: "Authentication required" },
        { status: 401 }
      );
    }
    
    // Parse request
    const data: SubscriptionRequest = await req.json();
    
    if (!data.subscriptionId) {
      return NextResponse.json(
        { success: false, error: "Missing subscription ID" },
        { status: 400 }
      );
    }
    
    const userId = user.id;
    const userEmail = user.email || data.userEmail;
    
    if (!userEmail) {
      return NextResponse.json(
        { success: false, error: "User email is required" },
        { status: 400 }
      );
    }
    
    console.log(`Creating subscription for user ${userId} with plan ${data.subscriptionId}`);
    if (data.variantKey) {
      console.log(`Using variant: ${data.variantKey}`);
    }
    if (data.couponCode) {
      console.log(`Applying coupon: ${data.couponCode}`);
    }
    
    // Fetch subscription data with coupons included
    const subscription = await sanityClient.fetch<SanitySubscription>(
      `*[_type == "subscription" && _id == $id][0]{
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
    );
    
    if (!subscription) {
      return NextResponse.json(
        { success: false, error: "Subscription plan not found" },
        { status: 404 }
      );
    }
    
    // Select variant if applicable
    let selectedVariant: SanitySubscriptionVariant | null = null;
    if (subscription.hasVariants && subscription.variants && subscription.variants.length > 0) {
      if (data.variantKey) {
        selectedVariant = subscription.variants.find(v => v._key === data.variantKey) || null;
        if (!selectedVariant) {
          return NextResponse.json(
            { success: false, error: "Selected variant not found" },
            { status: 404 }
          );
        }
      } else {
        selectedVariant = subscription.variants.find(v => v.isDefault) || subscription.variants[0];
      }
    }
    
    // Calculate effective price and billing period
    let effectivePrice = selectedVariant ? selectedVariant.price : subscription.price;
    const effectiveBillingPeriod = selectedVariant ? selectedVariant.billingPeriod : subscription.billingPeriod;
    const effectiveCustomMonths = selectedVariant 
      ? selectedVariant.customBillingPeriodMonths 
      : subscription.customBillingPeriodMonths;
    
    // Coupon handling
    let couponMetadata: CouponMetadata = {};
    let appliedCoupon: Coupon | null = null;
    
    if (data.couponCode && subscription.allowCoupons !== false) {
      const couponCode = data.couponCode.toUpperCase().trim();
      
      // Fetch coupon from Sanity
      const coupon = await sanityClient.fetch<Coupon>(
        `*[_type == "coupon" && code == $code && isActive == true][0]{
          _id,
          code,
          description,
          discountType,
          discountValue,
          "subscriptions": subscriptions[]->{ _id },
          usageLimit,
          usageCount,
          validFrom,
          validUntil,
          minimumPurchaseAmount
        }`,
        { code: couponCode }
      );
      
      if (coupon) {
        const now = new Date();
        const validFrom = new Date(coupon.validFrom);
        const validUntil = new Date(coupon.validUntil);
        
        let isValid = true;
        let errorMessage = "";
        
        if (now < validFrom || now > validUntil) {
          isValid = false;
          errorMessage = "Coupon is not valid at this time";
        } else if (coupon.usageLimit && coupon.usageCount >= coupon.usageLimit) {
          isValid = false;
          errorMessage = "Coupon has reached its usage limit";
        } else if (coupon.minimumPurchaseAmount && effectivePrice < coupon.minimumPurchaseAmount) {
          isValid = false;
          errorMessage = `Minimum purchase amount of $${coupon.minimumPurchaseAmount} required`;
        } else if (coupon.subscriptions && coupon.subscriptions.length > 0) {
          const isApplicable = coupon.subscriptions.some(sub => sub._id === data.subscriptionId);
          if (!isApplicable) {
            isValid = false;
            errorMessage = "Coupon is not valid for this subscription";
          }
        } else if (subscription.excludedCoupons?.some(ex => ex._id === coupon._id)) {
          isValid = false;
          errorMessage = "This coupon cannot be used with this subscription";
        }
        
        if (isValid) {
          appliedCoupon = coupon;
          const originalPrice = effectivePrice;
          
          if (coupon.discountType === 'percentage') {
            const discountAmount = (effectivePrice * coupon.discountValue) / 100;
            effectivePrice = Math.max(0, effectivePrice - discountAmount);
          } else if (coupon.discountType === 'fixed') {
            effectivePrice = Math.max(0, effectivePrice - coupon.discountValue);
          }
          
          couponMetadata = {
            couponId: coupon._id,
            couponCode: coupon.code,
            discountType: coupon.discountType,
            discountValue: coupon.discountValue,
            originalPrice: originalPrice,
            discountedPrice: effectivePrice
          };
          
          console.log(`Applied coupon ${coupon.code}: $${originalPrice} -> $${effectivePrice}`);
        } else {
          console.log(`Invalid coupon: ${errorMessage}`);
          // Do not fail request; proceed without coupon discount
        }
      }
    }
    
    // Stripe product creation if missing
    let stripeProductId = subscription.stripeProductId;
    if (!stripeProductId) {
      console.log("Creating new Stripe product");
      const product = await stripe.products.create({
        name: subscription.title,
        description: `${subscription.title} subscription`,
        metadata: {
          sanityId: subscription._id
        }
      });
      stripeProductId = product.id;
      await sanityClient.patch(subscription._id).set({ stripeProductId: product.id }).commit();
    }
    
    // Stripe price creation or retrieval
    let stripePriceId: string;
    if (appliedCoupon) {
      console.log("Creating new Stripe price with coupon discount");
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
          customBillingPeriodMonths: effectiveCustomMonths?.toString() || '',
          couponCode: appliedCoupon.code,
          originalPrice: couponMetadata.originalPrice?.toString() || ''
        }
      });
      stripePriceId = stripePrice.id;
    } else {
      if (selectedVariant && selectedVariant.stripePriceId) {
        stripePriceId = selectedVariant.stripePriceId;
      } else if (!selectedVariant && subscription.stripePriceId) {
        stripePriceId = subscription.stripePriceId;
      } else {
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
        if (selectedVariant) {
          await sanityClient
            .patch(subscription._id)
            .setIfMissing({ variants: [] })
            .set({ [`variants[_key=="${selectedVariant._key}"].stripePriceId`]: stripePrice.id })
            .commit();
        } else {
          await sanityClient.patch(subscription._id).set({ stripePriceId: stripePrice.id }).commit();
        }
      }
    }
    
    // Stripe customer retrieval or creation
    const { data: customerData, error: customerError } = await supabase
      .from('stripe_customers')
      .select('stripe_customer_id, user_id, email')
      .eq('user_id', userId)
      .single();
    
    let stripeCustomerId: string;
    if (customerError || !customerData) {
      console.log(`Creating new customer for user ${userId}`);
      const customer = await stripe.customers.create({
        email: userEmail,
        metadata: { userId }
      });
      stripeCustomerId = customer.id;
      await supabase.from('stripe_customers').insert({
        user_id: userId,
        stripe_customer_id: customer.id,
        email: userEmail
      });
    } else {
      stripeCustomerId = customerData.stripe_customer_id;
    }
    
    // Create Stripe checkout session
    const sessionParams: Stripe.Checkout.SessionCreateParams = {
      payment_method_types: ['card'],
      line_items: [{ price: stripePriceId, quantity: 1 }],
      mode: 'subscription',
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/appointment?subscription_success=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/subscriptions?canceled=true`,
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
          originalPrice: couponMetadata.originalPrice?.toString() || '',
          discountedPrice: effectivePrice.toString()
        })
      },
      client_reference_id: userId,
    };
    
    const session = await stripe.checkout.sessions.create(sessionParams);
    console.log(`Created checkout session: ${session.id}`);
    
    // Increment coupon usage count if applied
    if (appliedCoupon) {
      await sanityClient.patch(appliedCoupon._id).inc({ usageCount: 1 }).commit();
      console.log(`Incremented usage count for coupon ${appliedCoupon.code}`);
    }
    
    // Create pending user subscription in Sanity
    const startDate = new Date().toISOString();
    const userSubscription: UserSubscription = {
      _type: 'userSubscription',
      userId,
      userEmail,
      subscription: { _type: 'reference', _ref: subscription._id },
      variantKey: selectedVariant ? selectedVariant._key : undefined,
      startDate,
      isActive: false,
      status: 'pending',
      stripeSubscriptionId: '',
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
        originalPrice: couponMetadata.originalPrice,
      }),
    };
    
    const sanityResponse = await sanityClient.create(userSubscription);
    console.log(`Created pending Sanity user subscription: ${sanityResponse._id}`);
    
    // Create pending subscription in Supabase
    const supabaseSubscription: SupabaseUserSubscription = {
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
      ...(selectedVariant && {
        variant_key: selectedVariant._key,
        variant_title: selectedVariant.title,
        variant_dosage: `${selectedVariant.dosageAmount} ${selectedVariant.dosageUnit}`,
      }),
      ...(appliedCoupon && {
        coupon_code: appliedCoupon.code,
        coupon_discount_type: appliedCoupon.discountType,
        coupon_discount_value: appliedCoupon.discountValue,
        original_price: couponMetadata.originalPrice,
      }),
    };
    
    const { error: insertError } = await supabase.from('user_subscriptions').insert(supabaseSubscription);
    if (insertError) {
      console.error("Supabase insertion error:", insertError);
      throw new Error(`Failed to create Supabase record: ${insertError.message}`);
    }
    
    console.log(`✅ Created subscription records successfully`);
    
    return NextResponse.json({
      success: true,
      sessionId: session.id,
      url: session.url,
      metadata: {
        subscriptionId: subscription._id,
        variantKey: selectedVariant?._key,
        price: effectivePrice,
        billingPeriod: effectiveBillingPeriod,
        ...(appliedCoupon && {
          couponApplied: true,
          couponCode: appliedCoupon.code,
          originalPrice: couponMetadata.originalPrice,
          discountedPrice: effectivePrice,
          discountAmount: (couponMetadata.originalPrice || 0) - effectivePrice
        }),
      }
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("Error creating subscription:", error);
    return NextResponse.json(
      { 
        success: false, 
        error: errorMessage || "Failed to create subscription"
      }, 
      { status: 500 }
    );
  }
}
