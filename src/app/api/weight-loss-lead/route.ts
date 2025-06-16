// src/app/api/weight-loss-lead/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { salesforceService } from '@/lib/salesforce';

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    // Parse request body
    const { formData, contactInfo } = await request.json();

    if (!formData) {
      return NextResponse.json(
        { success: false, error: 'Form data is required' },
        { status: 400 }
      );
    }

    // Transform and create lead
    const leadData = salesforceService.transformFormDataToLead(formData, contactInfo);
    const result = await salesforceService.createWeightLossLead(leadData);

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: 'Lead created successfully'
      });
    } else {
      return NextResponse.json({
        success: false,
        error: result.error
      }, { status: 400 });
    }

  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
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