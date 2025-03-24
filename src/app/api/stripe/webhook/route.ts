// src/app/api/stripe/webhook/route.ts
import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { constructWebhookEvent, retrieveCheckoutSession } from "@/lib/stripe";
import { client } from "@/sanity/lib/client";
import { createClient } from "@supabase/supabase-js";
import { Stripe } from "stripe";

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// This is needed to disable body parsing since we need the raw body for Stripe signature verification
export const config = {
  api: {
    bodyParser: false,
  },
};

// Helper to process successful payments
async function processSuccessfulPayment(session: Stripe.Checkout.Session) {
  try {
    const { temporaryOrderId } = session.metadata || {};
    
    if (!temporaryOrderId) {
      throw new Error("No temporary order ID found in session metadata");
    }
    
    // Retrieve the temporary order data
    const { data: tempOrderData, error: fetchError } = await supabase
      .from('temp_orders')
      .select('order_data')
      .eq('id', temporaryOrderId)
      .single();
    
    if (fetchError || !tempOrderData) {
      throw new Error(`Failed to retrieve temporary order: ${fetchError?.message || 'Not found'}`);
    }

    const orderData = tempOrderData.order_data;
    
    // Calculate totals
    const subtotal = orderData.cart.reduce((acc: number, item: any) => acc + (item.price * item.quantity), 0);
    const shippingCost = 15; // Same as in checkout
    const total = subtotal + shippingCost;

    // Create order in Sanity
    const sanityOrder = {
      _type: "order",
      email: orderData.email,
      customerName: `${orderData.firstName} ${orderData.lastName}`.trim(),
      address: orderData.address,
      apartment: orderData.apartment,
      city: orderData.city,
      country: orderData.country,
      postalCode: orderData.postalCode,
      phone: orderData.phone,
      paymentMethod: "stripe",
      shippingMethod: orderData.shippingMethod,
      cart: orderData.cart.map((item: any) => ({
        productId: item.id,
        name: item.name,
        quantity: item.quantity,
        price: item.price,
        image: item.image
      })),
      stripeSessionId: session.id,
      stripePaymentIntentId: session.payment_intent as string,
      status: "paid", // Mark as paid since payment is confirmed
      total,
      subtotal,
      shippingCost
    };

    // Create document in Sanity
    const sanityResponse = await client.create(sanityOrder);
    const sanityId = sanityResponse._id;

    // Prepare Supabase order data
    const supabaseOrder = {
      email: orderData.email,
      customer_name: `${orderData.firstName} ${orderData.lastName}`.trim(),
      address: orderData.address,
      apartment: orderData.apartment,
      city: orderData.city,
      country: orderData.country,
      postal_code: orderData.postalCode,
      phone: orderData.phone,
      payment_method: "stripe",
      shipping_method: orderData.shippingMethod,
      status: "paid",
      total,
      subtotal,
      shipping_cost: shippingCost,
      sanity_id: sanityId,
      stripe_session_id: session.id,
      stripe_payment_intent_id: session.payment_intent as string
    };

    // Insert into Supabase orders table
    const { data: supabaseOrderData, error: orderError } = await supabase
      .from('orders')
      .insert(supabaseOrder)
      .select('id')
      .single();

    if (orderError) {
      throw new Error(`Failed to create order in Supabase: ${orderError.message}`);
    }

    // Get the order ID from Supabase
    const orderId = supabaseOrderData.id;

    // Prepare order items for Supabase
    const orderItems = orderData.cart.map((item: any) => ({
      order_id: orderId,
      product_id: item.id,
      name: item.name,
      quantity: item.quantity,
      price: item.price,
      image: item.image
    }));

    // Insert order items
    const { error: itemsError } = await supabase
      .from('order_items')
      .insert(orderItems);

    if (itemsError) {
      throw new Error(`Failed to create order items in Supabase: ${itemsError.message}`);
    }

    // Clean up the temporary order data
    await supabase
      .from('temp_orders')
      .delete()
      .eq('id', temporaryOrderId);

    return {
      success: true,
      sanityId,
      supabaseId: orderId
    };
  } catch (error: any) {
    console.error("Error processing payment:", error);
    return {
      success: false,
      error: error.message
    };
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.text();
    const signature = headers().get("stripe-signature") as string;

    if (!signature) {
      return NextResponse.json({ error: "No Stripe signature found" }, { status: 400 });
    }

    // Verify webhook signature and parse event
    const event = await constructWebhookEvent(body, signature);

    // Handle specific event types
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        
        // Process the successful payment
        const result = await processSuccessfulPayment(session);
        
        if (result.success) {
          return NextResponse.json({
            success: true,
            message: "Payment processed successfully",
            orderId: result.sanityId
          });
        } else {
          throw new Error(`Failed to process payment: ${result.error}`);
        }
      }
      
      case 'payment_intent.succeeded': {
        // Optional: Additional handling for payment intent success
        return NextResponse.json({ received: true });
      }
      
      case 'payment_intent.payment_failed': {
        // Optional: Handle failed payments
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        console.log(`❌ Payment failed: ${paymentIntent.id}`);
        return NextResponse.json({ received: true });
      }
      
      default: {
        // Handle other events or ignore them
        return NextResponse.json({ received: true });
      }
    }
  } catch (error: any) {
    console.error(`Webhook Error: ${error.message}`);
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || "Webhook handler failed",
      }, 
      { status: 400 }
    );
  }
}