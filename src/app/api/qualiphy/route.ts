// src/app/api/qualiphy/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getAuthenticatedUser } from '@/utils/apiAuth';

// Initialize Supabase admin client for server operations
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

// State mapping for Qualiphy API (requires abbreviations)
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
  'Virginia': 'VA', 'Washington': 'WA', 'West Virginia': 'WV', 'Wisconsin': 'WI', 'Wyoming': 'WY'
};

interface QualiphyApiResponse {
  http_code: number;
  status: string;
  meeting_url?: string;
  meeting_uuid?: string;
  patient_exams?: any[];
  error_message?: string;
}

interface UserData {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  state: string;
  dob: string;
  submission_count: number;
  created_at: string;
  updated_at: string;
}

export async function POST(request: NextRequest) {
  try {
    // Get current authenticated user using the same method as other API routes
    const user = await getAuthenticatedUser();
    
    if (!user) {
      console.log('Authentication failed - no user found');
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    console.log('Authenticated user:', user.id, user.email);

    // Parse request body
    const body = await request.json();
    const { firstName, lastName, email, phoneNumber, dob, state, examId } = body;

    // Validate required fields
    if (!firstName || !lastName || !email || !phoneNumber || !dob || !state || !examId) {
      return NextResponse.json(
        { success: false, error: 'All fields are required' },
        { status: 400 }
      );
    }

    // Validate user email matches authenticated user
    if (email !== user.email) {
      console.log('Email mismatch:', email, 'vs', user.email);
      return NextResponse.json(
        { success: false, error: 'Email must match authenticated user' },
        { status: 403 }
      );
    }

    // Check if user has already submitted a consultation request
    const { data: existingUserData, error: checkError } = await supabaseAdmin
      .from('user_data')
      .select('id, submission_count, first_name, last_name, phone, state, dob')
      .eq('email', email)
      .single();

    if (checkError && checkError.code !== 'PGRST116') {
      console.error('Database check error:', checkError);
      return NextResponse.json(
        { success: false, error: 'Database error occurred' },
        { status: 500 }
      );
    }

    // Check submission count - if user exists and has already submitted
    if (existingUserData && existingUserData.submission_count >= 1) {
      console.log('User has already submitted. Submission count:', existingUserData.submission_count);
      return NextResponse.json(
        { 
          success: false, 
          error: 'You have already submitted a consultation request. Only one submission is allowed per account.' 
        },
        { status: 400 }
      );
    }

    // Convert state to abbreviation for Qualiphy API
    const stateAbbreviation = STATE_TO_ABBREVIATION[state];
    if (!stateAbbreviation) {
      return NextResponse.json(
        { success: false, error: 'Invalid state provided' },
        { status: 400 }
      );
    }

    // Validate Qualiphy API key is configured
    if (!process.env.QUALIPHY_API_KEY) {
      console.error('QUALIPHY_API_KEY not configured');
      return NextResponse.json(
        { success: false, error: 'Scheduling service not configured' },
        { status: 500 }
      );
    }

    // Prepare Qualiphy API payload with state and tele_state fields
    const qualiphyPayload = {
      api_key: process.env.QUALIPHY_API_KEY,
      exams: [examId],
      first_name: firstName,
      last_name: lastName,
      email: email,
      dob: dob,
      phone_number: phoneNumber,
      state: stateAbbreviation, // Capital abbreviation (e.g., "CA")
      tele_state: stateAbbreviation // Capital abbreviation (e.g., "CA")
    };

    console.log('Calling Qualiphy API with payload (API key hidden):', {
      ...qualiphyPayload,
      api_key: '[HIDDEN]'
    });

    // Call Qualiphy API with corrected URL
    const qualiphyResponse = await fetch('https://api.qualiphy.me/api/exam_invite/', {
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

    // Handle success response
    if (qualiphyData.status === 'success' && qualiphyData.meeting_url) {
      console.log('Qualiphy appointment created successfully');
      
      // Save or update user data in the database
      const now = new Date().toISOString();
      
      if (existingUserData) {
        console.log('Updating existing user data with submission count...');
        // Update existing record and increment submission count
        const { data: updatedData, error: updateError } = await supabaseAdmin
          .from('user_data')
          .update({
            first_name: firstName,
            last_name: lastName,
            phone: phoneNumber,
            state: state,
            dob: dob,
            submission_count: (existingUserData.submission_count || 0) + 1,
            updated_at: now
          })
          .eq('email', email)
          .select('id, submission_count')
          .single();

        if (updateError) {
          console.error('Failed to update user data:', updateError);
          console.error('Update error details:', JSON.stringify(updateError, null, 2));
          // Don't fail the request if DB update fails, as the appointment was created
        } else {
          console.log('Updated user data successfully. New submission count:', updatedData?.submission_count);
        }
      } else {
        console.log('Inserting new user data...');
        // Insert new record with submission_count = 1
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
            updated_at: now
          })
          .select('id, submission_count')
          .single();

        if (insertError) {
          console.error('Failed to insert user data:', insertError);
          console.error('Insert error details:', JSON.stringify(insertError, null, 2));
          // Don't fail the request if DB insert fails, as the appointment was created
        } else {
          console.log('Inserted user data successfully with ID:', insertData?.id, 'Submission count:', insertData?.submission_count);
        }
      }

      // Return success response
      return NextResponse.json({
        success: true,
        message: 'Appointment scheduled successfully',
        meetingUrl: qualiphyData.meeting_url,
        meetingUuid: qualiphyData.meeting_uuid,
        patientExams: qualiphyData.patient_exams
      });
      
    } else {
      // Error cases according to Qualiphy documentation
      let errorMessage = 'Failed to schedule appointment';
      
      if (qualiphyData.error_message) {
        // Use the specific error message from Qualiphy
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