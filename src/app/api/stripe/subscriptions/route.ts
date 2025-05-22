// src/app/api/stripe/subscriptions/route.ts
import { NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";
import { client as sanityClient } from "@/sanity/lib/client";
import { cookies } from "next/headers";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { v4 as uuidv4 } from 'uuid';

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
}

interface SubscriptionRequest {
  subscriptionId: string;
  userId: string;
  userEmail: string;
  variantKey?: string;
}

interface StripeCustomer {
  stripe_customer_id: string;
  user_id: string;
  email: string;
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
      
      // Stripe limitations: max 12 months for monthly interval
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
    // Get authenticated user from cookies
    const cookieStore = cookies();
    const authClient = createRouteHandlerClient({ cookies: () => cookieStore });
    
    // Verify the user is authenticated
    const { data: { user }, error: authError } = await authClient.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: "Authentication required" },
        { status: 401 }
      );
    }
    
    // Parse request data
    const data: SubscriptionRequest = await req.json();
    
    // Validate required fields
    if (!data.subscriptionId) {
      return NextResponse.json(
        { success: false, error: "Missing subscription ID" },
        { status: 400 }
      );
    }
    
    // Security: Use authenticated user's data
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
    
    // 1. Fetch subscription details from Sanity
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
        }
      }`,
      { id: data.subscriptionId }
    );
    
    if (!subscription) {
      return NextResponse.json(
        { success: false, error: "Subscription plan not found" },
        { status: 404 }
      );
    }
    
    console.log(`Fetched subscription: ${subscription.title}`);
    
    // 2. Handle variant selection
    let selectedVariant: SanitySubscriptionVariant | null = null;
    
    if (subscription.hasVariants && subscription.variants && subscription.variants.length > 0) {
      if (data.variantKey) {
        // Find the specific variant by key
        selectedVariant = subscription.variants.find(v => v._key === data.variantKey) || null;
        
        if (!selectedVariant) {
          return NextResponse.json(
            { success: false, error: "Selected variant not found" },
            { status: 404 }
          );
        }
      } else {
        // Use default variant or first one
        selectedVariant = subscription.variants.find(v => v.isDefault) || subscription.variants[0];
      }
      
      console.log(`Using variant: ${selectedVariant.title} (${selectedVariant._key})`);
    }
    
    // 3. Determine pricing and billing details
    const effectivePrice = selectedVariant ? selectedVariant.price : subscription.price;
    const effectiveBillingPeriod = selectedVariant ? selectedVariant.billingPeriod : subscription.billingPeriod;
    const effectiveCustomMonths = selectedVariant 
      ? selectedVariant.customBillingPeriodMonths 
      : subscription.customBillingPeriodMonths;
    
    // 4. Handle Stripe product creation
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
      
      // Update Sanity with the Stripe product ID
      await sanityClient
        .patch(subscription._id)
        .set({ stripeProductId: product.id })
        .commit();
        
      console.log(`Created Stripe product: ${product.id}`);
    }
    
    // 5. Handle Stripe price creation
    let stripePriceId: string;
    
    // Check if we already have a price ID for this variant/subscription
    if (selectedVariant && selectedVariant.stripePriceId) {
      stripePriceId = selectedVariant.stripePriceId;
    } else if (!selectedVariant && subscription.stripePriceId) {
      stripePriceId = subscription.stripePriceId;
    } else {
      // Create new Stripe price
      console.log("Creating new Stripe price");
      
      const { interval, intervalCount } = getStripeIntervalConfig(
        effectiveBillingPeriod,
        effectiveCustomMonths
      );
      
      const stripePrice = await stripe.prices.create({
        product: stripeProductId,
        unit_amount: Math.round(effectivePrice * 100), // Convert to cents
        currency: 'usd',
        recurring: {
          interval: interval,
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
      
      // Update the price ID in Sanity
      if (selectedVariant) {
        // Update the variant's price ID
        await sanityClient
          .patch(subscription._id)
          .setIfMissing({ variants: [] })
          .set({
            [`variants[_key=="${selectedVariant._key}"].stripePriceId`]: stripePrice.id
          })
          .commit();
      } else {
        // Update the main subscription's price ID
        await sanityClient
          .patch(subscription._id)
          .set({ stripePriceId: stripePrice.id })
          .commit();
      }
        
      console.log(`Created Stripe price: ${stripePrice.id}`);
    }
    
    // 6. Handle Stripe customer
    const { data: customerData, error: customerError } = await supabase
      .from('stripe_customers')
      .select('stripe_customer_id, user_id, email')
      .eq('user_id', userId)
      .single<StripeCustomer>();
      
    let stripeCustomerId: string;
    
    if (customerError || !customerData) {
      console.log(`Creating new customer for user ${userId}`);
      // Create a Stripe customer
      const customer = await stripe.customers.create({
        email: userEmail,
        metadata: {
          userId: userId
        }
      });
      
      stripeCustomerId = customer.id;
      
      // Save customer ID to Supabase
      await supabase
        .from('stripe_customers')
        .insert({
          user_id: userId,
          stripe_customer_id: customer.id,
          email: userEmail
        });
        
      console.log(`Created Stripe customer: ${customer.id}`);
    } else {
      stripeCustomerId = customerData.stripe_customer_id;
      console.log(`Using existing Stripe customer: ${stripeCustomerId}`);
    }

    // 7. Create checkout session with proper metadata
    const sessionParams: Stripe.Checkout.SessionCreateParams = {
      payment_method_types: ['card'],
      line_items: [
        {
          price: stripePriceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/appointment?subscription_success=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/subscriptions?canceled=true`,
      customer: stripeCustomerId,
      metadata: {
        userId: userId,
        userEmail: userEmail,
        subscriptionId: subscription._id,
        variantKey: selectedVariant ? selectedVariant._key : '',
        subscriptionType: "subscription"
      },
      client_reference_id: userId,
    };
    
    const session = await stripe.checkout.sessions.create(sessionParams);
    
    console.log(`Created checkout session: ${session.id}`);
    
    // 8. Create pending user subscription in Sanity
    const startDate = new Date().toISOString();
    const userSubscription: UserSubscription = {
      _type: 'userSubscription',
      userId: userId,
      userEmail: userEmail,
      subscription: {
        _type: 'reference',
        _ref: subscription._id
      },
      variantKey: selectedVariant ? selectedVariant._key : undefined,
      startDate: startDate,
      isActive: false, // Will be set to true when payment succeeds
      status: 'pending',
      stripeSubscriptionId: '', // Will be updated by webhook
      stripeCustomerId: stripeCustomerId,
      billingPeriod: effectiveBillingPeriod,
      billingAmount: effectivePrice,
      hasAppointmentAccess: subscription.appointmentAccess || false,
      appointmentDiscountPercentage: subscription.appointmentDiscountPercentage || 0,
      stripeSessionId: session.id
    };
    
    const sanityResponse = await sanityClient.create(userSubscription);
    console.log(`Created pending Sanity user subscription: ${sanityResponse._id}`);
    
    // 9. Create pending subscription in Supabase
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
      appointment_discount_percentage: subscription.appointmentDiscountPercentage || 0
    };
    
    // Add variant information if a variant was selected
    if (selectedVariant) {
      supabaseSubscription.variant_key = selectedVariant._key;
      supabaseSubscription.variant_title = selectedVariant.title;
      supabaseSubscription.variant_dosage = `${selectedVariant.dosageAmount} ${selectedVariant.dosageUnit}`;
    }
    
    const { error: insertError } = await supabase
      .from('user_subscriptions')
      .insert(supabaseSubscription);
      
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
        billingPeriod: effectiveBillingPeriod
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