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
      return NextResponse.json(
        { success: false, error: 'Security verification temporarily unavailable' },
        { status: 503 }
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
    return NextResponse.json(
      { success: false, error: 'Security verification failed' },
      { status: 500 }
    );
  }
}