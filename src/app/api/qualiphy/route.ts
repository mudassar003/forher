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

// Validation schema
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
    
  examId: z
    .number()
    .int()
    .positive('Exam ID must be a positive number')
    .refine((id) => [918, 1324, 1325, 2095, 2097, 2186, 2490, 452, 127, 131].includes(id), 
      'Invalid exam ID')
});

interface QualiphyApiResponse {
  status: 'success' | 'error';
  message?: string;
  meeting_url?: string;
  exam_id?: number;
  patient_exam_id?: number;
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

    const { firstName, lastName, email, phoneNumber, dob, examId } = validation.data;

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

    // Prepare Qualiphy API payload
    const qualiphyPayload = {
      api_key: process.env.QUALIPHY_API_KEY!,
      exams: [examId],
      first_name: firstName,
      last_name: lastName,
      email: email,
      dob: dob,
      phone_number: phoneNumber
    };

    // Call Qualiphy API
    console.log('Calling Qualiphy API...');
    const qualiphyResponse = await fetch('https://www.app.qualiphy.me/api/exam_invite/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(qualiphyPayload)
    });

    const qualiphyData: QualiphyApiResponse = await qualiphyResponse.json();
    
    if (!qualiphyResponse.ok) {
      console.error('Qualiphy API error:', qualiphyData);
      
      let errorMessage = 'Failed to schedule appointment';
      if (qualiphyResponse.status === 400) {
        errorMessage = 'Invalid appointment data provided';
      } else if (qualiphyResponse.status === 401) {
        errorMessage = 'Authentication failed with scheduling service';
      } else if (qualiphyResponse.status >= 500) {
        errorMessage = 'Scheduling service is temporarily unavailable';
      }
      
      return NextResponse.json(
        { success: false, error: errorMessage },
        { status: qualiphyResponse.status }
      );
    }

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
          dob: dob,
          submission_count: (existingUser.submission_count || 0) + 1,
          updated_at: now
        })
        .eq('email', email);

      if (updateError) {
        console.error('Database update error:', updateError);
        return NextResponse.json(
          { success: false, error: 'Failed to update user data' },
          { status: 500 }
        );
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
          state: 'Unknown', // Default state since not collected in form
          dob: dob,
          submission_count: 1,
          created_at: now,
          updated_at: now
        });

      if (insertError) {
        console.error('Database insert error:', insertError);
        return NextResponse.json(
          { success: false, error: 'Failed to save user data' },
          { status: 500 }
        );
      }
    }

    console.log('Qualiphy appointment scheduled successfully');

    // Return success response
    return NextResponse.json({
      success: true,
      message: 'Appointment scheduled successfully',
      meetingUrl: qualiphyData.meeting_url,
      examId: qualiphyData.exam_id,
      patientExamId: qualiphyData.patient_exam_id
    });

  } catch (error: unknown) {
    console.error('Qualiphy API route error:', error);
    
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