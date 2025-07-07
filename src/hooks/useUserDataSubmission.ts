// src/hooks/useUserDataSubmission.ts
import { useState, useCallback } from 'react';
import { ContactInfoData } from '@/app/c/wm/lose-weight/types';

interface UserDataSubmissionResult {
  success: boolean;
  message?: string;
  error?: string;
  data?: {
    id: string;
    created_at: string;
  };
}

interface UserDataSubmissionRequest {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  state: string;
  dateOfBirth: string;
}

export function useUserDataSubmission() {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);

  const submitUserData = useCallback(
    async (contactInfo: ContactInfoData): Promise<UserDataSubmissionResult> => {
      if (isLoading) {
        return { success: false, error: 'Submission already in progress' };
      }

      setIsLoading(true);
      setError(null);
      setSuccess(false);

      try {
        // Prepare request data
        const requestData: UserDataSubmissionRequest = {
          firstName: contactInfo.firstName.trim(),
          lastName: contactInfo.lastName.trim(),
          email: contactInfo.email.trim().toLowerCase(),
          phone: contactInfo.phone.trim(),
          state: contactInfo.state.trim(),
          dateOfBirth: contactInfo.dateOfBirth.trim()
        };

        // Validate required fields
        const requiredFields: (keyof UserDataSubmissionRequest)[] = [
          'firstName', 'lastName', 'email', 'phone', 'state', 'dateOfBirth'
        ];

        for (const field of requiredFields) {
          if (!requestData[field]) {
            throw new Error(`${field} is required`);
          }
        }

        // Submit data to API
        const response = await fetch('/api/user-data', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(requestData),
          credentials: 'include'
        });

        const result: UserDataSubmissionResult = await response.json();

        if (!response.ok) {
          throw new Error(result.error || `Request failed with status ${response.status}`);
        }

        if (!result.success) {
          throw new Error(result.error || 'Failed to submit user data');
        }

        setSuccess(true);
        setError(null);

        return result;

      } catch (error: unknown) {
        const errorMessage = error instanceof Error 
          ? error.message 
          : 'An unexpected error occurred while submitting user data';
        
        setError(errorMessage);
        setSuccess(false);

        return { success: false, error: errorMessage };

      } finally {
        setIsLoading(false);
      }
    },
    [isLoading]
  );

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const reset = useCallback(() => {
    setError(null);
    setSuccess(false);
    setIsLoading(false);
  }, []);

  return {
    submitUserData,
    isLoading,
    error,
    success,
    clearError,
    reset
  };
}