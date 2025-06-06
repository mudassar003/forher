// src/app/api/subscriptions/appointment-access/route.ts
// API routes for managing appointment page access

import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/utils/apiAuth';
import { createClient } from "@supabase/supabase-js";
import { 
  AppointmentAccessResponse, 
  AppointmentAccessStatus, 
  GrantAccessRequest, 
  GrantAccessResponse 
} from '@/types/subscription';

// Initialize Supabase admin client for server operations
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

// GET - Check current appointment access status
export async function GET(request: NextRequest): Promise<NextResponse<AppointmentAccessResponse>> {
  try {
    const user = await getAuthenticatedUser();
    
    if (!user?.id) {
      return NextResponse.json({
        success: false,
        message: 'Unauthorized',
        data: {
          hasAccess: false,
          isExpired: true,
          isFirstAccess: false,
          accessedAt: null,
          timeRemaining: 0,
          accessDuration: 0,
          expiresAt: null,
          needsSupportContact: false
        }
      }, { status: 401 });
    }

    const userId = user.id;
    
    // Get user's active subscription with appointment access data
    const { data: subscriptions, error: fetchError } = await supabaseAdmin
      .from('user_subscriptions')
      .select(`
        id,
        user_id,
        status,
        has_appointment_access,
        appointment_accessed_at,
        appointment_access_expired,
        appointment_access_duration
      `)
      .eq('user_id', userId)
      .eq('is_active', true)
      .eq('has_appointment_access', true)
      .order('created_at', { ascending: false })
      .limit(1);

    if (fetchError) {
      console.error('Error fetching subscription:', fetchError);
      return NextResponse.json({
        success: false,
        message: 'Error checking subscription',
        data: {
          hasAccess: false,
          isExpired: true,
          isFirstAccess: false,
          accessedAt: null,
          timeRemaining: 0,
          accessDuration: 0,
          expiresAt: null,
          needsSupportContact: false
        }
      }, { status: 500 });
    }

    if (!subscriptions || subscriptions.length === 0) {
      return NextResponse.json({
        success: false,
        message: 'No active subscription found with appointment access',
        data: {
          hasAccess: false,
          isExpired: true,
          isFirstAccess: false,
          accessedAt: null,
          timeRemaining: 0,
          accessDuration: 0,
          expiresAt: null,
          needsSupportContact: false
        }
      }, { status: 403 });
    }

    const sub = subscriptions[0];
    const now = new Date();
    
    // Default access duration (10 minutes in seconds)
    const defaultAccessDuration = sub.appointment_access_duration || 600;
    
    // If never accessed before
    if (!sub.appointment_accessed_at) {
      const accessStatus: AppointmentAccessStatus = {
        hasAccess: true,
        isExpired: false,
        isFirstAccess: true,
        accessedAt: null,
        timeRemaining: defaultAccessDuration,
        accessDuration: defaultAccessDuration,
        expiresAt: null,
        needsSupportContact: false
      };

      return NextResponse.json({
        success: true,
        message: 'First time access available',
        data: accessStatus
      });
    }

    // If access has been permanently expired
    if (sub.appointment_access_expired) {
      const accessStatus: AppointmentAccessStatus = {
        hasAccess: false,
        isExpired: true,
        isFirstAccess: false,
        accessedAt: sub.appointment_accessed_at,
        timeRemaining: 0,
        accessDuration: defaultAccessDuration,
        expiresAt: null,
        needsSupportContact: true
      };

      return NextResponse.json({
        success: false,
        message: 'Appointment access has permanently expired. Please contact support.',
        data: accessStatus
      });
    }

    // Calculate time remaining
    const accessedAt = new Date(sub.appointment_accessed_at);
    const expiresAt = new Date(accessedAt.getTime() + (defaultAccessDuration * 1000));
    const timeRemaining = Math.max(0, Math.floor((expiresAt.getTime() - now.getTime()) / 1000));

    // Check if access has expired
    if (timeRemaining <= 0) {
      // Mark as permanently expired
      const { error: updateError } = await supabaseAdmin
        .from('user_subscriptions')
        .update({ 
          appointment_access_expired: true, 
          updated_at: new Date().toISOString()
        })
        .eq('id', sub.id);

      if (updateError) {
        console.error('Error updating subscription:', updateError);
      }

      const accessStatus: AppointmentAccessStatus = {
        hasAccess: false,
        isExpired: true,
        isFirstAccess: false,
        accessedAt: sub.appointment_accessed_at,
        timeRemaining: 0,
        accessDuration: defaultAccessDuration,
        expiresAt: expiresAt.toISOString(),
        needsSupportContact: true
      };

      return NextResponse.json({
        success: false,
        message: 'Appointment access has expired. Please contact support.',
        data: accessStatus
      });
    }

    // Active access
    const accessStatus: AppointmentAccessStatus = {
      hasAccess: true,
      isExpired: false,
      isFirstAccess: false,
      accessedAt: sub.appointment_accessed_at,
      timeRemaining,
      accessDuration: defaultAccessDuration,
      expiresAt: expiresAt.toISOString(),
      needsSupportContact: false
    };

    return NextResponse.json({
      success: true,
      message: 'Access is active',
      data: accessStatus
    });

  } catch (error) {
    console.error('Error checking appointment access:', error);
    return NextResponse.json({
      success: false,
      message: 'Internal server error',
      data: {
        hasAccess: false,
        isExpired: true,
        isFirstAccess: false,
        accessedAt: null,
        timeRemaining: 0,
        accessDuration: 0,
        expiresAt: null,
        needsSupportContact: false
      },
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// POST - Grant appointment access (marks first access)
export async function POST(request: NextRequest): Promise<NextResponse<GrantAccessResponse>> {
  try {
    const user = await getAuthenticatedUser();
    
    if (!user?.id) {
      return NextResponse.json({
        success: false,
        message: 'Unauthorized',
        data: {
          accessGrantedAt: '',
          expiresAt: '',
          duration: 0
        }
      }, { status: 401 });
    }

    const userId = user.id;
    
    // Get user's active subscription
    const { data: subscriptions, error: fetchError } = await supabaseAdmin
      .from('user_subscriptions')
      .select(`
        id,
        has_appointment_access,
        appointment_accessed_at,
        appointment_access_expired,
        appointment_access_duration
      `)
      .eq('user_id', userId)
      .eq('is_active', true)
      .eq('has_appointment_access', true)
      .order('created_at', { ascending: false })
      .limit(1);

    if (fetchError) {
      console.error('Error fetching subscription:', fetchError);
      return NextResponse.json({
        success: false,
        message: 'Error checking subscription',
        data: {
          accessGrantedAt: '',
          expiresAt: '',
          duration: 0
        }
      }, { status: 500 });
    }

    if (!subscriptions || subscriptions.length === 0) {
      return NextResponse.json({
        success: false,
        message: 'No active subscription found with appointment access',
        data: {
          accessGrantedAt: '',
          expiresAt: '',
          duration: 0
        }
      }, { status: 403 });
    }

    const sub = subscriptions[0];
    const now = new Date();
    const accessDuration = sub.appointment_access_duration || 600; // Default 10 minutes

    // Check if already accessed or expired
    if (sub.appointment_accessed_at || sub.appointment_access_expired) {
      return NextResponse.json({
        success: false,
        message: 'Appointment access already used or expired',
        data: {
          accessGrantedAt: sub.appointment_accessed_at || '',
          expiresAt: '',
          duration: accessDuration
        }
      }, { status: 403 });
    }

    // Grant access by marking the timestamp
    const accessGrantedAt = now.toISOString();
    const expiresAt = new Date(now.getTime() + (accessDuration * 1000)).toISOString();

    const { error: updateError } = await supabaseAdmin
      .from('user_subscriptions')
      .update({
        appointment_accessed_at: accessGrantedAt,
        updated_at: now.toISOString()
      })
      .eq('id', sub.id);

    if (updateError) {
      console.error('Error updating subscription:', updateError);
      return NextResponse.json({
        success: false,
        message: 'Failed to grant access',
        data: {
          accessGrantedAt: '',
          expiresAt: '',
          duration: 0
        }
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: 'Appointment access granted',
      data: {
        accessGrantedAt,
        expiresAt,
        duration: accessDuration
      }
    });

  } catch (error) {
    console.error('Error granting appointment access:', error);
    return NextResponse.json({
      success: false,
      message: 'Internal server error',
      data: {
        accessGrantedAt: '',
        expiresAt: '',
        duration: 0
      },
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}