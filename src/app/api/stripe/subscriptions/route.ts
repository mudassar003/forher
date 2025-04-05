// src/app/api/stripe/subscriptions/route.ts
import { NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";
import { client as sanityClient } from "@/sanity/lib/client";
import { cookies } from "next/headers";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { v4 as uuidv4 } from 'uuid'; // Import UUID generator

// Define types for Sanity content
interface SanitySubscription {
  _id: string;
  title: string;
  price: number;
  billingPeriod: "monthly" | "quarterly" | "annually";
  stripePriceId?: string;
  stripeProductId?: string;
  appointmentAccess: boolean;
  appointmentDiscountPercentage: number;
  features: Array<{
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

interface StripeCustomer {
  stripe_customer_id: string;
  user_id: string;
  email: string;
}

interface SupabaseUserSubscription {
  id: string; // Add this field to ensure we have an ID
  user_id: string;
  user_email: string;
  sanity_id: string;
  sanity_subscription_id: string;
  subscription_name: string;
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
  subscriptionId: string; // Sanity subscription ID
  userId: string;        // Supabase user ID
  userEmail: string;     // User's email
}

// Initialize Stripe with latest API version (it will automatically use the latest)
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
    
    // Security check: Ensure user can only create subscriptions for themselves
    // Override any user ID provided in the request with the authenticated user's ID
    const userId = user.id;
    const userEmail = user.email || data.userEmail;
    
    if (!userEmail) {
      return NextResponse.json(
        { success: false, error: "User email is required" },
        { status: 400 }
      );
    }
    
    console.log(`Creating subscription for user ${userId} with plan ${data.subscriptionId}`);
    
    // 1. Fetch subscription details from Sanity
    const subscription = await sanityClient.fetch<SanitySubscription>(
      `*[_type == "subscription" && _id == $id][0]{
        _id,
        title,
        price,
        billingPeriod,
        stripePriceId,
        stripeProductId,
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
    
    // 2. Create or get Stripe product and price IDs
    let stripeProductId = subscription.stripeProductId;
    let stripePriceId = subscription.stripePriceId;
    
    // If no Stripe product ID exists, create one
    if (!stripeProductId) {
      console.log("Creating new Stripe product");
      const product = await stripe.products.create({
        name: subscription.title,
        description: `${subscription.title} - ${subscription.billingPeriod} subscription`,
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
    
    // If no Stripe price ID exists, create one
    if (!stripePriceId) {
      console.log("Creating new Stripe price");
      
      // Convert billing period to interval and interval_count
      let interval: Stripe.PriceCreateParams.Recurring.Interval = "month";
      let intervalCount = 1;
      
      switch (subscription.billingPeriod) {
        case "monthly":
          interval = "month";
          intervalCount = 1;
          break;
        case "quarterly":
          interval = "month";
          intervalCount = 3;
          break;
        case "annually":
          interval = "year";
          intervalCount = 1;
          break;
        default:
          interval = "month";
          intervalCount = 1;
      }
      
      const price = await stripe.prices.create({
        product: stripeProductId,
        unit_amount: Math.round(subscription.price * 100), // Convert to cents
        currency: 'usd',
        recurring: {
          interval: interval,
          interval_count: intervalCount,
        },
        metadata: {
          sanityId: subscription._id
        }
      });
      
      stripePriceId = price.id;
      
      // Update Sanity with the Stripe price ID
      await sanityClient
        .patch(subscription._id)
        .set({ stripePriceId: price.id })
        .commit();
        
      console.log(`Created Stripe price: ${price.id}`);
    }
    
    // 3. Check if customer exists, if not create one
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

    // Type for session creation parameters
    const sessionParams: Stripe.Checkout.SessionCreateParams = {
      payment_method_types: ['card'],
      line_items: [
        {
          price: stripePriceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      // Modified success_url to redirect to appointment page directly
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/appointment?subscription_success=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/subscriptions?canceled=true`,
      customer: stripeCustomerId,
      metadata: {
        userId: userId,
        userEmail: userEmail,
        subscriptionId: subscription._id,
        subscriptionType: "subscription" // To differentiate from one-time appointments
      },
      client_reference_id: userId,
    };
    
    // 4. Create a checkout session for the subscription
    const session = await stripe.checkout.sessions.create(sessionParams);
    
    console.log(`Created checkout session: ${session.id}`);
    
    // 5. Create a pending user subscription in Sanity
    const startDate = new Date().toISOString();
    const userSubscription: UserSubscription = {
      _type: 'userSubscription',
      userId: userId,
      userEmail: userEmail,
      subscription: {
        _type: 'reference',
        _ref: subscription._id
      },
      startDate: startDate,
      isActive: false, // Will be set to true when payment succeeds
      status: 'pending',
      stripeSubscriptionId: '', // Will be updated by webhook
      stripeCustomerId: stripeCustomerId,
      billingPeriod: subscription.billingPeriod,
      billingAmount: subscription.price,
      hasAppointmentAccess: subscription.appointmentAccess || false,
      appointmentDiscountPercentage: subscription.appointmentDiscountPercentage || 0,
      stripeSessionId: session.id
    };
    
    const sanityResponse = await sanityClient.create(userSubscription);
    console.log(`Created pending Sanity user subscription: ${sanityResponse._id}`);
    
    // 6. Create pending subscription in Supabase
    const supabaseSubscription: SupabaseUserSubscription = {
      id: uuidv4(), // Generate a UUID for the ID field
      user_id: userId,
      user_email: userEmail,
      sanity_id: sanityResponse._id,
      sanity_subscription_id: subscription._id,
      subscription_name: subscription.title,
      plan_id: subscription._id, // Using Sanity subscription ID as plan_id
      plan_name: subscription.title, // Using subscription title as plan_name
      stripe_session_id: session.id,
      stripe_customer_id: stripeCustomerId,
      billing_amount: subscription.price,
      billing_period: subscription.billingPeriod,
      start_date: startDate,
      status: 'pending',
      is_active: false,
      has_appointment_access: subscription.appointmentAccess || false,
      appointment_discount_percentage: subscription.appointmentDiscountPercentage || 0
    };
    
    const { error: insertError } = await supabase
      .from('user_subscriptions')
      .insert(supabaseSubscription);
      
    if (insertError) {
      console.error("Supabase insertion error:", insertError);
      throw new Error(`Failed to create Supabase record: ${insertError.message}`);
    }
    
    return NextResponse.json({
      success: true,
      sessionId: session.id,
      url: session.url
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