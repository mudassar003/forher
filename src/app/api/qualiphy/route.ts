// src/app/api/qualiphy/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase Admin client
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Akina Pharmacy supported states
const AKINA_PHARMACY_STATES = [
  'AZ', 'CO', 'CT', 'DC', 'DE', 'GA', 'ID', 'IL', 'IN', 'KY', 
  'MA', 'MD', 'NJ', 'NV', 'NY', 'MO', 'MT', 'ND', 'OH', 'OK', 
  'OR', 'PA', 'SD', 'TN', 'UT', 'VA', 'WA', 'WI', 'WV'
];

// State name to abbreviation mapping
const STATE_TO_ABBREVIATION: Record<string, string> = {
  'Alabama': 'AL', 'Alaska': 'AK', 'Arizona': 'AZ', 'Arkansas': 'AR', 'California': 'CA',
  'Colorado': 'CO', 'Connecticut': 'CT', 'Delaware': 'DE', 'Florida': 'FL', 'Georgia': 'GA',
  'Hawaii': 'HI', 'Idaho': 'ID', 'Illinois': 'IL', 'Indiana': 'IN', 'Iowa': 'IA',
  'Kansas': 'KS', 'Kentucky': 'KY', 'Louisiana': 'LA', 'Maine': 'ME', 'Maryland': 'MD',
  'Massachusetts': 'MA', 'Michigan': 'MI', 'Minnesota': 'MN', 'Mississippi': 'MS', 'Missouri': 'MO',
  'Montana': 'MT', 'Nebraska': 'NE', 'Nevada': 'NV', 'New Hampshire': 'NH', 'New Jersey': 'NJ',
  'New Mexico': 'NM', 'New York': 'NY', 'North Carolina': 'NC', 'North Dakota': 'ND', 'Ohio': 'OH',
  'Oklahoma': 'OK', 'Oregon': 'OR', 'Pennsylvania': 'PA', 'Rhode Island': 'RI', 'South Carolina': 'SC',
  'South Dakota': 'SD', 'Tennessee': 'TN', 'Texas': 'TX', 'Utah': 'UT', 'Vermont': 'VT',
  'Virginia': 'VA', 'Washington': 'WA', 'West Virginia': 'WV', 'Wisconsin': 'WI', 'Wyoming': 'WY',
  'District of Columbia': 'DC'
};

// Updated interfaces for Qualiphy API
interface QualiphyApiResponse {
  http_code: number;
  meeting_url?: string;
  meeting_uuid?: string;
  patient_exams?: Array<{
    patient_exam_id: number;
    exam_title: string;
    exam_id: number;
  }>;
  error_message?: string;
}

interface UserData {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  phone: string;
  state: string;
  dob: string;
  submission_count: number;
  created_at: string;
  updated_at: string;
}

interface UserDataApiResponse {
  success: boolean;
  data?: UserData;
  error?: string;
}

// Pharmacy configuration for Akina Pharmacy
const getPharmacyConfig = (stateAbbr: string) => {
  if (!AKINA_PHARMACY_STATES.includes(stateAbbr)) {
    return null; // Pharmacy not available in this state
  }

  return {
    pharmacy_id: "12",
    ncpdpid: "4844824",
    pharmacy_name: "Akina Pharmacy",
    pharmacy_address_line_1: "23475 Rock Haven Way",
    pharmacy_address_line_2: "",
    pharmacy_zip_code: "20166", // Sterling, VA zip code
    pharmacy_city: "Sterling",
    pharmacy_state: "VA",
    pharmacy_phone: "(703) 555-0199", // Placeholder phone number
    pharmacy_type: "MailOrder",
    provider_pos_selection: 2,
    custom_pharmacy_patient_billing: 1,
    custom_pharmacy_delivery_method: 2,
    custom_pharmacy: 1,
    custom_pharmacy_patient_choice: 1,
    custom_pharmacy_clinic_billing: "Lilys Womens"
  };
};

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json();
    const { firstName, lastName, email, phoneNumber, dob, state, examId } = body;

    // Validate required fields
    if (!firstName || !lastName || !email || !phoneNumber || !dob || !state || !examId) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Convert state to abbreviation
    const stateAbbreviation = STATE_TO_ABBREVIATION[state];
    if (!stateAbbreviation) {
      return NextResponse.json(
        { success: false, error: 'Invalid state provided' },
        { status: 400 }
      );
    }

    // Check if pharmacy is available in this state
    const pharmacyConfig = getPharmacyConfig(stateAbbreviation);
    if (!pharmacyConfig) {
      return NextResponse.json(
        { 
          success: false, 
          error: `Sorry, our pharmacy services are not yet available in ${state}. We currently serve: AZ, CO, CT, DC, DE, GA, ID, IL, IN, KY, MA, MD, NJ, NV, NY, MO, MT, ND, OH, OK, OR, PA, SD, TN, UT, VA, WA, WI, WV.` 
        },
        { status: 400 }
      );
    }

    // Check if user already exists and has submitted
    const { data: existingUserData, error: fetchError } = await supabaseAdmin
      .from('user_data')
      .select('*')
      .eq('email', email)
      .single();

    if (fetchError && fetchError.code !== 'PGRST116') {
      console.error('Database error when checking user:', fetchError);
      return NextResponse.json(
        { success: false, error: 'Database error occurred' },
        { status: 500 }
      );
    }

    // Check submission limit
    if (existingUserData && (existingUserData.submission_count || 0) >= 1) {
      console.log('User has already submitted. Submission count:', existingUserData.submission_count);
      
      // Try to get the meeting URL by making a request to Qualiphy (if we have stored meeting info)
      // For now, we'll return the standard message with a placeholder meeting URL
      return NextResponse.json(
        { 
          success: false, 
          error: 'You have already submitted a consultation request. Only one submission is allowed per account.',
          meetingUrl: 'https://app.qualiphy.me/meeting/your-appointment' // This should be retrieved from stored data
        },
        { status: 400 }
      );
    }

    // Validate Qualiphy API key
    if (!process.env.QUALIPHY_API_KEY) {
      console.error('QUALIPHY_API_KEY not configured');
      return NextResponse.json(
        { success: false, error: 'Scheduling service not configured' },
        { status: 500 }
      );
    }

    // Prepare Qualiphy API payload with pharmacy details
    const qualiphyPayload = {
      api_key: process.env.QUALIPHY_API_KEY,
      exams: [examId],
      first_name: firstName,
      last_name: lastName,
      email: email,
      dob: dob,
      phone_number: phoneNumber,
      state: stateAbbreviation,
      tele_state: stateAbbreviation,
      // Pharmacy configuration
      ...pharmacyConfig
    };

    console.log('Calling Qualiphy API with payload (API key hidden):', {
      ...qualiphyPayload,
      api_key: '[HIDDEN]'
    });

    // Call Qualiphy API
    const qualiphyResponse = await fetch('https://api.qualiphy.me/api/exam_invite', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'User-Agent': 'Clinic-API/1.0'
      },
      body: JSON.stringify(qualiphyPayload)
    });

    console.log('Qualiphy API response status:', qualiphyResponse.status);

    // Check content type before parsing
    const contentType = qualiphyResponse.headers.get('content-type');
    
    let qualiphyData: QualiphyApiResponse;
    
    if (contentType && contentType.includes('application/json')) {
      try {
        qualiphyData = await qualiphyResponse.json();
        console.log('Qualiphy API response data:', qualiphyData);
      } catch (parseError) {
        console.error('Failed to parse Qualiphy response:', parseError);
        const responseText = await qualiphyResponse.text();
        console.error('Raw response:', responseText);
        
        return NextResponse.json(
          { success: false, error: 'Invalid response from scheduling service' },
          { status: 502 }
        );
      }
    } else {
      console.error('Invalid content type from Qualiphy:', contentType);
      const responseText = await qualiphyResponse.text();
      console.error('Raw response:', responseText);
      
      return NextResponse.json(
        { success: false, error: 'Invalid response format from scheduling service' },
        { status: 502 }
      );
    }

    // Check for success
    const isSuccess = qualiphyData.http_code === 200 && qualiphyData.meeting_url;
    
    if (isSuccess) {
      console.log('Qualiphy appointment created successfully');
      
      // Save or update user data
      const now = new Date().toISOString();
      
      if (existingUserData) {
        console.log('Updating existing user data with submission count...');
        const { data: updatedData, error: updateError } = await supabaseAdmin
          .from('user_data')
          .update({
            first_name: firstName,
            last_name: lastName,
            phone: phoneNumber,
            state: state,
            dob: dob,
            submission_count: (existingUserData.submission_count || 0) + 1,
            updated_at: now,
            meeting_url: qualiphyData.meeting_url, // Store meeting URL for future reference
            meeting_uuid: qualiphyData.meeting_uuid
          })
          .eq('email', email)
          .select('id, submission_count')
          .single();

        if (updateError) {
          console.error('Failed to update user data:', updateError);
        } else {
          console.log('Updated user data successfully. New submission count:', updatedData?.submission_count);
        }
      } else {
        console.log('Inserting new user data...');
        const { data: insertData, error: insertError } = await supabaseAdmin
          .from('user_data')
          .insert({
            first_name: firstName,
            last_name: lastName,
            email: email,
            phone: phoneNumber,
            state: state,
            dob: dob,
            submission_count: 1,
            created_at: now,
            updated_at: now,
            meeting_url: qualiphyData.meeting_url,
            meeting_uuid: qualiphyData.meeting_uuid
          })
          .select('id, submission_count')
          .single();

        if (insertError) {
          console.error('Failed to insert user data:', insertError);
        } else {
          console.log('Inserted user data successfully with ID:', insertData?.id);
        }
      }

      return NextResponse.json({
        success: true,
        message: 'Appointment scheduled successfully',
        meetingUrl: qualiphyData.meeting_url,
        meetingUuid: qualiphyData.meeting_uuid,
        patientExams: qualiphyData.patient_exams
      });
      
    } else {
      // Error cases
      let errorMessage = 'Failed to schedule appointment';
      
      if (qualiphyData.error_message) {
        errorMessage = qualiphyData.error_message;
      } else if (qualiphyData.http_code === 400) {
        errorMessage = 'Invalid appointment data provided';
      } else if (qualiphyData.http_code === 401) {
        errorMessage = 'Authentication failed with scheduling service';
      } else if (qualiphyData.http_code === 500) {
        errorMessage = 'Scheduling service is temporarily unavailable';
      }
      
      console.error('Qualiphy API error:', errorMessage, qualiphyData);
      
      return NextResponse.json(
        { success: false, error: errorMessage },
        { status: qualiphyData.http_code || 500 }
      );
    }

  } catch (error: unknown) {
    console.error('Unexpected error in Qualiphy API:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'An unexpected error occurred. Please try again later.' 
      },
      { status: 500 }
    );
  }
}

export async function GET(): Promise<NextResponse> {
  return NextResponse.json(
    { error: 'Method not allowed' },
    { status: 405 }
  );
}