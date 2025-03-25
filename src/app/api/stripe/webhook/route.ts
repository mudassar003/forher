// src/app/api/stripe/webhook/route.ts
import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { Stripe } from "stripe";
import { createClient } from "@supabase/supabase-js";
import { client as sanityClient } from "@/sanity/lib/client";

// Initialize Stripe
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
    const headersList = headers();
    const signature = headersList.get("stripe-signature") as string;

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
        
        // Extract metadata
        const userId = session.metadata?.userId;
        const userEmail = session.metadata?.userEmail;
        const subscriptionId = session.metadata?.subscriptionId;
        const appointmentId = session.metadata?.appointmentId;
        const appointmentType = session.metadata?.appointmentType;
        const fromSubscription = session.metadata?.fromSubscription === 'true';
        const userSubscriptionId = session.metadata?.userSubscriptionId;
        const qualiphyExamId = session.metadata?.qualiphyExamId;
        const orderId = session.metadata?.orderId;
        const sanityId = session.metadata?.sanityId;

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
        
        // Check what type of purchase this is
        const isSubscription = session.mode === 'subscription';
        const isAppointment = appointmentType === 'oneTime';
        const isRegularOrder = orderId || sanityId;
        
        // Handle different purchase types
        if (isSubscription && subscriptionId) {
          // Handle subscription purchase
          console.log(`Processing subscription purchase for ${subscriptionId}`);
          
          // Get Stripe subscription ID from the session
          const subscription = await stripe.subscriptions.retrieve(
            session.subscription as string
          );
          
          // Update Sanity user subscription
          const { data: sanityUserSub, error } = await supabase
            .from('user_subscriptions')
            .select('sanity_id')
            .eq('stripe_session_id', session.id)
            .single();
          
          if (error) {
            console.error("Error fetching user subscription:", error);
          }
          
          const userSubscriptionSanityId = sanityUserSub?.sanity_id;

          if (userSubscriptionSanityId) {
            // Calculate end date based on billing period
            const startDate = new Date();
            let endDate = new Date(startDate);
            
            // Default to next month, but this will be overridden by actual subscription end date
            endDate.setMonth(endDate.getMonth() + 1);
            
            if (subscription.current_period_end) {
              endDate = new Date(subscription.current_period_end * 1000);
            }
            
            try {
              // Update Sanity user subscription
              await sanityClient
                .patch(userSubscriptionSanityId)
                .set({
                  isActive: true,
                  status: 'active',
                  stripeSubscriptionId: subscription.id,
                  startDate: startDate.toISOString(),
                  endDate: endDate.toISOString(),
                  nextBillingDate: endDate.toISOString()
                })
                .commit();
                
              console.log(`✅ Updated Sanity user subscription: ${userSubscriptionSanityId}`);
            } catch (sanityError) {
              console.error("Error updating Sanity subscription:", sanityError);
            }
            
            // Update Supabase user subscription
            try {
              await supabase
                .from('user_subscriptions')
                .update({
                  status: 'active',
                  is_active: true,
                  stripe_subscription_id: subscription.id,
                  start_date: startDate.toISOString(),
                  end_date: endDate.toISOString(),
                  next_billing_date: endDate.toISOString()
                })
                .eq('stripe_session_id', session.id);
              
              console.log(`✅ Updated Supabase user subscription for session: ${session.id}`);
            } catch (supabaseError) {
              console.error("Error updating Supabase subscription:", supabaseError);
            }
          } else {
            console.error(`No user subscription found for session ID: ${session.id}`);
          }

          } else if (isAppointment && appointmentId) {
          // Handle one-time appointment purchase
          console.log(`Processing appointment purchase for ${appointmentId}`);
          
          // Find the appointment in Supabase
          const { data: appointmentData, error } = await supabase
            .from('user_appointments')
            .select('id, sanity_id')
            .eq('stripe_session_id', session.id)
            .single();
            
          if (error) {
            console.error("Error fetching appointment:", error);
          }
          
          const sanityAppointmentId = appointmentData?.sanity_id;
          
          if (sanityAppointmentId) {
            // Schedule default date (tomorrow)
            const scheduledDate = new Date();
            scheduledDate.setDate(scheduledDate.getDate() + 1);
            
            try {
              // Update Sanity user appointment
              await sanityClient
                .patch(sanityAppointmentId)
                .set({
                  status: 'scheduled',
                  scheduledDate: scheduledDate.toISOString()
                })
                .commit();
                
              console.log(`✅ Updated Sanity user appointment: ${sanityAppointmentId}`);
            } catch (sanityError) {
              console.error("Error updating Sanity appointment:", sanityError);
            }
            
            // Update Supabase user appointment
            try {
              await supabase
                .from('user_appointments')
                .update({
                  status: 'scheduled',
                  scheduled_date: scheduledDate.toISOString(),
                  stripe_customer_id: customerId || null
                })
                .eq('stripe_session_id', session.id);
                
              console.log(`✅ Updated Supabase user appointment for session: ${session.id}`);
            } catch (supabaseError) {
              console.error("Error updating Supabase appointment:", supabaseError);
            }

            // If this appointment is from a subscription, update the subscription usage
            if (fromSubscription && userSubscriptionId) {
              try {
                // Get current appointments used count from Supabase
                const { data: subscriptionData, error } = await supabase
                  .from('user_subscriptions')
                  .select('appointments_used, sanity_id')
                  .eq('id', userSubscriptionId)
                  .single();
                
                if (error) {
                  console.error("Error fetching subscription:", error);
                } else {
                  const appointmentsUsed = (subscriptionData.appointments_used || 0) + 1;
                  const subscriptionSanityId = subscriptionData.sanity_id;
                  
                  // Update appointment usage in Supabase
                  await supabase
                    .from('user_subscriptions')
                    .update({ appointments_used: appointmentsUsed })
                    .eq('id', userSubscriptionId);
                    
                  // Update appointment usage in Sanity if we have the Sanity ID
                  if (subscriptionSanityId) {
                    await sanityClient
                      .patch(subscriptionSanityId)
                      .set({ appointmentsUsed })
                      .commit();
                  }
                  
                  console.log(`✅ Updated subscription appointment usage: ${appointmentsUsed}`);
                }
              } catch (error) {
                console.error("Failed to update subscription appointment usage:", error);
              }
            }
            
            // Create Qualiphy appointment if exam ID is available
            if (qualiphyExamId && parseInt(qualiphyExamId) > 0) {
              try {
                // We'll need to create this in the Qualiphy system later
                // This is usually handled by a separate endpoint or when the user accesses
                // the Qualiphy widget for the first time
                console.log(`Will handle Qualiphy exam ID: ${qualiphyExamId} when user accesses widget`);
              } catch (error) {
                console.error("Failed to handle Qualiphy integration:", error);
              }
            }
          } else {
            console.error(`No user appointment found for session ID: ${session.id}`);
          }

          } else if (isRegularOrder) {
          // Handle regular order completion (from existing webhook)
          console.log(`Processing regular order for ID: ${orderId || sanityId}`);
          
          // Update Supabase order if we have a Supabase ID
          if (orderId) {
            try {
              await supabase
                .from('orders')
                .update({
                  status: 'paid',
                  payment_method: 'stripe',
                  payment_status: 'paid',
                  stripe_session_id: session.id,
                  stripe_payment_intent_id: session.payment_intent as string,
                  stripe_customer_id: customerId || null,
                  updated_at: new Date().toISOString()
                })
                .eq('id', orderId);
              
              console.log(`✅ Supabase order ${orderId} marked as paid`);
            } catch (error) {
              console.error(`Failed to update order in Supabase:`, error);
            }
          }
          
          // Update Sanity order if we have a Sanity ID
          if (sanityId) {
            try {
              await sanityClient
                .patch(sanityId)
                .set({
                  status: 'paid',
                  paymentMethod: 'stripe',
                  paymentStatus: 'paid',
                  stripeSessionId: session.id,
                  stripePaymentIntentId: session.payment_intent as string,
                  stripeCustomerId: customerId || undefined
                })
                .commit({visibility: 'sync'});
              
              console.log(`✅ Sanity order ${sanityId} marked as paid`);
            } catch (error) {
              console.error(`Failed to update Sanity order:`, error);
            }
          }
        } else {
          console.log("Unidentified checkout session type or missing ID:", session.metadata);
        }

        return NextResponse.json({
          success: true,
          message: "Checkout session processed successfully"
        });
      }
      
      case 'invoice.payment_succeeded': {
        // Handle successful subscription renewal
        const invoice = event.data.object as Stripe.Invoice;
        const subscriptionId = invoice.subscription as string;
        
        if (!subscriptionId) {
          return NextResponse.json({ 
            success: false, 
            error: "No subscription ID in invoice" 
          }, { status: 400 });
        }
        
        console.log(`Processing subscription renewal for ${subscriptionId}`);
        
        try {
          // Get subscription details
          const subscription = await stripe.subscriptions.retrieve(subscriptionId);
          
          // Find the user subscription in Supabase
          const { data: userSubscription, error } = await supabase
            .from('user_subscriptions')
            .select('id, sanity_id')
            .eq('stripe_subscription_id', subscriptionId)
            .single();
          
          if (error) {
            console.error("Error finding user subscription:", error);
            return NextResponse.json({ success: false, error: "Subscription not found" });
          }
          
          // Calculate new end date
          const endDate = new Date(subscription.current_period_end * 1000);
          
          // Update Supabase user subscription
          await supabase
            .from('user_subscriptions')
            .update({
              end_date: endDate.toISOString(),
              next_billing_date: endDate.toISOString(),
              status: 'active',
              is_active: true,
              updated_at: new Date().toISOString()
            })
            .eq('id', userSubscription.id);
            
          console.log(`✅ Updated Supabase user subscription for renewal`);
          // Update Sanity if we have the ID
          if (userSubscription.sanity_id) {
            await sanityClient
              .patch(userSubscription.sanity_id)
              .set({
                endDate: endDate.toISOString(),
                nextBillingDate: endDate.toISOString(),
                status: 'active',
                isActive: true
              })
              .commit();
              
            console.log(`✅ Updated Sanity user subscription for renewal: ${userSubscription.sanity_id}`);
          }
        } catch (error) {
          console.error("Error processing invoice payment:", error);
          return NextResponse.json({ success: false, error: "Failed to process invoice payment" });
        }
        
        return NextResponse.json({ received: true });
      }
      
      case 'invoice.payment_failed': {
        // Handle failed subscription payment
        const invoice = event.data.object as Stripe.Invoice;
        const subscriptionId = invoice.subscription as string;
        
        if (!subscriptionId) {
          return NextResponse.json({ 
            success: false, 
            error: "No subscription ID in invoice" 
          }, { status: 400 });
        }

        console.log(`Processing failed payment for subscription ${subscriptionId}`);
        
        try {
          // Find the user subscription in Supabase
          const { data: userSubscription, error } = await supabase
            .from('user_subscriptions')
            .select('id, sanity_id')
            .eq('stripe_subscription_id', subscriptionId)
            .single();
          
          if (error) {
            console.error("Error finding user subscription:", error);
            return NextResponse.json({ success: false, error: "Subscription not found" });
          }
          
          // Update Supabase user subscription
          await supabase
            .from('user_subscriptions')
            .update({
              status: 'past_due',
              updated_at: new Date().toISOString()
            })
            .eq('id', userSubscription.id);
              
          console.log(`✅ Updated Supabase user subscription to past_due`);
          
          // Update Sanity if we have the ID
          if (userSubscription.sanity_id) {
            await sanityClient
              .patch(userSubscription.sanity_id)
              .set({
                status: 'past_due'
              })
              .commit();
                
            console.log(`✅ Updated Sanity user subscription to past_due: ${userSubscription.sanity_id}`);
          }
        } catch (error) {
          console.error("Error processing invoice payment failure:", error);
          return NextResponse.json({ success: false, error: "Failed to process payment failure" });
        }
        
        return NextResponse.json({ received: true });
      }
        
        case 'customer.subscription.updated': {
        // Handle subscription updates (e.g., paused, resumed)
        const subscription = event.data.object as Stripe.Subscription;
        
        console.log(`Processing subscription update for ${subscription.id}`);
        console.log(`Subscription status: ${subscription.status}`);
        
        // Map Stripe status to our status
        let status = 'active';
        let isActive = true;
        
        switch (subscription.status) {
          case 'active':
            status = 'active';
            isActive = true;
            break;
          case 'past_due':
            status = 'past_due';
            isActive = true; // Still give access but flag it
            break;
          case 'canceled':
            status = 'cancelled';
            isActive = false;
            break;
          case 'unpaid':
            status = 'unpaid';
            isActive = false;
            break;
          case 'paused':
            status = 'paused';
            isActive = false;
            break;
          default:
            status = subscription.status;
            isActive = subscription.status === 'active';
        }
        
        try {
          // Find the user subscription in Supabase
          const { data: userSubscription, error } = await supabase
            .from('user_subscriptions')
            .select('id, sanity_id')
            .eq('stripe_subscription_id', subscription.id)
            .single();
          
          if (error) {
            console.error("Error finding user subscription:", error);
            return NextResponse.json({ success: false, error: "Subscription not found" });
          }

          // Update Supabase user subscription
          await supabase
            .from('user_subscriptions')
            .update({
              status,
              is_active: isActive,
              updated_at: new Date().toISOString()
            })
            .eq('id', userSubscription.id);
            
          console.log(`✅ Updated Supabase user subscription status: ${status}`);
          
          // Update Sanity if we have the ID
          if (userSubscription.sanity_id) {
            await sanityClient
              .patch(userSubscription.sanity_id)
              .set({
                status,
                isActive
              })
              .commit();
              
            console.log(`✅ Updated Sanity user subscription status: ${status}`);
          }
        } catch (error) {
          console.error("Error processing subscription update:", error);
          return NextResponse.json({ success: false, error: "Failed to process subscription update" });
        }
        
        return NextResponse.json({ received: true });
      }
      
      case 'customer.subscription.deleted': {
        // Handle subscription cancellation/expiration
        const subscription = event.data.object as Stripe.Subscription;
        
        console.log(`Processing subscription deletion for ${subscription.id}`);
        
        try {
          // Find the user subscription in Supabase
          const { data: userSubscription, error } = await supabase
            .from('user_subscriptions')
            .select('id, sanity_id')
            .eq('stripe_subscription_id', subscription.id)
            .single();
          
          if (error) {
            console.error("Error finding user subscription:", error);
            return NextResponse.json({ success: false, error: "Subscription not found" });
          }

          // Update Supabase user subscription
          await supabase
            .from('user_subscriptions')
            .update({
              status: 'cancelled',
              is_active: false,
              end_date: new Date().toISOString(),
              updated_at: new Date().toISOString()
            })
            .eq('id', userSubscription.id);
            
          console.log(`✅ Updated Supabase user subscription: marked as cancelled`);
          
          // Update Sanity if we have the ID
          if (userSubscription.sanity_id) {
            await sanityClient
              .patch(userSubscription.sanity_id)
              .set({
                status: 'cancelled',
                isActive: false,
                endDate: new Date().toISOString()
              })
              .commit();
              
            console.log(`✅ Updated Sanity user subscription: marked as cancelled`);
          }
        } catch (error) {
          console.error("Error processing subscription deletion:", error);
          return NextResponse.json({ success: false, error: "Failed to process subscription deletion" });
        }
        
        return NextResponse.json({ received: true });
      }
      
      case 'payment_intent.succeeded': {
        // Handle successful payment intent for regular orders
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        console.log(`💰 Payment intent succeeded: ${paymentIntent.id}`);
        
        // If we have the metadata with order ID, double-check it's marked as paid
        const orderId = paymentIntent.metadata?.orderId;
        const sanityId = paymentIntent.metadata?.sanityId;

        if (orderId) {
          // Update Supabase
          try {
            await supabase
              .from('orders')
              .update({
                payment_status: 'paid',
                payment_method: 'stripe',
                stripe_payment_intent_id: paymentIntent.id,
                updated_at: new Date().toISOString()
              })
              .eq('id', orderId);
              
            console.log(`✅ Updated Supabase order payment status: ${orderId}`);
          } catch (error) {
            console.error("Error updating order payment status:", error);
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
              
            console.log(`✅ Updated Sanity order payment status: ${sanityId}`);
          } catch (error) {
            console.error("Error updating Sanity order payment status:", error);
          }
        }
        
        return NextResponse.json({ received: true });
      }
      
      case 'payment_intent.payment_failed': {
        // Handle failed payment intent
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        console.log(`❌ Payment failed: ${paymentIntent.id}`);
        
        // If we have the metadata with order ID, update the order status
        const orderId = paymentIntent.metadata?.orderId;
        const sanityId = paymentIntent.metadata?.sanityId;
        
        if (orderId) {
          // Update Supabase
          try {
            await supabase
              .from('orders')
              .update({
                payment_status: 'failed',
                stripe_payment_intent_id: paymentIntent.id,
                updated_at: new Date().toISOString()
              })
              .eq('id', orderId);
              
            console.log(`✅ Updated Supabase order payment status to failed: ${orderId}`);
          } catch (error) {
            console.error("Error updating order payment status:", error);
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
              
            console.log(`✅ Updated Sanity order payment status to failed: ${sanityId}`);
          } catch (error) {
            console.error("Error updating Sanity order payment status:", error);
          }
        }
        
        return NextResponse.json({ received: true });
      }
      
      default: {
        // Handle other events or ignore them
        console.log(`Ignoring unhandled event type: ${event.type}`);
        return NextResponse.json({ received: true });
      }
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Webhook handler failed";
    console.error(`Webhook Error: ${errorMessage}`);
    
    if (error instanceof Error) {
      console.error(error.stack);
    }
    
    return NextResponse.json(
      { 
        success: false, 
        error: errorMessage
      }, 
      { status: 400 }
    );
  }
}