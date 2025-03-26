// src/app/api/sanity/webhook/route.ts
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { headers } from "next/headers";

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Type definitions
type SanityOperation = 'create' | 'update' | 'delete' | 'createOrReplace';
type SanityDocumentType = 'userSubscription' | 'userAppointment' | 'order' | string;

interface SanityWebhookPayload {
  _id: string;
  _type: SanityDocumentType;
  _rev?: string;
  _createdAt?: string;
  _updatedAt?: string;
  operation: SanityOperation;
  [key: string]: any;
}

// Table-related interfaces
interface SupabaseUpdateResult {
  data: any | null;
  error: Error | null;
}

/**
 * Webhook handler for Sanity events
 */
export async function POST(req: Request): Promise<NextResponse> {
  try {
    // Get the request body as text for signature verification
    const body = await req.text();
    const payload: SanityWebhookPayload = JSON.parse(body);
    
    // Check for Sanity webhook secret
    const headersList = headers();
    const webhookSecret = headersList.get('x-sanity-webhook-secret');
    
    // Verify the webhook secret
    if (webhookSecret !== process.env.SANITY_WEBHOOK_SECRET) {
      console.error('Invalid webhook secret');
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }
    
    // Handle document deletion event
    if (payload.operation === 'delete') {
      return await handleDocumentDeletion(payload);
    }
    
    // We can add handlers for other operations if needed
    return NextResponse.json({ success: true, message: 'Webhook received but no action taken' });
    
  } catch (error) {
    console.error('Error processing Sanity webhook:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error processing webhook' 
      }, 
      { status: 500 }
    );
  }
}

/**
 * Handle document deletion specifically
 */
async function handleDocumentDeletion(payload: SanityWebhookPayload): Promise<NextResponse> {
  const { _id, _type } = payload;
  
  console.log(`Processing deletion for Sanity ${_type} document with ID ${_id}`);
  
  try {
    // Map Sanity document types to Supabase tables
    const typeToTableMap: Record<string, string> = {
      'userSubscription': 'user_subscriptions',
      'userAppointment': 'user_appointments',
      'order': 'orders'
    };
    
    const table = typeToTableMap[_type];
    
    if (!table) {
      console.log(`No matching Supabase table found for Sanity type ${_type}`);
      return NextResponse.json({ 
        success: false, 
        message: `No action taken for document type ${_type}` 
      });
    }
    
    // Rather than hard deleting, use soft deletion by setting is_deleted flag
    const { data, error } = await supabase
      .from(table)
      .update({ 
        is_deleted: true,
        updated_at: new Date().toISOString() 
      })
      .eq('sanity_id', _id);
      
    if (error) {
      console.error(`Error updating Supabase record for deleted Sanity document:`, error);
      return NextResponse.json(
        { success: false, error: error.message }, 
        { status: 500 }
      );
    }
    
    console.log(`✅ Successfully marked Supabase record as deleted for Sanity ID: ${_id}`);
    
    // Handle special cases for different document types
    if (_type === 'userSubscription') {
      // When a subscription is deleted, also mark related appointments as deleted
      await handleRelatedSubscriptionData(_id);
    } else if (_type === 'order') {
      // When an order is deleted, mark its order items as deleted
      await handleRelatedOrderData(_id);
    }
    
    return NextResponse.json({
      success: true,
      message: `Successfully marked ${_type} as deleted in Supabase`
    });
    
  } catch (error) {
    console.error('Error handling document deletion:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error handling deletion' 
      }, 
      { status: 500 }
    );
  }
}

/**
 * Handle related data for deleted subscriptions
 */
async function handleRelatedSubscriptionData(subscriptionId: string): Promise<void> {
  try {
    // Mark any appointments that are linked to this subscription as deleted
    const { error } = await supabase
      .from('user_appointments')
      .update({ 
        is_deleted: true,
        updated_at: new Date().toISOString()
      })
      .eq('subscription_id', subscriptionId)
      .eq('is_from_subscription', true);
      
    if (error) {
      console.error(`Error marking related appointments as deleted:`, error);
      // Non-blocking error - we continue even if this fails
    } else {
      console.log(`✅ Successfully marked related appointments as deleted for subscription ID: ${subscriptionId}`);
    }
  } catch (error) {
    console.error('Error handling related subscription data:', error);
    // Non-blocking error - we continue even if this fails
  }
}

/**
 * Handle related data for deleted orders
 */
async function handleRelatedOrderData(orderId: string): Promise<void> {
  try {
    // Mark order items as deleted
    const { error } = await supabase
      .from('order_items')
      .update({ 
        is_deleted: true,
        updated_at: new Date().toISOString()
      })
      .eq('order_id', orderId);
      
    if (error) {
      console.error(`Error marking order items as deleted:`, error);
      // Non-blocking error - we continue even if this fails
    } else {
      console.log(`✅ Successfully marked order items as deleted for order ID: ${orderId}`);
    }
  } catch (error) {
    console.error('Error handling related order data:', error);
    // Non-blocking error - we continue even if this fails
  }
}

/**
 * Additional helper for handling undelete operations (if needed in the future)
 */
async function handleDocumentUndelete(payload: SanityWebhookPayload): Promise<NextResponse> {
  const { _id, _type } = payload;
  
  // Similar logic to deletion, but setting is_deleted to false instead
  // Implementation would go here
  
  return NextResponse.json({
    success: true,
    message: `This would handle document undeletion for ${_type} with ID ${_id}`
  });
}