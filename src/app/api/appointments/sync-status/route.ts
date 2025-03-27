// src/app/api/appointments/sync-status/route.ts
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { client as sanityClient } from "@/sanity/lib/client";
import Stripe from "stripe";
import { cookies } from "next/headers";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";

// Initialize Stripe client
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: undefined, // Use latest API version
});

// Initialize Supabase admin client for server operations
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

interface SyncRequest {
  appointmentId?: string;
}

interface AppointmentData {
  id: string;
  sanity_id?: string | null;
  stripe_session_id?: string | null;
  status: string;
  payment_status?: string | null;
  qualiphy_exam_status?: string | null;
  qualiphy_patient_exam_id?: number | null;
  qualiphy_exam_id?: number | null;
}

export async function POST(req: Request) {
  try {
    // Parse request body
    const data: SyncRequest = await req.json();
    
    // Get auth client with user's cookie context
    const cookieStore = cookies();
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });

    // Verify the user is authenticated
    const { data: authData } = await supabase.auth.getUser();
    if (!authData.user) {
      return NextResponse.json(
        { success: false, error: "Authentication required" },
        { status: 401 }
      );
    }
    
    console.log(`Processing appointment sync for user ${authData.user.id}`);
    
    // Fetch the user's appointments
    let query = supabaseAdmin
      .from('user_appointments')
      .select('id, sanity_id, stripe_session_id, status, payment_status, qualiphy_exam_status, qualiphy_patient_exam_id, qualiphy_exam_id')
      .eq('user_id', authData.user.id);
    
    // If specific appointment ID is provided, filter by it
    if (data.appointmentId) {
      query = query.eq('id', data.appointmentId);
    } else {
      // Otherwise, only sync recent appointments that are not completed or cancelled
      query = query.not('status', 'in', '("completed","cancelled")');
    }
    
    const { data: appointments, error: fetchError } = await query;
    
    if (fetchError) {
      return NextResponse.json(
        { success: false, error: `Failed to fetch appointments: ${fetchError.message}` },
        { status: 500 }
      );
    }
    
    if (!appointments || appointments.length === 0) {
      return NextResponse.json(
        { success: true, message: "No appointments found to sync" }
      );
    }
    
    // Process each appointment
    const results = await Promise.all(appointments.map(async (appointment) => {
      try {
        return await syncAppointmentStatus(appointment);
      } catch (error) {
        console.error(`Error syncing appointment ${appointment.id}:`, error);
        return {
          id: appointment.id,
          success: false,
          error: error instanceof Error ? error.message : "Unknown error"
        };
      }
    }));
    
    // Return results
    return NextResponse.json({
      success: true,
      results
    });
    
  } catch (error) {
    console.error("Error in appointment sync:", error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : "Failed to sync appointment statuses"
      }, 
      { status: 500 }
    );
  }
}

/**
 * Sync a single appointment's status with Stripe and Qualiphy
 */
async function syncAppointmentStatus(appointment: AppointmentData) {
  let statusChanged = false;
  let stripeStatus = null;
  let qualiphyStatus = null;
  
  // 1. Sync payment status with Stripe if we have a session ID
  if (appointment.stripe_session_id) {
    try {
      // Retrieve session from Stripe
      const session = await stripe.checkout.sessions.retrieve(appointment.stripe_session_id);
      
      // Determine payment status from session
      let paymentStatus = appointment.payment_status;
      if (session.payment_status === 'paid' && appointment.payment_status !== 'paid') {
        paymentStatus = 'paid';
        statusChanged = true;
        stripeStatus = 'paid';
      } else if (session.payment_status === 'unpaid' && appointment.payment_status !== 'pending') {
        paymentStatus = 'pending';
        statusChanged = true;
        stripeStatus = 'unpaid';
      }
      
      // Update payment status in Supabase if changed
      if (statusChanged) {
        await supabaseAdmin
          .from('user_appointments')
          .update({
            payment_status: paymentStatus,
            updated_at: new Date().toISOString()
          })
          .eq('id', appointment.id);
          
        console.log(`✅ Updated payment status for appointment ${appointment.id} to ${paymentStatus}`);
        
        // Update Sanity if we have a Sanity ID
        if (appointment.sanity_id) {
          try {
            await sanityClient
              .patch(appointment.sanity_id)
              .set({
                paymentStatus: paymentStatus
              })
              .commit();
              
            console.log(`✅ Updated Sanity payment status for appointment ${appointment.sanity_id}`);
          } catch (error) {
            console.error(`Error updating Sanity payment status: ${error}`);
          }
        }
      }
    } catch (error) {
      console.error(`Error checking Stripe status for appointment ${appointment.id}:`, error);
      // Continue with other syncs even if this one fails
    }
  }
  
  // 2. Sync Qualiphy status if we have a patient exam ID
  if (appointment.qualiphy_patient_exam_id) {
    try {
      // For now, we'll simulate this as an API call to Qualiphy would be required
      // In a real implementation, you would call the Qualiphy API to check exam status
      console.log(`Would check Qualiphy status for exam ${appointment.qualiphy_patient_exam_id}`);
      
      // The real implementation would update the appointment status based on the Qualiphy response
      // For the demo, we'll check if the status needs updating from 'pending' to a default value
      if (appointment.qualiphy_exam_status === null || appointment.qualiphy_exam_status === undefined) {
        // Update the Qualiphy exam status in Supabase
        await supabaseAdmin
          .from('user_appointments')
          .update({
            qualiphy_exam_status: 'Pending',
            updated_at: new Date().toISOString()
          })
          .eq('id', appointment.id);
          
        qualiphyStatus = 'Pending';
        statusChanged = true;
        
        console.log(`✅ Updated Qualiphy status for appointment ${appointment.id} to Pending`);
        
        // Update Sanity if we have a Sanity ID
        if (appointment.sanity_id) {
          try {
            await sanityClient
              .patch(appointment.sanity_id)
              .set({
                qualiphyExamStatus: 'Pending'
              })
              .commit();
              
            console.log(`✅ Updated Sanity Qualiphy status for appointment ${appointment.sanity_id}`);
          } catch (error) {
            console.error(`Error updating Sanity Qualiphy status: ${error}`);
          }
        }
      }
    } catch (error) {
      console.error(`Error checking Qualiphy status for appointment ${appointment.id}:`, error);
      // Continue with other syncs even if this one fails
    }
  }
  
  // 3. Return the result
  if (statusChanged) {
    return {
      id: appointment.id,
      success: true,
      message: "Appointment status updated successfully",
      stripeStatus,
      qualiphyStatus
    };
  } else {
    return {
      id: appointment.id,
      success: true,
      message: "Appointment status already up-to-date",
      currentStatus: appointment.status,
      currentPaymentStatus: appointment.payment_status,
      currentQualiphyStatus: appointment.qualiphy_exam_status
    };
  }
}