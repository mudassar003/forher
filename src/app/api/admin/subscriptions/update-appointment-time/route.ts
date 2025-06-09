// src/app/api/admin/subscriptions/update-appointment-time/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase admin client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

interface AppointmentTimeUpdateRequest {
  subscriptionId: string;
  appointment_accessed_at: string | null;
  appointment_access_expired: boolean;
  appointment_access_duration: number;
}

export async function POST(req: NextRequest) {
  try {
    const body: AppointmentTimeUpdateRequest = await req.json();
    const { 
      subscriptionId, 
      appointment_accessed_at, 
      appointment_access_expired, 
      appointment_access_duration 
    } = body;

    console.log('🔧 Admin updating appointment time for subscription:', subscriptionId);
    console.log('Raw request body:', body);
    console.log('Update data:', {
      appointment_accessed_at,
      appointment_access_expired,
      appointment_access_duration
    });

    // Validate required fields
    if (!subscriptionId) {
      console.error('❌ Missing subscriptionId');
      return NextResponse.json(
        { error: 'Subscription ID is required' },
        { status: 400 }
      );
    }

    // Validate duration (1 minute to 2 hours)
    if (typeof appointment_access_duration !== 'number' || appointment_access_duration < 60 || appointment_access_duration > 7200) {
      console.error('❌ Invalid duration:', appointment_access_duration);
      return NextResponse.json(
        { error: 'Duration must be a number between 60 and 7200 seconds (1 minute to 2 hours)' },
        { status: 400 }
      );
    }

    // Validate expired flag
    if (typeof appointment_access_expired !== 'boolean') {
      console.error('❌ Invalid expired flag:', appointment_access_expired);
      return NextResponse.json(
        { error: 'appointment_access_expired must be a boolean' },
        { status: 400 }
      );
    }

    // Process the accessed_at timestamp
    let processedAccessedAt = appointment_accessed_at;
    if (appointment_accessed_at) {
      try {
        // Convert to proper timestamp format (remove Z for timestamp without time zone)
        const date = new Date(appointment_accessed_at);
        if (isNaN(date.getTime())) {
          throw new Error('Invalid date');
        }
        processedAccessedAt = date.toISOString().replace('Z', '');
        console.log('✅ Processed timestamp:', processedAccessedAt);
      } catch (dateError) {
        console.error('❌ Invalid date format:', appointment_accessed_at);
        return NextResponse.json(
          { error: 'Invalid date format for appointment_accessed_at' },
          { status: 400 }
        );
      }
    }

    const now = new Date().toISOString();

    console.log('📝 Updating database with:', {
      appointment_accessed_at: processedAccessedAt,
      appointment_access_expired,
      appointment_access_duration,
      updated_at: now
    });

    // Update Supabase subscription
    const { error: supabaseError } = await supabaseAdmin
      .from('user_subscriptions')
      .update({
        appointment_accessed_at: processedAccessedAt,
        appointment_access_expired,
        appointment_access_duration,
        updated_at: now
      })
      .eq('id', subscriptionId);

    if (supabaseError) {
      console.error('❌ Supabase update error:', supabaseError);
      return NextResponse.json(
        { error: `Failed to update subscription in Supabase: ${supabaseError.message}` },
        { status: 500 }
      );
    }

    console.log('✅ Successfully updated appointment time in Supabase');

    return NextResponse.json({
      success: true,
      message: 'Appointment time updated successfully',
      data: {
        subscriptionId,
        appointment_accessed_at: processedAccessedAt,
        appointment_access_expired,
        appointment_access_duration
      }
    });

  } catch (error) {
    console.error('❌ Error updating appointment time:', error);
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        success: false 
      },
      { status: 500 }
    );
  }
}