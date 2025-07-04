// src/utils/appointmentAccessUtils.ts

import React from 'react';
import { 
  AppointmentAccessResponse, 
  AppointmentAccessRequest, 
  TimeFormat, 
  APPOINTMENT_ACCESS_CONSTANTS,
  APPOINTMENT_ACCESS_ENDPOINTS
} from '@/types/appointmentAccess';

/**
 * Client-side service for appointment access management
 * Handles API communication and utility functions
 */
export class AppointmentAccessService {
  
  /**
   * Check appointment access via API POST request
   * Records first-time access on server
   */
  static async checkAccess(userId: string): Promise<AppointmentAccessResponse> {
    try {
      const requestData: AppointmentAccessRequest = { userId };
      
      const response = await fetch(APPOINTMENT_ACCESS_ENDPOINTS.CHECK_ACCESS, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
        credentials: 'include', // Important for Vercel deployment
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result: AppointmentAccessResponse = await response.json();
      return result;
    } catch (error) {
      console.error('Error checking appointment access:', error);
      return {
        success: false,
        hasAccess: false,
        isFirstTime: false,
        timeRemaining: 0,
        accessExpired: false,
        error: error instanceof Error ? error.message : 'Failed to check access'
      };
    }
  }

  /**
   * Get current access status via API GET request
   * Used for status checks without recording access
   */
  static async getAccessStatus(userId: string): Promise<AppointmentAccessResponse> {
    try {
      const url = new URL(APPOINTMENT_ACCESS_ENDPOINTS.GET_STATUS, window.location.origin);
      url.searchParams.set('userId', userId);
      
      const response = await fetch(url.toString(), {
        method: 'GET',
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result: AppointmentAccessResponse = await response.json();
      return result;
    } catch (error) {
      console.error('Error getting access status:', error);
      return {
        success: false,
        hasAccess: false,
        isFirstTime: false,
        timeRemaining: 0,
        accessExpired: false,
        error: error instanceof Error ? error.message : 'Failed to get status'
      };
    }
  }

  /**
   * Format seconds into MM:SS display format
   */
  static formatTime(seconds: number): TimeFormat {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    const formatted = `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
    
    return {
      minutes,
      seconds: remainingSeconds,
      formatted
    };
  }

  /**
   * Get user-friendly time remaining message
   */
  static getTimeRemainingMessage(seconds: number): string {
    if (seconds <= 0) return 'Time expired';
    
    const { minutes, seconds: secs } = this.formatTime(seconds);
    
    if (minutes === 0) {
      return `${secs} second${secs !== 1 ? 's' : ''} remaining`;
    }
    
    if (secs === 0) {
      return `${minutes} minute${minutes !== 1 ? 's' : ''} remaining`;
    }
    
    return `${minutes}:${secs.toString().padStart(2, '0')} remaining`;
  }

  /**
   * Check if time is critically low (under 2 minutes)
   */
  static isCriticalTime(seconds: number): boolean {
    return seconds > 0 && seconds <= 120; // 2 minutes
  }

  /**
   * Check if time is warning level (under 5 minutes)
   */
  static isWarningTime(seconds: number): boolean {
    return seconds > 120 && seconds <= 300; // 2-5 minutes
  }

  /**
   * Get appropriate CSS classes for time display based on remaining time
   */
  static getTimeDisplayClasses(seconds: number): string {
    if (this.isCriticalTime(seconds)) {
      return 'text-red-600 font-bold animate-pulse';
    }
    
    if (this.isWarningTime(seconds)) {
      return 'text-orange-600 font-medium';
    }
    
    return 'text-blue-600';
  }

  /**
   * Validate if user has sufficient time for action (minimum 1 minute)
   */
  static hasSufficientTime(seconds: number): boolean {
    return seconds >= 60; // At least 1 minute
  }

  /**
   * Calculate progress percentage for progress bars
   */
  static getProgressPercentage(timeRemaining: number, totalDuration: number = APPOINTMENT_ACCESS_CONSTANTS.DEFAULT_DURATION_SECONDS): number {
    if (totalDuration <= 0) return 0;
    const percentage = (timeRemaining / totalDuration) * 100;
    return Math.max(0, Math.min(100, percentage));
  }
}

/**
 * Custom hook for managing appointment access countdown
 */
export function useAppointmentCountdown(initialTime: number) {
  const [timeRemaining, setTimeRemaining] = React.useState(initialTime);
  const [isExpired, setIsExpired] = React.useState(false);

  React.useEffect(() => {
    if (timeRemaining <= 0) {
      setIsExpired(true);
      return;
    }

    const timer = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          setIsExpired(true);
          return 0;
        }
        return prev - 1;
      });
    }, APPOINTMENT_ACCESS_CONSTANTS.COUNTDOWN_UPDATE_INTERVAL);

    return () => clearInterval(timer);
  }, [timeRemaining]);

  const formattedTime = AppointmentAccessService.formatTime(timeRemaining);
  const timeMessage = AppointmentAccessService.getTimeRemainingMessage(timeRemaining);
  const displayClasses = AppointmentAccessService.getTimeDisplayClasses(timeRemaining);
  const progressPercentage = AppointmentAccessService.getProgressPercentage(timeRemaining);

  return {
    timeRemaining,
    isExpired,
    formattedTime,
    timeMessage,
    displayClasses,
    progressPercentage,
    isCritical: AppointmentAccessService.isCriticalTime(timeRemaining),
    isWarning: AppointmentAccessService.isWarningTime(timeRemaining),
    hasSufficientTime: AppointmentAccessService.hasSufficientTime(timeRemaining)
  };
}

/**
 * Error handler for appointment access errors
 */
export function handleAppointmentAccessError(error: string | undefined): {
  message: string;
  action: 'retry' | 'contact' | 'subscribe';
} {
  if (!error) {
    return {
      message: 'Unknown error occurred',
      action: 'retry'
    };
  }

  if (error.includes('subscription')) {
    return {
      message: 'Valid subscription required for appointment access',
      action: 'subscribe'
    };
  }

  if (error.includes('expired') || error.includes('time')) {
    return {
      message: 'Your appointment access time has expired',
      action: 'contact'
    };
  }

  if (error.includes('authentication') || error.includes('auth')) {
    return {
      message: 'Please log in to access appointments',
      action: 'retry'
    };
  }

  return {
    message: error,
    action: 'retry'
  };
}

// Fix: Add React import for the custom hook
