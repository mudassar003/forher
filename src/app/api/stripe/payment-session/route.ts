// src/app/api/stripe/payment-session/route.ts
import { NextResponse } from "next/server";
import { Stripe } from "stripe";
import { createClient } from "@supabase/supabase-js";
import { client as sanityClient } from "@/sanity/lib/client";

// Initialize Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16', // Use the latest API version available to you
});

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

interface PaymentSessionRequest {
  orderId: string;
  cart: CartItem[];
}

export async function POST(req: Request) {
  try {
    const data: PaymentSessionRequest = await req.json();
    
    // Validate required fields
    if (!data.orderId) {
      return NextResponse.json(
        { success: false, error: "Order ID is required" },
        { status: 400 }
      );
    }
    
    if (!Array.isArray(data.cart) || data.cart.length === 0) {
      return NextResponse.json(
        { success: false, error: "Cart is required and cannot be empty" },
        { status: 400 }
      );
    }
    
    // Determine if this is a Sanity ID or a Supabase ID
    const isSanityId = !data.orderId.includes('-'); // Sanity IDs don't have hyphens, UUID does
    
    let supabaseOrderData;
    let sanityId;
    
    if (isSanityId) {
      // Store the Sanity ID
      sanityId = data.orderId;
      
      console.log(`Looking up order by Sanity ID: ${sanityId}`);
      
      // Look up the order in Supabase by Sanity ID
      const { data: orderData, error: orderFetchError } = await supabase
        .from('orders')
        .select('*')
        .eq('sanity_id', data.orderId)
        .single();
      
      if (orderFetchError || !orderData) {
        console.error(`Order not found by Sanity ID: ${data.orderId}`);
        
        // Let's log the error details for debugging
        if (orderFetchError) {
          console.error(`Error details: ${JSON.stringify(orderFetchError)}`);
        }
        
        return NextResponse.json(
          { success: false, error: `Order not found by Sanity ID: ${data.orderId}` },
          { status: 404 }
        );
      }
      
      supabaseOrderData = orderData;
    } else {
      // Direct lookup by Supabase ID
      console.log(`Looking up order by Supabase ID: ${data.orderId}`);
      
      const { data: orderData, error: orderFetchError } = await supabase
        .from('orders')
        .select('*')
        .eq('id', data.orderId)
        .single();
      
      if (orderFetchError || !orderData) {
        return NextResponse.json(
          { success: false, error: `Order not found by Supabase ID: ${data.orderId}` },
          { status: 404 }
        );
      }
      
      supabaseOrderData = orderData;
      sanityId = orderData.sanity_id;
    }
    
    // Calculate totals
    const subtotal = data.cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
    const shippingCost = 15; // Same as in checkout page
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
    
    // Get customer email for pre-filling Stripe checkout
    const customerEmail = supabaseOrderData.email;
    
    // First, update the Supabase order with payment info
    const { error: updateError } = await supabase
      .from('orders')
      .update({
        payment_method: 'stripe', // Ensure payment method is set to stripe
        payment_status: 'pending',
        updated_at: new Date().toISOString()
      })
      .eq('id', supabaseOrderData.id);
    
    if (updateError) {
      console.error("Failed to update order with payment method in Supabase:", updateError);
      // Continue anyway as this is not critical
    } else {
      console.log(`✅ Updated Supabase order ${supabaseOrderData.id} payment method to stripe`);
    }
    
    // If we have a Sanity ID, update Sanity order too
    if (sanityId) {
      try {
        console.log(`Updating Sanity order ${sanityId} payment method`);
        
        // Update payment method in Sanity
        await sanityClient
          .patch(sanityId)
          .set({
            paymentMethod: 'stripe', // Update payment method to stripe
            paymentStatus: 'awaiting' // Set to awaiting payment
          })
          .commit({visibility: 'sync'});
          
        console.log(`✅ Updated Sanity order ${sanityId} payment method to stripe`);
        
        // Verify the update
        const updatedDoc = await sanityClient.getDocument(sanityId);
        console.log(`Sanity order payment method after update: ${updatedDoc.paymentMethod}`);
      } catch (sanityError: any) {
        console.error("Failed to update Sanity order payment method:", sanityError);
        console.error(sanityError);
        // Continue anyway as this is not critical
      }
    }
    
    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/checkout/order-confirmation?orderId=${sanityId || supabaseOrderData.id}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/checkout`,
      customer_email: customerEmail, // Pre-fill customer email
      metadata: {
        orderId: supabaseOrderData.id, // Always include Supabase ID
        sanityId: sanityId || null,    // Include Sanity ID if available
        customer_email: customerEmail  // Store email in metadata
      },
    });
    
    // Update the order with the Stripe session ID
    const { error: sessionUpdateError } = await supabase
      .from('orders')
      .update({
        stripe_session_id: session.id
      })
      .eq('id', supabaseOrderData.id);
    
    if (sessionUpdateError) {
      console.error("Failed to update order with Stripe session ID in Supabase:", sessionUpdateError);
      // Continue anyway as this is not critical
    } else {
      console.log(`✅ Updated Supabase order with session ID: ${session.id}`);
    }
    
    // Update Sanity with session ID
    if (sanityId) {
      try {
        console.log(`Updating Sanity order ${sanityId} with session ID: ${session.id}`);
        
        await sanityClient
          .patch(sanityId)
          .set({
            stripeSessionId: session.id
          })
          .commit({visibility: 'sync'});
          
        console.log(`✅ Updated Sanity order with session ID`);
        
        // Verify the update
        const updatedDoc = await sanityClient.getDocument(sanityId);
        console.log(`Sanity order session ID after update: ${updatedDoc.stripeSessionId}`);
      } catch (sanityError: any) {
        console.error("Failed to update Sanity order with session ID:", sanityError);
        console.error(sanityError);
        // Continue anyway as this is not critical
      }
    }
    
    console.log(`✅ Created Stripe session ${session.id} for order ${supabaseOrderData.id}`);
    
    return NextResponse.json({
      success: true,
      sessionId: session.id,
      url: session.url
    });
    
  } catch (error: any) {
    console.error("Error creating Stripe payment session:", error);
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || "Failed to create payment session"
      }, 
      { status: 500 }
    );
  }
}