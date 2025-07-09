// src/app/api/user-data/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { userDataSchema, sanitizeUserData, type UserDataInput } from '@/lib/validations/userData';
import { RateLimiter } from '@/lib/rateLimiter';
import { ZodError } from 'zod';

// Initialize Supabase admin client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('Missing Supabase environment variables');
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Rate limiter: 5 requests per 15 minutes per IP
const rateLimiter = new RateLimiter({
  interval: 15 * 60 * 1000, // 15 minutes
  uniqueTokenPerInterval: 5
});

// Security headers
const securityHeaders = {
  'Content-Security-Policy': "default-src 'self'",
  'X-Content-Type-Options': 'nosniff',
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
  'X-Frame-Options': 'DENY',
  'Referrer-Policy': 'strict-origin-when-cross-origin'
};

interface UserDataResponse {
  success: boolean;
  message?: string;
  error?: string;
  data?: {
    id: string;
    created_at: string;
  };
}

export async function POST(request: NextRequest): Promise<NextResponse<UserDataResponse>> {
  try {
    // Rate limiting check
    const rateLimitResult = await rateLimiter.check(request);
    
    if (!rateLimitResult.success) {
      const resetTime = Math.ceil((rateLimitResult.resetTime - Date.now()) / 1000);
      
      return NextResponse.json(
        {
          success: false,
          error: 'Too many requests. Please try again later.'
        },
        {
          status: 429,
          headers: {
            ...securityHeaders,
            'Retry-After': resetTime.toString(),
            'X-RateLimit-Limit': rateLimitResult.limit.toString(),
            'X-RateLimit-Remaining': rateLimitResult.remaining.toString(),
            'X-RateLimit-Reset': Math.ceil(rateLimitResult.resetTime / 1000).toString()
          }
        }
      );
    }

    // Parse and validate request body
    let body: any;
    try {
      body = await request.json();
    } catch (parseError) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid JSON in request body'
        },
        { 
          status: 400,
          headers: securityHeaders
        }
      );
    }

    // Sanitize input data
    const sanitizedData = {
      firstName: sanitizeUserData.name(body.firstName || ''),
      lastName: sanitizeUserData.name(body.lastName || ''),
      email: sanitizeUserData.email(body.email || ''),
      phone: sanitizeUserData.phone(body.phone || ''),
      state: body.state?.trim() || '',
      dateOfBirth: body.dateOfBirth?.trim() || ''
    };

    // Validate with Zod schema
    let validatedData: UserDataInput;
    try {
      validatedData = userDataSchema.parse(sanitizedData);
    } catch (error) {
      if (error instanceof ZodError) {
        const errorMessages = error.errors.map(err => `${err.path.join('.')}: ${err.message}`);
        return NextResponse.json(
          {
            success: false,
            error: `Validation failed: ${errorMessages.join(', ')}`
          },
          { 
            status: 400,
            headers: securityHeaders
          }
        );
      }
      throw error;
    }

    // Check for duplicate email or phone
    const { data: existingUsers, error: duplicateCheckError } = await supabase
      .from('user_data')
      .select('id, email, phone')
      .or(`email.eq.${validatedData.email},phone.eq.${validatedData.phone}`);

    if (duplicateCheckError) {
      return NextResponse.json(
        {
          success: false,
          error: 'Database error occurred. Please try again.'
        },
        { 
          status: 500,
          headers: securityHeaders
        }
      );
    }

    if (existingUsers && existingUsers.length > 0) {
      const duplicateFields = [];
      
      for (const user of existingUsers) {
        if (user.email === validatedData.email) {
          duplicateFields.push('email');
        }
        if (user.phone === validatedData.phone) {
          duplicateFields.push('phone');
        }
      }

      return NextResponse.json(
        {
          success: false,
          error: `User with this ${duplicateFields.join(' and ')} already exists`
        },
        { 
          status: 409,
          headers: securityHeaders
        }
      );
    }

    // Insert user data into database
    const { data: insertedData, error: insertError } = await supabase
      .from('user_data')
      .insert({
        first_name: validatedData.firstName,
        last_name: validatedData.lastName,
        email: validatedData.email,
        phone: validatedData.phone,
        state: validatedData.state,
        dob: validatedData.dateOfBirth
      })
      .select('id, created_at')
      .single();

    if (insertError) {
      // Handle specific database errors
      if (insertError.code === '23505') { // Unique constraint violation
        return NextResponse.json(
          {
            success: false,
            error: 'User with this email or phone already exists'
          },
          { 
            status: 409,
            headers: securityHeaders
          }
        );
      }
      
      return NextResponse.json(
        {
          success: false,
          error: 'Failed to save user data. Please try again.'
        },
        { 
          status: 500,
          headers: securityHeaders
        }
      );
    }

    // Success response
    return NextResponse.json(
      {
        success: true,
        message: 'User data saved successfully',
        data: {
          id: insertedData.id,
          created_at: insertedData.created_at
        }
      },
      {
        status: 201,
        headers: {
          ...securityHeaders,
          'X-RateLimit-Limit': rateLimitResult.limit.toString(),
          'X-RateLimit-Remaining': rateLimitResult.remaining.toString(),
          'X-RateLimit-Reset': Math.ceil(rateLimitResult.resetTime / 1000).toString()
        }
      }
    );

  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error occurred'
      },
      { 
        status: 500,
        headers: securityHeaders
      }
    );
  }
}

// Reject all non-POST requests
export async function GET(): Promise<NextResponse> {
  return NextResponse.json(
    { error: 'Method not allowed' },
    { 
      status: 405,
      headers: {
        ...securityHeaders,
        'Allow': 'POST'
      }
    }
  );
}

export async function PUT(): Promise<NextResponse> {
  return NextResponse.json(
    { error: 'Method not allowed' },
    { 
      status: 405,
      headers: {
        ...securityHeaders,
        'Allow': 'POST'
      }
    }
  );
}

export async function DELETE(): Promise<NextResponse> {
  return NextResponse.json(
    { error: 'Method not allowed' },
    { 
      status: 405,
      headers: {
        ...securityHeaders,
        'Allow': 'POST'
      }
    }
  );
}

export async function PATCH(): Promise<NextResponse> {
  return NextResponse.json(
    { error: 'Method not allowed' },
    { 
      status: 405,
      headers: {
        ...securityHeaders,
        'Allow': 'POST'
      }
    }
  );
}