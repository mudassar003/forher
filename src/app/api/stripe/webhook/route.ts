// src/app/api/stripe/webhook/route.ts
import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { Stripe } from "stripe";
import { createClient } from "@supabase/supabase-js";
import { client as sanityClient } from "@/sanity/lib/client";

// Initialize Stripe without explicitly setting API version
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY as string;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// This is needed to disable body parsing for Stripe signature verification
export const config = {
  api: {
    bodyParser: false,
  },
};

export async function POST(req: Request) {
  try {
    const body = await req.text();
    const signature = headers().get("stripe-signature") as string;

    if (!signature) {
      return NextResponse.json({ error: "No Stripe signature found" }, { status: 400 });
    }

    // Verify webhook signature
    const event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET as string
    );

    console.log(`⚡ Received Stripe webhook event: ${event.type}`);

    // Handle specific event types
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        console.log(`🔍 Processing checkout session: ${session.id}`);
        
        // Get the order ID from the session metadata
        const orderId = session.metadata?.orderId;
        const sanityId = session.metadata?.sanityId;
        
        if (!orderId && !sanityId) {
          console.error("No order ID found in session metadata");
          return NextResponse.json(
            { success: false, error: "No order ID found in session metadata" },
            { status: 400 }
          );
        }
        
        // Get customer information if available
        let customerId = session.customer as string;
        if (!customerId && session.customer_details?.email) {
          // Try to find or create a customer based on email
          try {
            const customers = await stripe.customers.list({
              email: session.customer_details.email,
              limit: 1
            });
            
            if (customers.data.length > 0) {
              customerId = customers.data[0].id;
            } else {
              const newCustomer = await stripe.customers.create({
                email: session.customer_details.email,
                name: session.customer_details.name || undefined,
                phone: session.customer_details.phone || undefined
              });
              customerId = newCustomer.id;
            }
          } catch (error) {
            console.error("Error creating/finding Stripe customer:", error);
          }
        }
        
        // Update Supabase order if we have a Supabase ID
        let supabaseOrder;
        let supabaseUpdateSuccess = false;
        
        if (orderId) {
          console.log(`Looking for Supabase order with ID: ${orderId}`);
          
          // Get the order from Supabase
          const { data: orderData, error: fetchError } = await supabase
            .from('orders')
            .select('id, sanity_id')
            .eq('id', orderId)
            .single();
          
          if (fetchError) {
            console.error(`Error fetching order from Supabase: ${fetchError.message}`);
          } else {
            supabaseOrder = orderData;
            
            // Update Supabase order status
            const { error: updateError } = await supabase
              .from('orders')
              .update({
                status: 'paid',
                payment_method: 'stripe', // Ensure payment method is set correctly
                payment_status: 'paid',
                stripe_session_id: session.id,
                stripe_payment_intent_id: session.payment_intent as string,
                stripe_customer_id: customerId || null,
                updated_at: new Date().toISOString()
              })
              .eq('id', orderId);
            
            if (updateError) {
              console.error(`Failed to update order in Supabase: ${updateError.message}`);
            } else {
              supabaseUpdateSuccess = true;
              console.log(`✅ Supabase order ${orderId} marked as paid`);
            }
          }
        }
        
        // Try to update Sanity as well
        const sanityOrderId = sanityId || supabaseOrder?.sanity_id;
        let sanityUpdateSuccess = false;
        
        if (sanityOrderId) {
          try {
            console.log(`Updating Sanity order ${sanityOrderId} with payment status`);
            
            // Use immediate commit to ensure the update is processed right away
            await sanityClient
              .patch(sanityOrderId)
              .set({
                status: 'paid', // Update order status
                paymentMethod: 'stripe', // Ensure payment method is set correctly
                paymentStatus: 'paid', // Update payment status to paid
                stripeSessionId: session.id,
                stripePaymentIntentId: session.payment_intent as string,
                stripeCustomerId: customerId || undefined
              })
              .commit({visibility: 'sync'}); // Use sync commit for immediate update
            
            sanityUpdateSuccess = true;
            console.log(`✅ Sanity order ${sanityOrderId} marked as paid`);
            
            // Double check the update was successful
            const updatedDoc = await sanityClient.getDocument(sanityOrderId);
            console.log(`Sanity order payment status after update: ${updatedDoc.paymentStatus}`);
          } catch (sanityError) {
            const errorMessage = sanityError instanceof Error ? sanityError.message : "Unknown error";
            console.error(`Failed to update Sanity order: ${errorMessage}`);
            console.error(sanityError);
          }
        }
        
        // If we couldn't update either database, return an error
        if (!supabaseUpdateSuccess && !sanityUpdateSuccess) {
          return NextResponse.json(
            { success: false, error: "Failed to update order in any database" },
            { status: 500 }
          );
        }
        
        return NextResponse.json({
          success: true,
          message: "Payment processed successfully",
          orderId: sanityOrderId || orderId
        });
      }
      
      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        console.log(`💰 Payment intent succeeded: ${paymentIntent.id}`);
        
        // If we have the metadata with order ID, double-check it's marked as paid
        const orderId = paymentIntent.metadata?.orderId;
        const sanityId = paymentIntent.metadata?.sanityId;
        
        if (orderId) {
          // Update Supabase
          const { error } = await supabase
            .from('orders')
            .update({
              payment_status: 'paid',
              payment_method: 'stripe',
              stripe_payment_intent_id: paymentIntent.id,
              updated_at: new Date().toISOString()
            })
            .eq('id', orderId);
          
          if (error) {
            console.error(`Failed to update Supabase order payment status: ${error.message}`);
          }
        }
        
        if (sanityId) {
          // Update Sanity
          try {
            await sanityClient
              .patch(sanityId)
              .set({
                paymentStatus: 'paid',
                paymentMethod: 'stripe',
                stripePaymentIntentId: paymentIntent.id
              })
              .commit({visibility: 'sync'});
              
            console.log(`✅ Sanity order payment intent updated: ${sanityId}`);
          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : "Unknown error";
            console.error(`Failed to update Sanity order payment status: ${errorMessage}`);
          }
        }
        
        return NextResponse.json({ received: true });
      }
      
      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        console.log(`❌ Payment failed: ${paymentIntent.id}`);
        
        // If we have the metadata with order ID, update the order status
        const orderId = paymentIntent.metadata?.orderId;
        const sanityId = paymentIntent.metadata?.sanityId;
        
        if (orderId) {
          // Update Supabase
          const { error } = await supabase
            .from('orders')
            .update({
              payment_status: 'failed',
              stripe_payment_intent_id: paymentIntent.id,
              updated_at: new Date().toISOString()
            })
            .eq('id', orderId);
          
          if (error) {
            console.error(`Failed to update Supabase order payment status: ${error.message}`);
          }
        }
        
        if (sanityId) {
          // Update Sanity
          try {
            await sanityClient
              .patch(sanityId)
              .set({
                paymentStatus: 'failed',
                stripePaymentIntentId: paymentIntent.id
              })
              .commit({visibility: 'sync'});
              
            console.log(`✅ Sanity order payment failure updated: ${sanityId}`);
          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : "Unknown error";
            console.error(`Failed to update Sanity order payment status: ${errorMessage}`);
          }
        }
        
        return NextResponse.json({ received: true });
      }
      
      default: {
        // Handle other events or ignore them
        return NextResponse.json({ received: true });
      }
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Webhook handler failed";
    console.error(`Webhook Error: ${errorMessage}`);
    return NextResponse.json(
      { 
        success: false, 
        error: errorMessage
      }, 
      { status: 400 }
    );
  }
}