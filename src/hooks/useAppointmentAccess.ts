// src/hooks/useAppointmentAccess.ts
// React hook for managing appointment access with permanent lock after time expires

import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuthStore } from '@/store/authStore';
import { AppointmentAccessResponse, AppointmentAccessStatus } from '@/types/subscription';

interface UseAppointmentAccessReturn {
  accessStatus: AppointmentAccessStatus | null;
  isLoading: boolean;
  error: string | null;
  timeRemainingFormatted: string;
  grantAccess: () => Promise<boolean>;
  checkAccess: () => Promise<void>;
  refreshAccess: () => Promise<void>;
}

export const useAppointmentAccess = (): UseAppointmentAccessReturn => {
  const { user, isAuthenticated } = useAuthStore();
  const [accessStatus, setAccessStatus] = useState<AppointmentAccessStatus | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastCheckRef = useRef<number>(0);
  const checkingRef = useRef<boolean>(false);

  // Format time remaining as MM:SS
  const formatTimeRemaining = useCallback((seconds: number): string => {
    if (seconds <= 0) return '00:00';
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  }, []);

  const timeRemainingFormatted = accessStatus ? formatTimeRemaining(accessStatus.timeRemaining) : '00:00';

  // Check appointment access status
  const checkAccess = useCallback(async (): Promise<void> => {
    if (!isAuthenticated || !user?.id || checkingRef.current) {
      if (!isAuthenticated || !user?.id) {
        setAccessStatus(null);
        setIsLoading(false);
      }
      return;
    }

    checkingRef.current = true;
    setIsLoading(true);

    try {
      setError(null);
      
      const response = await fetch('/api/subscriptions/appointment-access', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        cache: 'no-store'
      });

      const data: AppointmentAccessResponse = await response.json();

      if (!response.ok) {
        setAccessStatus(data.data);
        setError(data.message);
      } else if (data.success) {
        setAccessStatus(data.data);
        lastCheckRef.current = Date.now();
      } else {
        setAccessStatus(data.data);
        setError(data.message);
      }
    } catch (err) {
      console.error('Error checking appointment access:', err);
      setError('Failed to check appointment access');
      setAccessStatus(null);
    } finally {
      setIsLoading(false);
      checkingRef.current = false;
    }
  }, [user?.id, isAuthenticated]);

  // Grant appointment access (first time access)
  const grantAccess = useCallback(async (): Promise<boolean> => {
    if (!isAuthenticated || !user?.id) {
      setError('User not authenticated');
      return false;
    }

    try {
      setError(null);
      setIsLoading(true);

      const response = await fetch('/api/subscriptions/appointment-access', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        cache: 'no-store'
      });

      const data: AppointmentAccessResponse = await response.json();

      if (!response.ok) {
        setError(data.message);
        return false;
      }

      if (data.success) {
        // Refresh access status after granting
        await checkAccess();
        return true;
      } else {
        setError(data.message);
        return false;
      }
    } catch (err) {
      console.error('Error granting appointment access:', err);
      setError('Failed to grant appointment access');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [user?.id, isAuthenticated, checkAccess]);

  // Refresh access status
  const refreshAccess = useCallback(async (): Promise<void> => {
    await checkAccess();
  }, [checkAccess]);

  // Handle automatic page refresh when access expires
  useEffect(() => {
    if (accessStatus?.hasAccess && accessStatus.timeRemaining > 0) {
      // Clear any existing interval
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }

      // Update countdown every second
      intervalRef.current = setInterval(() => {
        const now = Date.now();
        const timeSinceLastCheck = Math.floor((now - lastCheckRef.current) / 1000);
        const newTimeRemaining = Math.max(0, accessStatus.timeRemaining - timeSinceLastCheck);

        // Update local state
        setAccessStatus(prev => prev ? {
          ...prev,
          timeRemaining: newTimeRemaining
        } : null);

        // When time expires, refresh the page to force re-authentication
        if (newTimeRemaining <= 0) {
          if (intervalRef.current) {
            clearInterval(intervalRef.current);
          }
          
          // Force page refresh to show expired state
          setTimeout(() => {
            window.location.reload();
          }, 1000);
        }
      }, 1000);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [accessStatus?.hasAccess, accessStatus?.timeRemaining]);

  // Initial access check
  useEffect(() => {
    let mounted = true;
    
    const initializeAccess = async () => {
      if (isAuthenticated && user?.id && mounted) {
        await checkAccess();
      } else if (!isAuthenticated && mounted) {
        setAccessStatus(null);
        setIsLoading(false);
      }
    };

    initializeAccess();

    return () => {
      mounted = false;
    };
  }, [isAuthenticated, user?.id]);

  // Cleanup interval on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      checkingRef.current = false;
    };
  }, []);

  return {
    accessStatus,
    isLoading,
    error,
    timeRemainingFormatted,
    grantAccess,
    checkAccess,
    refreshAccess
  };
};