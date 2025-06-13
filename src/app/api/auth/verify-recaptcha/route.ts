// src/app/api/auth/verify-recaptcha/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { verifyRecaptcha } from '@/utils/recaptchaUtils';

export async function POST(request: NextRequest) {
  try {
    const { token, action } = await request.json();

    // Validate required fields
    if (!token || !action) {
      return NextResponse.json(
        { success: false, error: 'Token and action are required' },
        { status: 400 }
      );
    }

    // Get secret key from environment
    const secretKey = process.env.RECAPTCHA_SECRET_KEY;
    if (!secretKey) {
      console.error('RECAPTCHA_SECRET_KEY not configured');
      return NextResponse.json(
        { success: false, error: 'reCAPTCHA not configured' },
        { status: 500 }
      );
    }

    // Verify the reCAPTCHA token
    const result = await verifyRecaptcha(token, secretKey, action);

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      score: result.score
    });

  } catch (error) {
    console.error('reCAPTCHA verification error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}