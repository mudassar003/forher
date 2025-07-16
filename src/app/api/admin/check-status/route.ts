// src/app/api/admin/check-status/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedAdmin } from '@/utils/adminAuthServer';

export async function GET() {
  try {
    const admin = await getAuthenticatedAdmin();
    
    return NextResponse.json({
      success: true,
      isAdmin: !!admin,
      email: admin?.email || null
    });
  } catch (error) {
    console.error('Error checking admin status:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to check admin status' },
      { status: 500 }
    );
  }
}