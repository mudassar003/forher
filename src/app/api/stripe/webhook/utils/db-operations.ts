// src/app/api/stripe/webhook/utils/db-operations.ts
import { supabase, sanityClient } from './db-clients';
import { Stripe } from 'stripe';
import { 
  SubscriptionUpdateData, 
  SanitySubscriptionUpdateData,
  OrderUpdateData,
  SanityOrderUpdateData,
  AppointmentUpdateData,
  SanityAppointmentUpdateData
} from './types';

/**
 * Update a user subscription in Supabase
 */
export async function updateSupabaseSubscription(
  id: string,
  data: Partial<SubscriptionUpdateData>,
  matchField: 'id' | 'stripe_subscription_id' | 'stripe_session_id' = 'id'
): Promise<void> {
  const { error } = await supabase
    .from('user_subscriptions')
    .update(data)
    .eq(matchField, id);

  if (error) {
    console.error(`Error updating Supabase subscription by ${matchField}:`, error);
    throw new Error(`Failed to update subscription in Supabase: ${error.message}`);
  }
  
  console.log(`✅ Updated Supabase subscription (${matchField}: ${id})`);
}

/**
 * Update a user subscription in Sanity
 */
export async function updateSanitySubscription(
  id: string,
  data: Partial<SanitySubscriptionUpdateData>
): Promise<void> {
  try {
    await sanityClient
      .patch(id)
      .set(data)
      .commit();
      
    console.log(`✅ Updated Sanity subscription: ${id}`);
  } catch (error) {
    console.error("Error updating Sanity subscription:", error);
    throw new Error(`Failed to update subscription in Sanity: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Update an order in Supabase
 */
export async function updateSupabaseOrder(
  id: string,
  data: Partial<OrderUpdateData>,
  matchField: 'id' | 'stripe_session_id' = 'id'
): Promise<void> {
  const { error } = await supabase
    .from('orders')
    .update(data)
    .eq(matchField, id);

  if (error) {
    console.error(`Error updating Supabase order by ${matchField}:`, error);
    throw new Error(`Failed to update order in Supabase: ${error.message}`);
  }
  
  console.log(`✅ Updated Supabase order (${matchField}: ${id})`);
}

/**
 * Update an order in Sanity
 */
export async function updateSanityOrder(
  id: string,
  data: Partial<SanityOrderUpdateData>
): Promise<void> {
  try {
    await sanityClient
      .patch(id)
      .set(data)
      .commit({visibility: 'sync'});
      
    console.log(`✅ Updated Sanity order: ${id}`);
  } catch (error) {
    console.error("Error updating Sanity order:", error);
    throw new Error(`Failed to update order in Sanity: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Update an appointment in Supabase
 */
export async function updateSupabaseAppointment(
  id: string,
  data: Partial<AppointmentUpdateData>,
  matchField: 'id' | 'stripe_session_id' = 'id'
): Promise<void> {
  const { error } = await supabase
    .from('user_appointments')
    .update(data)
    .eq(matchField, id);

  if (error) {
    console.error(`Error updating Supabase appointment by ${matchField}:`, error);
    throw new Error(`Failed to update appointment in Supabase: ${error.message}`);
  }
  
  console.log(`✅ Updated Supabase appointment (${matchField}: ${id})`);
}

/**
 * Update an appointment in Sanity
 */
export async function updateSanityAppointment(
  id: string,
  data: Partial<SanityAppointmentUpdateData>
): Promise<void> {
  try {
    await sanityClient
      .patch(id)
      .set(data)
      .commit();
      
    console.log(`✅ Updated Sanity appointment: ${id}`);
  } catch (error) {
    console.error("Error updating Sanity appointment:", error);
    throw new Error(`Failed to update appointment in Sanity: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Get a user subscription from Supabase by various fields
 */
export async function getSupabaseSubscription(
  value: string,
  field: 'id' | 'stripe_subscription_id' | 'stripe_session_id' = 'id'
) {
  const { data, error } = await supabase
    .from('user_subscriptions')
    .select('id, sanity_id, appointments_used')
    .eq(field, value)
    .single();
  
  if (error) {
    console.error(`Error fetching subscription by ${field}:`, error);
    throw new Error(`Failed to fetch subscription: ${error.message}`);
  }
  
  return data;
}

/**
 * Get an appointment from Supabase by session ID
 */
export async function getSupabaseAppointment(
  sessionId: string,
  appointmentId?: string
): Promise<any> {
  try {
    // First try to find by session ID
    const { data: appointmentData, error: sessionError } = await supabase
      .from('user_appointments')
      .select('id, sanity_id, qualiphy_exam_status, payment_status')
      .eq('stripe_session_id', sessionId)
      .single();
    
    if (!sessionError && appointmentData) {
      console.log(`Found appointment by session ID: ${sessionId}`);
      return appointmentData;
    } else {
      console.log(`No appointment found with session ID ${sessionId}`);
    }
    
    // If appointment ID is provided, try that next
    if (appointmentId) {
      const { data: idAppointmentData, error: idError } = await supabase
        .from('user_appointments')
        .select('id, sanity_id, qualiphy_exam_status, payment_status')
        .eq('id', appointmentId)
        .single();
        
      if (!idError && idAppointmentData) {
        console.log(`Found appointment by ID: ${appointmentId}`);
        
        // Update the appointment with session ID for future reference
        const { error: updateError } = await supabase
          .from('user_appointments')
          .update({
            stripe_session_id: sessionId,
            updated_at: new Date().toISOString()
          })
          .eq('id', appointmentId);
          
        if (updateError) {
          console.warn(`Warning: Failed to update appointment with session ID: ${updateError.message}`);
        } else {
          console.log(`✅ Updated appointment ${appointmentId} with session ID ${sessionId}`);
        }
        
        return idAppointmentData;
      }
    }
    
    // Try looking up in meta table or session metadata
    if (sessionId) {
      // Check Stripe session metadata for appointment ID
      const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
        apiVersion: undefined, // Use latest API version
      });
      
      try {
        const session = await stripe.checkout.sessions.retrieve(sessionId);
        const metaAppointmentId = session.metadata?.appointmentId;
        
        if (metaAppointmentId) {
          console.log(`Found appointment ID ${metaAppointmentId} in session metadata`);
          
          const { data: metaAppointmentData, error: metaError } = await supabase
            .from('user_appointments')
            .select('id, sanity_id, qualiphy_exam_status, payment_status')
            .eq('id', metaAppointmentId)
            .single();
            
          if (!metaError && metaAppointmentData) {
            // Update the appointment with session ID for future reference
            const { error: updateError } = await supabase
              .from('user_appointments')
              .update({
                stripe_session_id: sessionId,
                updated_at: new Date().toISOString()
              })
              .eq('id', metaAppointmentId);
              
            if (updateError) {
              console.warn(`Warning: Failed to update appointment with session ID: ${updateError.message}`);
            } else {
              console.log(`✅ Updated appointment ${metaAppointmentId} with session ID ${sessionId}`);
            }
            
            return metaAppointmentData;
          }
        }
      } catch (stripeError) {
        console.warn(`Warning: Failed to check Stripe session metadata: ${stripeError}`);
      }
    }
    
    // If all lookups fail, return null
    console.log(`❌ No appointment found for session ID: ${sessionId} or appointment ID: ${appointmentId}`);
    return null;
  } catch (error) {
    console.error(`Error fetching appointment:`, error);
    throw new Error(`Failed to fetch appointment: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}