// src/app/api/stripe/appointments/route.ts
import { NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";
import { client as sanityClient } from "@/sanity/lib/client";

// Define types for data structures
interface SanityAppointment {
  _id: string;
  title: string;
  price: number;
  duration: number;
  stripePriceId?: string;
  stripeProductId?: string;
  qualiphyExamId?: number;
}

interface SanityUserSubscription {
  _id: string;
  subscription: {
    _id: string;
    title: string;
    appointmentAccess: boolean;
    appointmentDiscountPercentage: number;
  };
  hasAppointmentAccess: boolean;
  appointmentDiscountPercentage: number;
}

interface SanityUserAppointment {
  _type: string;
  userId: string;
  userEmail: string;
  customerName: string;
  appointmentType: {
    _type: string;
    _ref: string;
  };
  isFromSubscription: boolean;
  status: string;
  createdDate: string;
  notes: string;
  subscriptionId?: {
    _type: string;
    _ref: string;
  };
}

interface StripeCustomer {
  stripe_customer_id: string;
  user_id: string;
  email: string;
}

interface SupabaseUserAppointment {
  user_id: string;
  user_email: string;
  customer_name: string;
  sanity_id: string;
  appointment_type_id: string; // Changed from sanity_appointment_type_id to match DB schema
  treatment_name: string;
  stripe_session_id: string;
  stripe_customer_id: string;
  status: string;
  created_at: string;
  price: number;
  duration: number;
  is_from_subscription: boolean;
  subscription_id: string | null;
  qualiphy_exam_id: number | null;
}

interface AppointmentRequest {
  appointmentId: string;  // Sanity appointment ID
  userId: string;         // Supabase user ID
  userEmail: string;      // User's email
  userName?: string;      // User's name (optional)
  subscriptionId?: string; // Sanity userSubscription ID (if using subscription)
}

interface QualiphyPatientExam {
  id: number;
  exam_id: number;
  status: string;
  patient_id: number;
  created_at: string;
  updated_at: string;
  results?: string;
}

interface QualiphyResponse {
  http_code: number;
  meeting_url?: string;
  meeting_uuid?: string;
  patient_exams?: QualiphyPatientExam[];
  error_message?: string;
}

interface QualiphyAppointmentResult {
  meetingUrl: string;
  meetingUuid: string;
  patientExams: QualiphyPatientExam[];
}

// Initialize Stripe with latest API version
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: undefined, // Use latest API version
});

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error("Missing required Supabase environment variables");
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Helper function to make Qualiphy API calls
async function createQualiphyAppointment(
  customerName: string, 
  email: string, 
  examId: number
): Promise<QualiphyAppointmentResult> {
  try {
    const apiKey = process.env.QUALIPHY_API_KEY;
    if (!apiKey) {
      throw new Error("Qualiphy API key is not configured");
    }

    // Format date of birth, default to adult age if not available
    const dob = "1990-01-01"; // Default DOB

    // Format phone number
    const phoneNumber = "1234567890"; // Default phone number

    // Create the payload
    const payload = {
      api_key: apiKey,
      exams: [examId],
      first_name: customerName.split(' ')[0] || "Customer",
      last_name: customerName.split(' ').slice(1).join(' ') || "User",
      email: email,
      dob: dob,
      phone_number: phoneNumber,
      // Optional webhook for receiving results
      webhook_url: `${process.env.NEXT_PUBLIC_APP_URL}/api/qualiphy/webhook`
    };

    // Make the API call to Qualiphy
    const response = await fetch("https://api.qualiphy.me/api/exam_invite/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });

    const result = await response.json() as QualiphyResponse;
    
    if (!response.ok || result.http_code !== 200) {
      throw new Error(result.error_message || "Failed to create Qualiphy appointment");
    }
    
    if (!result.meeting_url || !result.meeting_uuid || !result.patient_exams) {
      throw new Error("Invalid response from Qualiphy API");
    }
    
    return {
      meetingUrl: result.meeting_url,
      meetingUuid: result.meeting_uuid,
      patientExams: result.patient_exams
    };
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error creating Qualiphy appointment";
    console.error("Error creating Qualiphy appointment:", error);
    throw new Error(errorMessage);
  }
}

export async function POST(req: Request): Promise<NextResponse> {
  try {
    const data: AppointmentRequest = await req.json();
    
    // Validate required fields
    if (!data.appointmentId || !data.userId || !data.userEmail) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      );
    }
    
    console.log(`Creating appointment for user ${data.userId} with appointment type ${data.appointmentId}`);
    
    // 1. Fetch appointment details from Sanity
    const appointment = await sanityClient.fetch<SanityAppointment>(
      `*[_type == "appointment" && _id == $id][0]{
        _id,
        title,
        price,
        duration,
        stripePriceId,
        stripeProductId,
        qualiphyExamId
      }`,
      { id: data.appointmentId }
    );
    
    if (!appointment) {
      return NextResponse.json(
        { success: false, error: "Appointment type not found" },
        { status: 404 }
      );
    }
    
    console.log(`Fetched appointment: ${appointment.title}`);
    
    // 2. Check if user has an active subscription with appointment access
    let userSubscription: SanityUserSubscription | null = null;
    let appointmentPrice = appointment.price;
    let appointmentDiscount = 0;
    let fromSubscription = false;
    
    // If subscription ID is provided, check if it's valid and active
    if (data.subscriptionId) {
      userSubscription = await sanityClient.fetch<SanityUserSubscription>(
        `*[_type == "userSubscription" && _id == $id && userId == $userId && isActive == true][0]{
          _id,
          subscription->{
            _id,
            title,
            appointmentAccess,
            appointmentDiscountPercentage
          },
          hasAppointmentAccess,
          appointmentDiscountPercentage
        }`,
        { id: data.subscriptionId, userId: data.userId }
      );
      
      if (userSubscription && userSubscription.hasAppointmentAccess) {
        console.log(`User has active subscription with appointment access`);
        fromSubscription = true;
        
        // Apply discount if available
        if (userSubscription.appointmentDiscountPercentage > 0) {
          appointmentDiscount = userSubscription.appointmentDiscountPercentage;
          appointmentPrice = appointment.price * (1 - (appointmentDiscount / 100));
          console.log(`Applied ${appointmentDiscount}% discount to appointment price: $${appointmentPrice}`);
        }
      }
    }
    
    // 3. Create or get Stripe product and price IDs
    let stripeProductId = appointment.stripeProductId;
    let stripePriceId = appointment.stripePriceId;
    
    // If no Stripe product ID exists, create one
    if (!stripeProductId) {
      console.log("Creating new Stripe product");
      const product = await stripe.products.create({
        name: appointment.title,
        description: `${appointment.title} - ${appointment.duration} minute appointment`,
        metadata: {
          sanityId: appointment._id
        }
      });
      
      stripeProductId = product.id;
      
      // Update Sanity with the Stripe product ID
      await sanityClient
        .patch(appointment._id)
        .set({ stripeProductId: product.id })
        .commit();
        
      console.log(`Created Stripe product: ${product.id}`);
    }
    
    // If no Stripe price ID exists or we have a discounted price, create one
    const priceAmount = Math.round(appointmentPrice * 100); // Convert to cents
    if (!stripePriceId || appointmentDiscount > 0) {
      console.log(`Creating new Stripe price for amount: $${appointmentPrice}`);
      
      const price = await stripe.prices.create({
        product: stripeProductId,
        unit_amount: priceAmount,
        currency: 'usd',
        metadata: {
          sanityId: appointment._id,
          discounted: appointmentDiscount > 0 ? 'true' : 'false',
          discountPercentage: appointmentDiscount.toString()
        }
      });
      
      stripePriceId = price.id;
      
      // Only update the default price ID if this isn't a one-off discounted price
      if (appointmentDiscount === 0) {
        // Update Sanity with the Stripe price ID
        await sanityClient
          .patch(appointment._id)
          .set({ stripePriceId: price.id })
          .commit();
          
        console.log(`Updated default Stripe price ID: ${price.id}`);
      }
    }
    
    // 4. Check if customer exists, if not create one
    const { data: customerData, error: customerError } = await supabase
      .from('stripe_customers')
      .select('stripe_customer_id, user_id, email')
      .eq('user_id', data.userId)
      .single<StripeCustomer>();
      
    let stripeCustomerId: string;
    
    if (customerError || !customerData) {
      console.log(`Creating new customer for user ${data.userId}`);
      
      // Create customer params with proper typing
      const customerParams: Stripe.CustomerCreateParams = {
        email: data.userEmail,
        metadata: {
          userId: data.userId
        }
      };
      
      // Add name if provided
      if (data.userName) {
        customerParams.name = data.userName;
      }
      
      // Create a Stripe customer
      const customer = await stripe.customers.create(customerParams);
      
      stripeCustomerId = customer.id;
      
      // Save customer ID to Supabase
      const { error: insertError } = await supabase
        .from('stripe_customers')
        .insert({
          user_id: data.userId,
          stripe_customer_id: customer.id,
          email: data.userEmail
        });
        
      if (insertError) {
        console.error("Error inserting customer into Supabase:", insertError);
        throw new Error(`Failed to create customer record: ${insertError.message}`);
      }
        
      console.log(`Created Stripe customer: ${customer.id}`);
    } else {
      stripeCustomerId = customerData.stripe_customer_id;
      console.log(`Using existing Stripe customer: ${stripeCustomerId}`);
    }
    
    // 5. Create a checkout session
    const sessionParams: Stripe.Checkout.SessionCreateParams = {
      payment_method_types: ['card'],
      line_items: [
        {
          price: stripePriceId,
          quantity: 1,
        },
      ],
      mode: 'payment',  // One-time payment for appointments
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/account/appointments?success=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/appointments?canceled=true`,
      customer: stripeCustomerId,
      metadata: {
        userId: data.userId,
        userEmail: data.userEmail,
        appointmentId: appointment._id,
        appointmentType: "oneTime",
        fromSubscription: fromSubscription.toString(),
        userSubscriptionId: data.subscriptionId || "",
        qualiphyExamId: appointment.qualiphyExamId?.toString() || ""
      },
      client_reference_id: data.userId,
    };
    
    const session = await stripe.checkout.sessions.create(sessionParams);
    
    console.log(`Created checkout session: ${session.id}`);
    
    // 6. Create a pending appointment in Sanity
    const createdDate = new Date().toISOString();
    const userAppointment: SanityUserAppointment = {
      _type: 'userAppointment',
      userId: data.userId,
      userEmail: data.userEmail,
      customerName: data.userName || data.userEmail.split('@')[0],
      appointmentType: {
        _type: 'reference',
        _ref: appointment._id
      },
      isFromSubscription: fromSubscription,
      status: 'pending',
      createdDate: createdDate,
      notes: `Booking created on ${new Date().toLocaleDateString()}. Payment pending.`
    };
    
    // Add subscription reference if applicable
    if (fromSubscription && data.subscriptionId) {
      userAppointment.subscriptionId = {
        _type: 'reference',
        _ref: data.subscriptionId
      };
    }
    
    const sanityResponse = await sanityClient.create(userAppointment);
    console.log(`Created pending Sanity user appointment: ${sanityResponse._id}`);
    
    // 7. Create pending appointment in Supabase
    const supabaseAppointment: SupabaseUserAppointment = {
      user_id: data.userId,
      user_email: data.userEmail,
      customer_name: data.userName || data.userEmail.split('@')[0],
      sanity_id: sanityResponse._id,
      appointment_type_id: appointment._id, // Changed to match DB schema
      treatment_name: appointment.title,
      stripe_session_id: session.id,
      stripe_customer_id: stripeCustomerId,
      status: 'pending',
      created_at: createdDate,
      price: appointmentPrice,
      duration: appointment.duration,
      is_from_subscription: fromSubscription,
      subscription_id: fromSubscription && data.subscriptionId ? data.subscriptionId : null,
      qualiphy_exam_id: appointment.qualiphyExamId || null
    };
    
    const { error: appointmentError } = await supabase
      .from('user_appointments')
      .insert(supabaseAppointment);
      
    if (appointmentError) {
      console.error("Error inserting appointment into Supabase:", appointmentError);
      throw new Error(`Failed to create appointment record: ${appointmentError.message}`);
    }
    
    return NextResponse.json({
      success: true,
      appointmentId: sanityResponse._id,
      sessionId: session.id,
      url: session.url
    });
    
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("Error creating appointment:", error);
    return NextResponse.json(
      { 
        success: false, 
        error: errorMessage || "Failed to create appointment"
      }, 
      { status: 500 }
    );
  }}