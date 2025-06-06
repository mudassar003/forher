// src/components/AppointmentAccessGuard.tsx
// Guard component that wraps the appointment page and manages access control

'use client';

import React, { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useAppointmentAccess } from '@/hooks/useAppointmentAccess';
import { Loader2, Clock, AlertCircle, CheckCircle, XCircle } from 'lucide-react';

interface AppointmentAccessGuardProps {
  children: React.ReactNode;
}

interface AccessGrantModalProps {
  isOpen: boolean;
  onGrant: () => Promise<void>;
  onCancel: () => void;
  isGranting: boolean;
}

const AccessGrantModal: React.FC<AccessGrantModalProps> = ({
  isOpen,
  onGrant,
  onCancel,
  isGranting
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <div className="flex items-center mb-4">
          <CheckCircle className="w-6 h-6 text-green-500 mr-2" />
          <h2 className="text-xl font-semibold">Grant Appointment Access</h2>
        </div>
        
        <div className="mb-6">
          <p className="text-gray-700 mb-3">
            You are about to access the appointment booking page. Please note:
          </p>
          <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
            <li>You will have <strong>10 minutes</strong> of access</li>
            <li>After the time expires, access will be <strong>permanently locked</strong></li>
            <li>You will need to contact support for additional access</li>
            <li>Use this time wisely to complete your appointment booking</li>
          </ul>
        </div>

        <div className="flex justify-end space-x-3">
          <button
            onClick={onCancel}
            disabled={isGranting}
            className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={onGrant}
            disabled={isGranting}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 flex items-center"
          >
            {isGranting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            {isGranting ? 'Granting...' : 'Start Access'}
          </button>
        </div>
      </div>
    </div>
  );
};

const AppointmentAccessGuard: React.FC<AppointmentAccessGuardProps> = ({ children }) => {
  const { data: session, status: sessionStatus } = useSession();
  const router = useRouter();
  const {
    accessStatus,
    isLoading,
    error,
    timeRemainingFormatted,
    grantAccess
  } = useAppointmentAccess();
  
  const [showGrantModal, setShowGrantModal] = useState<boolean>(false);
  const [isGranting, setIsGranting] = useState<boolean>(false);

  // Redirect if not authenticated
  useEffect(() => {
    if (sessionStatus === 'unauthenticated') {
      router.push('/auth/signin?callbackUrl=/appointment');
    }
  }, [sessionStatus, router]);

  // Handle granting access
  const handleGrantAccess = async (): Promise<void> => {
    setIsGranting(true);
    try {
      const success = await grantAccess();
      if (success) {
        setShowGrantModal(false);
      }
    } catch (err) {
      console.error('Error granting access:', err);
    } finally {
      setIsGranting(false);
    }
  };

  // Show loading state
  if (sessionStatus === 'loading' || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Checking appointment access...</p>
        </div>
      </div>
    );
  }

  // Show authentication required
  if (sessionStatus === 'unauthenticated') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
          <h1 className="text-2xl font-semibold mb-2">Authentication Required</h1>
          <p className="text-gray-600">Redirecting to sign in...</p>
        </div>
      </div>
    );
  }

  // Show error state
  if (error && !accessStatus) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md">
          <XCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-semibold mb-2">Access Error</h1>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // No active subscription
  if (!accessStatus) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md">
          <AlertCircle className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
          <h1 className="text-2xl font-semibold mb-2">Subscription Required</h1>
          <p className="text-gray-600 mb-4">
            You need an active subscription to access the appointment booking page.
          </p>
          <button
            onClick={() => router.push('/pricing')}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            View Pricing
          </button>
        </div>
      </div>
    );
  }

  // Access expired - permanent lock
  if (accessStatus.isExpired && accessStatus.needsSupportContact) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md">
          <XCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-semibold mb-2">Access Expired</h1>
          <p className="text-gray-600 mb-4">
            Your appointment access has permanently expired. Please contact our support team for additional access.
          </p>
          <div className="space-y-2">
            <button
              onClick={() => router.push('/support')}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Contact Support
            </button>
            <button
              onClick={() => router.push('/dashboard')}
              className="w-full px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  // First time access - show grant modal
  if (accessStatus.isFirstAccess) {
    return (
      <>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center max-w-md">
            <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
            <h1 className="text-2xl font-semibold mb-2">Appointment Access Available</h1>
            <p className="text-gray-600 mb-6">
              You can now access the appointment booking page. Click below to start your timed access.
            </p>
            <button
              onClick={() => setShowGrantModal(true)}
              className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-medium"
            >
              Start Appointment Access
            </button>
          </div>
        </div>
        
        <AccessGrantModal
          isOpen={showGrantModal}
          onGrant={handleGrantAccess}
          onCancel={() => setShowGrantModal(false)}
          isGranting={isGranting}
        />
      </>
    );
  }

  // Active access - show children with timer
  if (accessStatus.hasAccess && !accessStatus.isExpired) {
    return (
      <div className="min-h-screen">
        {/* Timer bar at top */}
        <div className="bg-blue-600 text-white p-3 sticky top-0 z-40">
          <div className="container mx-auto flex items-center justify-between">
            <div className="flex items-center">
              <Clock className="w-5 h-5 mr-2" />
              <span className="font-medium">Appointment Access Active</span>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm">Time Remaining:</span>
              <span className="font-mono text-lg font-bold">{timeRemainingFormatted}</span>
            </div>
          </div>
        </div>

        {/* Main content - Qualiphy widget will be rendered here */}
        <div className="relative">
          {children}
        </div>

        {/* Warning when less than 2 minutes remain */}
        {accessStatus.timeRemaining <= 120 && accessStatus.timeRemaining > 0 && (
          <div className="fixed bottom-4 right-4 bg-yellow-500 text-white p-4 rounded-lg shadow-lg z-50">
            <div className="flex items-center">
              <AlertCircle className="w-5 h-5 mr-2" />
              <div>
                <p className="font-semibold">Time Almost Up!</p>
                <p className="text-sm">Complete your booking now</p>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Fallback - should not reach here
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
        <p className="text-gray-600">Loading...</p>
      </div>
    </div>
  );
};

export default AppointmentAccessGuard;