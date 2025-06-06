// src/app/api/subscriptions/appointment-access/route.ts
// API routes for managing appointment page access

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/database';
import { 
  AppointmentAccessResponse, 
  AppointmentAccessStatus, 
  GrantAccessRequest, 
  GrantAccessResponse 
} from '@/types/subscription';

// GET - Check current appointment access status
export async function GET(request: NextRequest): Promise<NextResponse<AppointmentAccessResponse>> {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
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

    const userId = session.user.id;
    
    // Get user's active subscription with appointment access data
    const subscription = await db.query(`
      SELECT 
        id,
        user_id,
        status,
        appointment_accessed_at,
        appointment_access_expired,
        appointment_access_duration
      FROM user_subscriptions 
      WHERE user_id = $1 AND status = 'active'
      ORDER BY created_at DESC 
      LIMIT 1
    `, [userId]);

    if (!subscription.rows.length) {
      return NextResponse.json({
        success: false,
        message: 'No active subscription found',
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
      }, { status:403 });
    }

    const sub = subscription.rows[0];
    const now = new Date();
    
    // If never accessed before
    if (!sub.appointment_accessed_at) {
      const accessStatus: AppointmentAccessStatus = {
        hasAccess: true,
        isExpired: false,
        isFirstAccess: true,
        accessedAt: null,
        timeRemaining: sub.appointment_access_duration,
        accessDuration: sub.appointment_access_duration,
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
        accessDuration: sub.appointment_access_duration,
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
    const expiresAt = new Date(accessedAt.getTime() + (sub.appointment_access_duration * 1000));
    const timeRemaining = Math.max(0, Math.floor((expiresAt.getTime() - now.getTime()) / 1000));

    // Check if access has expired
    if (timeRemaining <= 0) {
      // Mark as permanently expired
      await db.query(`
        UPDATE user_subscriptions 
        SET appointment_access_expired = true, updated_at = NOW()
        WHERE id = $1
      `, [sub.id]);

      const accessStatus: AppointmentAccessStatus = {
        hasAccess: false,
        isExpired: true,
        isFirstAccess: false,
        accessedAt: sub.appointment_accessed_at,
        timeRemaining: 0,
        accessDuration: sub.appointment_access_duration,
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
      accessDuration: sub.appointment_access_duration,
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
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
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

    const userId = session.user.id;
    
    // Get user's active subscription
    const subscription = await db.query(`
      SELECT 
        id,
        appointment_accessed_at,
        appointment_access_expired,
        appointment_access_duration
      FROM user_subscriptions 
      WHERE user_id = $1 AND status = 'active'
      ORDER BY created_at DESC 
      LIMIT 1
    `, [userId]);

    if (!subscription.rows.length) {
      return NextResponse.json({
        success: false,
        message: 'No active subscription found',
        data: {
          accessGrantedAt: '',
          expiresAt: '',
          duration: 0
        }
      }, { status: 403 });
    }

    const sub = subscription.rows[0];
    const now = new Date();

    // Check if already accessed or expired
    if (sub.appointment_accessed_at || sub.appointment_access_expired) {
      return NextResponse.json({
        success: false,
        message: 'Appointment access already used or expired',
        data: {
          accessGrantedAt: sub.appointment_accessed_at || '',
          expiresAt: '',
          duration: sub.appointment_access_duration
        }
      }, { status: 403 });
    }

    // Grant access by marking the timestamp
    const accessGrantedAt = now.toISOString();
    const expiresAt = new Date(now.getTime() + (sub.appointment_access_duration * 1000)).toISOString();

    await db.query(`
      UPDATE user_subscriptions 
      SET 
        appointment_accessed_at = $1,
        updated_at = NOW()
      WHERE id = $2
    `, [accessGrantedAt, sub.id]);

    return NextResponse.json({
      success: true,
      message: 'Appointment access granted',
      data: {
        accessGrantedAt,
        expiresAt,
        duration: sub.appointment_access_duration
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