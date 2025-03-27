// src/app/api/stripe/appointments/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { validate as validateUUID } from 'uuid';
import { createCheckoutSession } from '@/lib/stripe';
import { client as sanityClient } from '@/sanity/lib/client';

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function POST(request: NextRequest) {
  try {
    // Parse the request body
    const { appointmentId, userId, userEmail, userName, subscriptionId } = await request.json();

    // Validate required fields
    if (!appointmentId || !userId || !userEmail) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate UUID format if a subscription ID is provided
    if (subscriptionId && !validateUUID(subscriptionId)) {
      return NextResponse.json(
        { 
          success: false, 
          error: `Invalid subscription ID format: ${subscriptionId} is not a valid UUID` 
        },
        { status: 400 }
      );
    }

    // Fetch the appointment details from Sanity
    const appointmentQuery = `*[_type == "appointment" && _id == $appointmentId][0] {
      _id,
      title,
      price,
      description,
      duration,
      stripePriceId,
      qualiphyExamId,
      requiresSubscription
    }`;

    const appointment = await sanityClient.fetch(appointmentQuery, { appointmentId });

    if (!appointment) {
      return NextResponse.json(
        { success: false, error: 'Appointment type not found' },
        { status: 404 }
      );
    }

    // Check if this appointment requires a subscription
    if (appointment.requiresSubscription) {
      // If it requires a subscription but none was provided
      if (!subscriptionId) {
        return NextResponse.json(
          { success: false, error: 'This appointment requires an active subscription' },
          { status: 400 }
        );
      }

      // Verify that the subscription exists and is active
      const { data: subscriptionData, error: subError } = await supabase
        .from('user_subscriptions')
        .select('*')
        .eq('id', subscriptionId)
        .eq('user_id', userId)
        .eq('is_active', true)
        .in('status', ['active', 'trialing', 'cancelling'])
        .single();

      if (subError || !subscriptionData) {
        console.error('Subscription validation error:', subError);
        return NextResponse.json(
          { success: false, error: 'Valid active subscription not found' },
          { status: 400 }
        );
      }
    }

    // Create a new appointment record in the database
    const { data: appointmentData, error: appointmentError } = await supabase
      .from('user_appointments')
      .insert([
        {
          user_id: userId,
          user_email: userEmail,
          customer_name: userName || userEmail.split('@')[0],
          treatment_name: appointment.title,
          appointment_type_id: appointment._id,
          sanity_appointment_id: appointment._id,
          status: 'pending',
          subscription_id: subscriptionId || null,
          is_from_subscription: !!subscriptionId,
          qualiphy_exam_id: appointment.qualiphyExamId,
          price: appointment.price,
          duration: appointment.duration,
          payment_status: 'pending',
          requires_subscription: appointment.requiresSubscription || false
        }
      ])
      .select()
      .single();

    if (appointmentError) {
      console.error('Error creating appointment record:', appointmentError);
      return NextResponse.json(
        { success: false, error: `Failed to create appointment record: ${appointmentError.message}` },
        { status: 500 }
      );
    }

    // Always create a Stripe checkout session for payment, regardless of subscription status
    const lineItems = [
      {
        price_data: {
          currency: 'usd',
          product_data: {
            name: appointment.title,
            description: appointment.description || 'Telehealth Consultation',
          },
          unit_amount: Math.round(appointment.price * 100), // Convert to cents
        },
        quantity: 1,
      },
    ];

    const baseUrl = request.headers.get('origin') || 'http://localhost:3000';
    const session = await createCheckoutSession({
      lineItems,
      successUrl: `${baseUrl}/account/appointments?success=true&appointment_id=${appointmentData.id}`,
      cancelUrl: `${baseUrl}/appointments?cancelled=true`,
      metadata: {
        appointmentId: appointmentData.id,
        userId,
        userEmail,
        appointmentType: appointment._id,
        subscriptionId: subscriptionId || null,
      },
      customerEmail: userEmail,
    });

    // Update the appointment with the Stripe session ID
    await supabase
      .from('user_appointments')
      .update({
        stripe_session_id: session.id,
      })
      .eq('id', appointmentData.id);

    return NextResponse.json({
      success: true,
      appointmentId: appointmentData.id,
      sessionId: session.id,
      url: session.url,
    });
    
  } catch (error: any) {
    console.error('Appointment creation error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}