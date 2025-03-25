// src/app/api/qualiphy/webhook/route.ts
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { client as sanityClient } from "@/sanity/lib/client";

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Define interfaces for Qualiphy webhook payload
interface QuestionAnswer {
  no: number;
  question: string;
  answer: string;
}

interface QualiphyConsultationWebhook {
  event: 1; // Event type 1: Consultation Complete
  reason: string;
  exam_id: string;
  exam_url: string;
  exam_name: string;
  rx_status: string;
  clinic_name: string;
  exam_status: string; // "Approved", "Deferred", "N/A"
  patient_email: string;
  provider_name: string;
  additional_data?: string;
  patient_exam_id: string;
  questions_answers: QuestionAnswer[];
  patient_phone_number: string;
}

interface QualiphyPrescriptionWebhook {
  event: 2; // Event type 2: Prescription Confirmed
  reason: string;
  exam_id: string;
  exam_url: string;
  quantity: number;
  exam_name: string;
  rx_status: string;
  directions: string;
  clinic_name: string;
  exam_status: string;
  drug_details: {
    size: string;
    strength: string;
    drug_name: string;
    gpi_number: string;
    ndc_number: string;
    dosage_form_type: string;
    active_ingredient: string;
    inactive_ingredient: string[];
  };
  duration_days: number;
  patient_email: string;
  provider_name: string;
  refill_amount: number;
  schedule_code: string;
  quantity_units: string;
  additional_data?: string;
  dispense_number: number;
  patient_exam_id: string;
  prescription_id: number;
  questions_answers: QuestionAnswer[];
  patient_phone_number: string;
}

interface QualiphyTrackingWebhook {
  event: 3; // Event type 3: Prescription Tracking Information
  prescription_tracking: {
    pharmacy_location: string;
    rx_number: string;
    tracking_number: string;
    delivery_service: string;
    ship_carrier: string;
  }[];
  created_at: string;
}

type QualiphyWebhook = QualiphyConsultationWebhook | QualiphyPrescriptionWebhook | QualiphyTrackingWebhook;

export async function POST(req: Request) {
  try {
    const webhookData: QualiphyWebhook = await req.json();
    console.log(`Received Qualiphy webhook event type: ${webhookData.event}`);
    
    // Handle different event types
    switch (webhookData.event) {
      case 1: {
        // Event 1: Consultation Complete
        const consultationData = webhookData as QualiphyConsultationWebhook;
        
        console.log(`Processing completed consultation for patient exam: ${consultationData.patient_exam_id}`);
        console.log(`Exam status: ${consultationData.exam_status}`);
        
        // Look up the appointment in Supabase by patient_exam_id
        const { data: appointmentData, error: appointmentError } = await supabase
          .from('user_appointments')
          .select('id, sanity_id, user_id, user_email')
          .eq('qualiphy_patient_exam_id', parseInt(consultationData.patient_exam_id))
          .single();
        
        if (appointmentError) {
          console.log("No appointment found by patient_exam_id, trying email...");
          
          // Try to find appointment by user email
          const { data: emailAppointmentData, error: emailError } = await supabase
            .from('user_appointments')
            .select('id, sanity_id, user_id')
            .eq('user_email', consultationData.patient_email)
            .eq('status', 'scheduled')
            .order('created_at', { ascending: false })
            .limit(1)
            .single();
          
          if (emailError) {
            console.error(`No appointment found for patient exam ID ${consultationData.patient_exam_id} or email ${consultationData.patient_email}`);
            return NextResponse.json({ success: false, error: "Appointment not found" }, { status: 404 });
          }
          
          // We found an appointment by email
          await processCompletedConsultation(
            emailAppointmentData.id,
            emailAppointmentData.sanity_id,
            consultationData
          );
        } else {
          // We found an appointment by patient_exam_id
          await processCompletedConsultation(
            appointmentData.id,
            appointmentData.sanity_id,
            consultationData
          );
        }
        
        break;
      }
      
      case 2: {
        // Event 2: Prescription Confirmed
        const prescriptionData = webhookData as QualiphyPrescriptionWebhook;
        
        console.log(`Processing prescription for patient exam: ${prescriptionData.patient_exam_id}`);
        
        // Look up the appointment in Supabase by patient_exam_id
        const { data: appointmentData, error: appointmentError } = await supabase
          .from('user_appointments')
          .select('id, sanity_id')
          .eq('qualiphy_patient_exam_id', parseInt(prescriptionData.patient_exam_id))
          .single();
        
        if (appointmentError) {
          console.log("No appointment found by patient_exam_id, trying email...");
          
          // Try to find appointment by user email
          const { data: emailAppointmentData, error: emailError } = await supabase
            .from('user_appointments')
            .select('id, sanity_id')
            .eq('user_email', prescriptionData.patient_email)
            .eq('status', 'completed')
            .order('completed_at', { ascending: false })
            .limit(1)
            .single();
          
          if (emailError) {
            console.error(`No appointment found for patient exam ID ${prescriptionData.patient_exam_id} or email ${prescriptionData.patient_email}`);
            return NextResponse.json({ success: false, error: "Appointment not found" }, { status: 404 });
          }
          
          // We found an appointment by email
          await processPrescription(
            emailAppointmentData.id,
            emailAppointmentData.sanity_id,
            prescriptionData
          );
        } else {
          // We found an appointment by patient_exam_id
          await processPrescription(
            appointmentData.id,
            appointmentData.sanity_id,
            prescriptionData
          );
        }
        
        break;
      }
      
      case 3: {
        // Event 3: Prescription Tracking Information
        const trackingData = webhookData as QualiphyTrackingWebhook;
        
        console.log(`Processing tracking information: ${JSON.stringify(trackingData.prescription_tracking)}`);
        
        // Handle tracking information - this usually needs to be linked through a prescription ID
        // We would need to find appointments with prescriptions that match the tracking info
        // Since our current data model doesn't have a direct way to link tracking to prescriptions,
        // we'll just log this information for now
        
        console.log(`Received tracking information for prescriptions`);
        
        break;
      }
      
      default:
        console.warn(`Unknown Qualiphy event type: ${(webhookData as any).event}`);
    }
    
    return NextResponse.json({ success: true });
    
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Webhook handler failed";
    console.error(`Qualiphy Webhook Error: ${errorMessage}`);
    return NextResponse.json(
      { 
        success: false, 
        error: errorMessage
      }, 
      { status: 400 }
    );
  }
}

// Helper function to process completed consultations
async function processCompletedConsultation(
  appointmentId: string,
  sanityId: string | null,
  consultationData: QualiphyConsultationWebhook
) {
  console.log(`Processing consultation for appointment: ${appointmentId}`);
  
  // Map status from Qualiphy to our status
  const appointmentStatus = 
    consultationData.exam_status === "Approved" ? "completed" :
    consultationData.exam_status === "Deferred" ? "deferred" : "completed";
  
  // Format the consultation note with questions and answers
  const qaText = consultationData.questions_answers
    .map(qa => `Q: ${qa.question}\nA: ${qa.answer}`)
    .join('\n\n');
  
  const notes = `
Consultation completed with ${consultationData.provider_name}.
Status: ${consultationData.exam_status}
Exam ID: ${consultationData.exam_id}
Patient Exam ID: ${consultationData.patient_exam_id}

Questions and Answers:
${qaText}
  `.trim();
  
  // Update Supabase with consultation results
  try {
    await supabase
      .from('user_appointments')
      .update({
        status: appointmentStatus,
        completed_at: new Date().toISOString(),
        notes: notes,
        qualiphy_exam_status: consultationData.exam_status,
        qualiphy_provider_name: consultationData.provider_name,
        updated_at: new Date().toISOString()
      })
      .eq('id', appointmentId);
      
    console.log(`✅ Updated Supabase appointment: ${appointmentId}`);
  } catch (error) {
    console.error(`Error updating Supabase appointment: ${error}`);
  }
  
  // Update Sanity with consultation results
  if (sanityId) {
    try {
      await sanityClient
        .patch(sanityId)
        .set({
          status: appointmentStatus,
          completedDate: new Date().toISOString(),
          notes: notes,
          qualiphyExamStatus: consultationData.exam_status,
          qualiphyProviderName: consultationData.provider_name
        })
        .commit();
        
      console.log(`✅ Updated Sanity appointment: ${sanityId}`);
    } catch (error) {
      console.error(`Error updating Sanity appointment: ${error}`);
    }
  }
}

// Helper function to process prescriptions
async function processPrescription(
  appointmentId: string,
  sanityId: string | null,
  prescriptionData: QualiphyPrescriptionWebhook
) {
  console.log(`Processing prescription for appointment: ${appointmentId}`);
  
  // Format prescription information
  const prescriptionDetails = {
    drug_name: prescriptionData.drug_details.drug_name,
    strength: prescriptionData.drug_details.strength,
    quantity: prescriptionData.quantity,
    quantity_units: prescriptionData.quantity_units,
    directions: prescriptionData.directions,
    duration_days: prescriptionData.duration_days,
    refills: prescriptionData.refill_amount,
    prescription_id: prescriptionData.prescription_id,
    schedule_code: prescriptionData.schedule_code
  };
  
  // Create prescription note
  const prescriptionNote = `
Prescription details:
- Drug: ${prescriptionData.drug_details.drug_name} ${prescriptionData.drug_details.strength}
- Quantity: ${prescriptionData.quantity} ${prescriptionData.quantity_units}
- Directions: ${prescriptionData.directions}
- Duration: ${prescriptionData.duration_days} days
- Refills: ${prescriptionData.refill_amount}
- Prescription ID: ${prescriptionData.prescription_id}
- Schedule: ${prescriptionData.schedule_code}
  `.trim();
  
  // Update Supabase with prescription details
  try {
    await supabase
      .from('user_appointments')
      .update({
        notes: prescriptionNote,
        prescription_id: prescriptionData.prescription_id.toString(),
        prescription_details: prescriptionDetails,
        updated_at: new Date().toISOString()
      })
      .eq('id', appointmentId);
      
    console.log(`✅ Updated Supabase appointment with prescription: ${appointmentId}`);
  } catch (error) {
    console.error(`Error updating Supabase appointment with prescription: ${error}`);
  }
  
  // Update Sanity with prescription details
  if (sanityId) {
    try {
      await sanityClient
        .patch(sanityId)
        .set({
          notes: prescriptionNote,
          // Note: Sanity doesn't have a dedicated prescription_details field,
          // so we're just adding it to the notes
        })
        .commit();
        
      console.log(`✅ Updated Sanity appointment with prescription: ${sanityId}`);
    } catch (error) {
      console.error(`Error updating Sanity appointment with prescription: ${error}`);
    }
  }
}