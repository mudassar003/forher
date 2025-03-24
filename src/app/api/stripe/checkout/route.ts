// src/app/api/stripe/checkout/route.ts
import { NextResponse } from "next/server";
import { createCheckoutSession } from "@/lib/stripe";
import { client } from "@/sanity/lib/client";
import { createClient } from "@supabase/supabase-js";

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Types
interface CartItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
  image?: string;
}

interface CheckoutData {
  email: string;
  firstName: string;
  lastName: string;
  address: string;
  apartment?: string;
  city: string;
  country: string;
  postalCode?: string;
  phone: string;
  paymentMethod: string;
  shippingMethod: string;
  billingAddressType: string;
  cart: CartItem[];
  [key: string]: any; // Add index signature to allow string indexing
}

export async function POST(req: Request) {
  try {
    const data: CheckoutData = await req.json();
    
    // Validate required fields
    const requiredFields = [
      'email', 'firstName', 'lastName', 
      'address', 'city', 'country', 'phone',
      'paymentMethod', 'shippingMethod', 'cart'
    ] as const; // Use const assertion
    
    const missingFields = requiredFields.filter(field => !data[field]);
    if (missingFields.length > 0) {
      return NextResponse.json(
        { success: false, error: `Missing required fields: ${missingFields.join(', ')}` },
        { status: 400 }
      );
    }

    // Validate cart
    if (!Array.isArray(data.cart) || data.cart.length === 0) {
      return NextResponse.json(
        { success: false, error: "Cart cannot be empty" },
        { status: 400 }
      );
    }
    
    // Only proceed with Stripe if payment method is 'card'
    if (data.paymentMethod !== 'card') {
      return NextResponse.json(
        { 
          success: false, 
          error: "This endpoint only supports card payments" 
        },
        { status: 400 }
      );
    }

    // Generate a temporary order ID for reference
    const temporaryOrderId = `temp_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
    
    // Store order data temporarily in Supabase
    const { error: storeError } = await supabase
      .from('temp_orders')
      .insert({
        id: temporaryOrderId,
        order_data: data,
        created_at: new Date().toISOString(),
        expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24 hours expiry
      });

    if (storeError) {
      console.error("Failed to store temporary order data:", storeError);
      return NextResponse.json(
        { success: false, error: "Failed to initialize checkout process" },
        { status: 500 }
      );
    }

    // Calculate totals
    const subtotal = data.cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
    const shippingCost = 15; // Same as in your checkout page
    const total = subtotal + shippingCost;

    // Format for Stripe (prices must be in cents)
    const lineItems = data.cart.map(item => ({
      price_data: {
        currency: 'usd',
        product_data: {
          name: item.name,
          images: item.image ? [item.image] : undefined,
        },
        unit_amount: Math.round(item.price * 100), // Convert to cents
      },
      quantity: item.quantity,
    }));

    // Add shipping as a line item
    if (shippingCost > 0) {
      lineItems.push({
        price_data: {
          currency: 'usd',
          product_data: {
            name: 'Shipping',
          },
          unit_amount: shippingCost * 100, // Convert to cents
        },
        quantity: 1,
      });
    }

    // Create Stripe checkout session
    const session = await createCheckoutSession({
      lineItems,
      // FIX: Change success URL to match your confirmation page path
      successUrl: `${process.env.NEXT_PUBLIC_APP_URL}/checkout/order-confirmation?session_id={CHECKOUT_SESSION_ID}`,
      cancelUrl: `${process.env.NEXT_PUBLIC_APP_URL}/checkout/cancel`,
      metadata: {
        temporaryOrderId,
      },
      customerEmail: data.email,
    });

    return NextResponse.json({ 
      success: true, 
      url: session.url,
      sessionId: session.id,
    });

  } catch (error: any) {
    console.error("Stripe checkout error:", error);
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || "Failed to create checkout session",
        ...(process.env.NODE_ENV === 'development' && {
          stack: error.stack,
          details: error.details
        })
      }, 
      { status: 500 }
    );
  }
}