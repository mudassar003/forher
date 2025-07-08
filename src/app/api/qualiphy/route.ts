// src/app/api/qualiphy/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createClient } from '@supabase/supabase-js';
import { RateLimiter } from '@/lib/rateLimiter';
import { getAuthenticatedUser } from '@/utils/apiAuth';

// Initialize Supabase admin client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

// Rate limiter - 5 requests per 15 minutes
const rateLimiter = new RateLimiter({
  interval: 15 * 60 * 1000, // 15 minutes
  uniqueTokenPerInterval: 5
});

// State abbreviation mapping for Qualiphy API
const STATE_TO_ABBREVIATION: Record<string, string> = {
  'Alabama': 'AL', 'Alaska': 'AK', 'Arizona': 'AZ', 'Arkansas': 'AR',
  'California': 'CA', 'Colorado': 'CO', 'Connecticut': 'CT', 'Delaware': 'DE',
  'Florida': 'FL', 'Georgia': 'GA', 'Hawaii': 'HI', 'Idaho': 'ID',
  'Illinois': 'IL', 'Indiana': 'IN', 'Iowa': 'IA', 'Kansas': 'KS',
  'Kentucky': 'KY', 'Louisiana': 'LA', 'Maine': 'ME', 'Maryland': 'MD',
  'Massachusetts': 'MA', 'Michigan': 'MI', 'Minnesota': 'MN', 'Mississippi': 'MS',
  'Missouri': 'MO', 'Montana': 'MT', 'Nebraska': 'NE', 'Nevada': 'NV',
  'New Hampshire': 'NH', 'New Jersey': 'NJ', 'New Mexico': 'NM', 'New York': 'NY',
  'North Carolina': 'NC', 'North Dakota': 'ND', 'Ohio': 'OH', 'Oklahoma': 'OK',
  'Oregon': 'OR', 'Pennsylvania': 'PA', 'Rhode Island': 'RI', 'South Carolina': 'SC',
  'South Dakota': 'SD', 'Tennessee': 'TN', 'Texas': 'TX', 'Utah': 'UT',
  'Vermont': 'VT', 'Virginia': 'VA', 'Washington': 'WA', 'West Virginia': 'WV',
  'Wisconsin': 'WI', 'Wyoming': 'WY'
};

// Validation schema with state field
const qualiphyFormSchema = z.object({
  firstName: z
    .string()
    .trim()
    .min(2, 'First name must be at least 2 characters')
    .max(50, 'First name must be less than 50 characters')
    .regex(/^[a-zA-Z\s'-]+$/, 'First name contains invalid characters'),
    
  lastName: z
    .string()
    .trim()
    .min(2, 'Last name must be at least 2 characters')
    .max(50, 'Last name must be less than 50 characters')
    .regex(/^[a-zA-Z\s'-]+$/, 'Last name contains invalid characters'),
    
  email: z
    .string()
    .trim()
    .toLowerCase()
    .email('Invalid email address')
    .max(254, 'Email address is too long'),
    
  phoneNumber: z
    .string()
    .trim()
    .regex(/^\+1[0-9]{10}$/, 'Phone must be in format +1XXXXXXXXXX'),
    
  dob: z
    .string()
    .trim()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format')
    .refine((date) => {
      const dateObj = new Date(date);
      const now = new Date();
      const minAge = 18;
      const maxAge = 120;
      
      if (isNaN(dateObj.getTime())) return false;
      
      const age = now.getFullYear() - dateObj.getFullYear();
      const monthDiff = now.getMonth() - dateObj.getMonth();
      const dayDiff = now.getDate() - dateObj.getDate();
      
      let actualAge = age;
      if (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)) {
        actualAge--;
      }
      
      return actualAge >= minAge && actualAge <= maxAge;
    }, 'Age must be between 18 and 120 years'),
    
  state: z
    .string()
    .trim()
    .refine(
      (state) => Object.keys(STATE_TO_ABBREVIATION).includes(state),
      'Invalid US state'
    ),
    
  examId: z
    .number()
    .int()
    .positive('Exam ID must be a positive number')
    .refine((id) => [918, 1324, 1325, 2095, 2097, 2186, 2490, 452, 127, 131].includes(id), 
      'Invalid exam ID')
});

// Updated interface to match Qualiphy's actual response format
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

interface UserDataRow {
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

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    // Rate limiting
    const rateLimitResult = await rateLimiter.check(req);
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Too many requests. Please try again later.' 
        },
        { 
          status: 429,
          headers: {
            'X-RateLimit-Limit': rateLimitResult.limit.toString(),
            'X-RateLimit-Remaining': rateLimitResult.remaining.toString(),
            'X-RateLimit-Reset': new Date(rateLimitResult.resetTime).toISOString()
          }
        }
      );
    }

    // Authentication
    const user = await getAuthenticatedUser();
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Validate request body
    const body = await req.json();
    const validation = qualiphyFormSchema.safeParse(body);
    
    if (!validation.success) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Invalid form data',
          details: validation.error.errors.map(err => err.message)
        },
        { status: 400 }
      );
    }

    const { firstName, lastName, email, phoneNumber, dob, state, examId } = validation.data;

    // Check if user exists and get submission count
    const { data: existingUser, error: fetchError } = await supabaseAdmin
      .from('user_data')
      .select('*')
      .eq('email', email)
      .single();

    if (fetchError && fetchError.code !== 'PGRST116') { // PGRST116 is "not found"
      console.error('Database fetch error:', fetchError);
      return NextResponse.json(
        { success: false, error: 'Database error' },
        { status: 500 }
      );
    }

    // Check submission limit (max 1 submission per user)
    if (existingUser && existingUser.submission_count >= 1) {
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

    // Prepare Qualiphy API payload with state and tele_state fields
    const qualiphyPayload = {
      api_key: process.env.QUALIPHY_API_KEY!,
      exams: [examId],
      first_name: firstName,
      last_name: lastName,
      email: email,
      dob: dob,
      phone_number: phoneNumber,
      state: stateAbbreviation, // Capital abbreviation (e.g., "CA")
      tele_state: stateAbbreviation // Capital abbreviation (e.g., "CA")
    };

    console.log('Calling Qualiphy API with payload:', {
      ...qualiphyPayload,
      api_key: '[REDACTED]' // Don't log the API key
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

    console.log('Qualiphy response status:', qualiphyResponse.status);

    // Check content type before parsing
    const contentType = qualiphyResponse.headers.get('content-type');
    
    let qualiphyData: QualiphyApiResponse;
    
    if (contentType && contentType.includes('application/json')) {
      try {
        qualiphyData = await qualiphyResponse.json();
        console.log('Qualiphy response data:', qualiphyData);
      } catch (parseError) {
        console.error('Failed to parse JSON response:', parseError);
        const responseText = await qualiphyResponse.text();
        console.error('Raw response:', responseText.substring(0, 500));
        
        return NextResponse.json(
          { success: false, error: 'Invalid response from scheduling service' },
          { status: 502 }
        );
      }
    } else {
      // Response is not JSON (likely HTML error page)
      const responseText = await qualiphyResponse.text();
      console.error('Non-JSON response from Qualiphy:', responseText.substring(0, 500));
      
      return NextResponse.json(
        { success: false, error: 'Scheduling service returned an unexpected response format' },
        { status: 502 }
      );
    }
    
    // Handle Qualiphy API response according to their documentation
    if (qualiphyData.http_code === 200 && qualiphyData.meeting_url) {
      // Success case
      console.log('Qualiphy appointment scheduled successfully');
      
      // Update or insert user data
      const now = new Date().toISOString();
      
      if (existingUser) {
        // Update existing user and increment submission count
        const { error: updateError } = await supabaseAdmin
          .from('user_data')
          .update({
            first_name: firstName,
            last_name: lastName,
            phone: phoneNumber,
            state: state, // Store full state name in our DB
            dob: dob,
            submission_count: (existingUser.submission_count || 0) + 1,
            updated_at: now
          })
          .eq('email', email);

        if (updateError) {
          console.error('Database update error:', updateError);
          // Don't fail the request if DB update fails, as the appointment was created
          console.warn('Appointment created but failed to update user data');
        }
      } else {
        // Insert new user with submission count of 1
        const { error: insertError } = await supabaseAdmin
          .from('user_data')
          .insert({
            first_name: firstName,
            last_name: lastName,
            email: email,
            phone: phoneNumber,
            state: state, // Store full state name in our DB
            dob: dob,
            submission_count: 1,
            created_at: now,
            updated_at: now
          });

        if (insertError) {
          console.error('Database insert error:', insertError);
          // Don't fail the request if DB insert fails, as the appointment was created
          console.warn('Appointment created but failed to save user data');
        }
      }

      // Return success response with updated field names
      return NextResponse.json({
        success: true,
        message: 'Appointment scheduled successfully',
        meetingUrl: qualiphyData.meeting_url,
        meetingUuid: qualiphyData.meeting_uuid,
        patientExams: qualiphyData.patient_exams
      });
      
    } else {
      // Error cases according to Qualiphy documentation
      console.error('Qualiphy API error response:', qualiphyData);
      
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
      
      return NextResponse.json(
        { success: false, error: errorMessage },
        { status: qualiphyData.http_code || 500 }
      );
    }

  } catch (error: unknown) {
    console.error('Qualiphy API route error:', error);
    
    // More detailed error logging
    if (error instanceof Error) {
      console.error('Error name:', error.name);
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
    }
    
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