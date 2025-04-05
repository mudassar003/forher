// src/app/api/auth-test/sanity/route.ts
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { client as sanityClient } from '@/sanity/lib/client';
import { getAuthenticatedUser } from '@/utils/apiAuth';

// Define the shape of the expected request body
interface SanityTestData {
  userId: string;
  userEmail: string;
  testName: string;
  subscriptionType: string;
}

export async function POST(req: Request) {
  // Get the authenticated user
  const user = await getAuthenticatedUser();
  
  // If not authenticated, return error
  if (!user) {
    return NextResponse.json(
      { success: false, error: 'Authentication required' },
      { status: 401 }
    );
  }
  
  try {
    // Get request data
    const data: SanityTestData = await req.json();
    
    // Verify the user ID matches the authenticated user
    if (data.userId !== user.id) {
      return NextResponse.json(
        { success: false, error: 'User ID mismatch - cannot create data for another user' },
        { status: 403 }
      );
    }

    // Log the authenticated user for debugging
    console.log('Creating Sanity test record for user:', user.id, user.email);
    
    // Current timestamp for various date fields
    const now = new Date().toISOString();
    
    // Build a test user subscription document based on your schema
    const testSubscription = {
      _type: 'userSubscription',
      userId: user.id,
      userEmail: user.email || data.userEmail,
      // Reference to a placeholder subscription
      // NOTE: You might need to replace this with a valid subscription ID
      subscription: {
        _type: 'reference',
        _ref: 'placeholder-subscription-id'
      },
      startDate: now,
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
      isActive: true,
      status: 'test',
      billingPeriod: 'monthly',
      billingAmount: 0,
      // Add a prefix to easily identify test records
      testRecord: true,
      testName: data.testName
    };

    // Create document in Sanity
    const sanityResponse = await sanityClient.create(testSubscription);
    
    console.log('Sanity test record created:', sanityResponse._id);

    return NextResponse.json({
      success: true,
      message: 'Test record created successfully in Sanity',
      record: {
        id: sanityResponse._id,
        type: sanityResponse._type,
        createdAt: sanityResponse._createdAt
      }
    });

  } catch (error) {
    console.error('Error creating Sanity test record:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'An unexpected error occurred',
        details: error instanceof Error ? error.stack : undefined
      }, 
      { status: 500 }
    );
  }
}