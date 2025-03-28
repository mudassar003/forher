// src/app/api/appointments/sync-status/route.ts
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { client as sanityClient } from "@/sanity/lib/client";
import Stripe from "stripe";

// Initialize Stripe client
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: undefined, // Use latest API version
});

// Initialize Supabase admin client for server operations
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

interface SyncRequest {
  userId?: string;
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
  stripe_payment_intent_id?: string | null;
}

export async function POST(req: Request) {
  try {
    // Parse request body
    const data: SyncRequest = await req.json();
    
    // Validate that we have either userId or appointmentId
    if (!data.userId && !data.appointmentId) {
      return NextResponse.json(
        { success: false, error: "Either userId or appointmentId is required" },
        { status: 400 }
      );
    }
    
    console.log(`Processing appointment sync for ${data.userId ? `user ${data.userId}` : `appointment ${data.appointmentId}`}`);
    
    // Fetch the appointments based on provided parameters
    let query = supabaseAdmin
      .from('user_appointments')
      .select('id, sanity_id, stripe_session_id, status, payment_status, qualiphy_exam_status, qualiphy_patient_exam_id, qualiphy_exam_id, stripe_payment_intent_id');
    
    // Filter by specific parameters if provided
    if (data.appointmentId) {
      query = query.eq('id', data.appointmentId);
    } else if (data.userId) {
      query = query.eq('user_id', data.userId);
    }
    
    // Only sync recent appointments that are not completed or cancelled
    if (!data.appointmentId) {
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
        
        // IMPORTANT: When payment is confirmed as paid, ALWAYS set Qualiphy status to N/A
        // This ensures users can access telehealth after payment
        const qualiphy_exam_status = 'N/A';
        
        // Update both payment status and Qualiphy status together
        await supabaseAdmin
          .from('user_appointments')
          .update({
            payment_status: paymentStatus,
            qualiphy_exam_status: qualiphy_exam_status,
            updated_at: new Date().toISOString()
          })
          .eq('id', appointment.id);
          
        console.log(`✅ Updated payment status for appointment ${appointment.id} to ${paymentStatus} and set qualiphy_exam_status to ${qualiphy_exam_status}`);
        
        // Update Sanity if we have a Sanity ID
        if (appointment.sanity_id) {
          try {
            await sanityClient
              .patch(appointment.sanity_id)
              .set({
                paymentStatus: paymentStatus,
                qualiphyExamStatus: qualiphy_exam_status
              })
              .commit();
              
            console.log(`✅ Updated Sanity payment status for appointment ${appointment.sanity_id}`);
          } catch (error) {
            console.error(`Error updating Sanity payment status: ${error}`);
          }
        }
        
        // Add verification step
        const { data: verifyData, error: verifyError } = await supabaseAdmin
          .from('user_appointments')
          .select('payment_status, qualiphy_exam_status')
          .eq('id', appointment.id)
          .single();
          
        if (!verifyError && verifyData) {
          console.log(`Verification after update: payment_status=${verifyData.payment_status}, qualiphy_exam_status=${verifyData.qualiphy_exam_status}`);
        }
      } else if (session.payment_status === 'unpaid' && appointment.payment_status !== 'pending') {
        paymentStatus = 'pending';
        statusChanged = true;
        stripeStatus = 'unpaid';
        
        // Update payment status in Supabase
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
  
  // Try with payment intent if session check failed
  if (!statusChanged && appointment.stripe_payment_intent_id) {
    try {
      const paymentIntent = await stripe.paymentIntents.retrieve(appointment.stripe_payment_intent_id);
      
      let paymentStatus = appointment.payment_status;
      if (paymentIntent.status === 'succeeded' && appointment.payment_status !== 'paid') {
        paymentStatus = 'paid';
        statusChanged = true;
        stripeStatus = 'succeeded';
        
        // IMPORTANT: When payment is confirmed as paid, ALWAYS set Qualiphy status to N/A
        // This ensures users can access telehealth after payment
        const qualiphy_exam_status = 'N/A';
        
        // Update both payment status and Qualiphy status together
        await supabaseAdmin
          .from('user_appointments')
          .update({
            payment_status: paymentStatus,
            qualiphy_exam_status: qualiphy_exam_status,
            updated_at: new Date().toISOString()
          })
          .eq('id', appointment.id);
          
        console.log(`✅ Updated payment status for appointment ${appointment.id} to ${paymentStatus} and set qualiphy_exam_status to ${qualiphy_exam_status} via payment intent`);
        
        // Update Sanity if we have a Sanity ID
        if (appointment.sanity_id) {
          try {
            await sanityClient
              .patch(appointment.sanity_id)
              .set({
                paymentStatus: paymentStatus,
                qualiphyExamStatus: qualiphy_exam_status
              })
              .commit();
              
            console.log(`✅ Updated Sanity payment status for appointment ${appointment.sanity_id}`);
          } catch (error) {
            console.error(`Error updating Sanity payment status: ${error}`);
          }
        }
        
        // Add verification step
        const { data: verifyData, error: verifyError } = await supabaseAdmin
          .from('user_appointments')
          .select('payment_status, qualiphy_exam_status')
          .eq('id', appointment.id)
          .single();
          
        if (!verifyError && verifyData) {
          console.log(`Verification after update: payment_status=${verifyData.payment_status}, qualiphy_exam_status=${verifyData.qualiphy_exam_status}`);
        }
        
      } else if (paymentIntent.status === 'requires_payment_method' && appointment.payment_status !== 'pending') {
        paymentStatus = 'pending';
        statusChanged = true;
        stripeStatus = 'requires_payment_method';
        
        // Update payment status in Supabase
        await supabaseAdmin
          .from('user_appointments')
          .update({
            payment_status: paymentStatus,
            updated_at: new Date().toISOString()
          })
          .eq('id', appointment.id);
          
        console.log(`✅ Updated payment status for appointment ${appointment.id} to ${paymentStatus} via payment intent`);
        
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
      console.error(`Error checking payment intent for appointment ${appointment.id}:`, error);
      // Continue with other syncs even if this one fails
    }
  }
  
  // Special case: If payment is paid but qualiphy_exam_status is not N/A, fix it
  if (appointment.payment_status === 'paid' && 
      (!appointment.qualiphy_exam_status || appointment.qualiphy_exam_status !== 'N/A')) {
    
    console.log(`⚠️ Found paid appointment ${appointment.id} without N/A status. Current status: ${appointment.qualiphy_exam_status}`);
    
    try {
      // Update the Qualiphy exam status in Supabase
      await supabaseAdmin
        .from('user_appointments')
        .update({
          qualiphy_exam_status: 'N/A',
          updated_at: new Date().toISOString()
        })
        .eq('id', appointment.id);
        
      qualiphyStatus = 'N/A';
      statusChanged = true;
      
      console.log(`🔧 Fixed Qualiphy status for appointment ${appointment.id} to N/A`);
      
      // Update Sanity if we have a Sanity ID
      if (appointment.sanity_id) {
        try {
          await sanityClient
            .patch(appointment.sanity_id)
            .set({
              qualiphyExamStatus: 'N/A'
            })
            .commit();
            
          console.log(`✅ Fixed Sanity Qualiphy status for appointment ${appointment.sanity_id}`);
        } catch (error) {
          console.error(`Error updating Sanity Qualiphy status: ${error}`);
        }
      }
      
      // Verify the update
      const { data: verifyData, error: verifyError } = await supabaseAdmin
        .from('user_appointments')
        .select('qualiphy_exam_status')
        .eq('id', appointment.id)
        .single();
        
      if (!verifyError && verifyData) {
        console.log(`Verification after fixing Qualiphy status: qualiphy_exam_status=${verifyData.qualiphy_exam_status}`);
      }
    } catch (error) {
      console.error(`Error fixing Qualiphy status for appointment ${appointment.id}:`, error);
    }
  }
  
  // 2. Sync Qualiphy status if we have a patient exam ID (but NOT if we already fixed it above)
  let qualiphyStatusChanged = false;
  if (appointment.qualiphy_patient_exam_id && !statusChanged) {
    try {
      // In a real implementation, you would call the Qualiphy API to check exam status
      // For demo purposes, we'll check if the status needs updating from null to a default value
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
        qualiphyStatusChanged = true;
        
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
  if (statusChanged || qualiphyStatusChanged) {
    return {
      id: appointment.id,
      success: true,
      message: "Appointment status updated successfully",
      changes: {
        stripe: statusChanged ? stripeStatus : null,
        qualiphy: qualiphyStatusChanged ? qualiphyStatus : (statusChanged ? 'N/A' : null)
      }
    };
  } else {
    return {
      id: appointment.id,
      success: true,
      message: "Appointment status already up-to-date",
      currentStatus: {
        appointment: appointment.status,
        payment: appointment.payment_status,
        qualiphy: appointment.qualiphy_exam_status
      }
    };
  }
}