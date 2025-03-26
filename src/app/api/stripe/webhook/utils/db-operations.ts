// src/app/api/stripe/webhook/utils/db-operations.ts
import { supabase, sanityClient } from './db-clients';
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
  data: SubscriptionUpdateData,
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
  data: SanitySubscriptionUpdateData
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
  data: OrderUpdateData,
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
  data: SanityOrderUpdateData
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
  data: AppointmentUpdateData,
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
  data: SanityAppointmentUpdateData
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
  sessionId: string
) {
  const { data, error } = await supabase
    .from('user_appointments')
    .select('id, sanity_id')
    .eq('stripe_session_id', sessionId)
    .single();
  
  if (error) {
    console.error(`Error fetching appointment by session ID:`, error);
    throw new Error(`Failed to fetch appointment: ${error.message}`);
  }
  
  return data;
}