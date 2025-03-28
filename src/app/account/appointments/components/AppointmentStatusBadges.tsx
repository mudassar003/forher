// src/app/account/appointments/components/AppointmentStatusBadges.tsx
"use client";

import { QualiphyExamStatus, PaymentStatus, AppointmentStatus } from '@/types/appointment';

interface StatusBadgesProps {
  qualiphyStatus?: QualiphyExamStatus;
  paymentStatus?: PaymentStatus;
  appointmentStatus?: AppointmentStatus;
  requiresSubscription?: boolean;
}

export const AppointmentStatusBadges = ({ 
  qualiphyStatus, 
  paymentStatus,
  appointmentStatus,
  requiresSubscription
}: StatusBadgesProps) => {
  // Define color and text mapping for Qualiphy statuses
  const qualiphyStatusMap = {
    'Approved': { 
      color: 'bg-green-100 text-green-800 border border-green-200', 
      description: 'Consultation Completed' 
    },
    'Deferred': { 
      color: 'bg-yellow-100 text-yellow-800 border border-yellow-200', 
      description: 'Consultation Pending Review' 
    },
    'Pending': { 
      color: 'bg-blue-100 text-blue-800 border border-blue-200', 
      description: 'Awaiting Consultation' 
    },
    'N/A': { 
      color: 'bg-blue-100 text-blue-800 border border-blue-200', 
      description: 'Ready to Begin Consultation' 
    }
  };

  // Define color and text mapping for payment statuses
  const paymentStatusMap = {
    'paid': {
      color: 'bg-green-100 text-green-800 border border-green-200',
      description: 'Payment Confirmed'
    },
    'pending': {
      color: 'bg-yellow-100 text-yellow-800 border border-yellow-200',
      description: 'Payment Pending'
    },
    'failed': {
      color: 'bg-red-100 text-red-800 border border-red-200',
      description: 'Payment Failed'
    },
    'refunded': {
      color: 'bg-purple-100 text-purple-800 border border-purple-200',
      description: 'Payment Refunded'
    },
    'cancelled': {
      color: 'bg-gray-100 text-gray-800 border border-gray-200',
      description: 'Payment Cancelled'
    }
  };

  // Define color and text mapping for appointment statuses
  const appointmentStatusMap = {
    'pending': {
      color: 'bg-yellow-100 text-yellow-800 border border-yellow-200',
      description: 'Pending Setup'
    },
    'scheduled': {
      color: 'bg-blue-100 text-blue-800 border border-blue-200',
      description: 'Scheduled'
    },
    'confirmed': {
      color: 'bg-indigo-100 text-indigo-800 border border-indigo-200',
      description: 'Confirmed'
    },
    'completed': {
      color: 'bg-green-100 text-green-800 border border-green-200',
      description: 'Completed'
    },
    'cancelled': {
      color: 'bg-gray-100 text-gray-800 border border-gray-200',
      description: 'Cancelled'
    },
    'rescheduled': {
      color: 'bg-purple-100 text-purple-800 border border-purple-200',
      description: 'Rescheduled'
    },
    'no-show': {
      color: 'bg-red-100 text-red-800 border border-red-200',
      description: 'No Show'
    }
  };

  // Default to Pending if no status or unknown status
  const qualiphyInfo = qualiphyStatus ? 
    qualiphyStatusMap[qualiphyStatus as keyof typeof qualiphyStatusMap] || qualiphyStatusMap['Pending'] 
    : { color: 'bg-gray-100 text-gray-800 border border-gray-200', description: 'Not Started' };
    
  const paymentInfo = paymentStatus ? 
    paymentStatusMap[paymentStatus as keyof typeof paymentStatusMap] || 
    paymentStatusMap['pending'] 
    : null;

  const appointmentInfo = appointmentStatus ?
    appointmentStatusMap[appointmentStatus as keyof typeof appointmentStatusMap] ||
    appointmentStatusMap['pending']
    : null;

  return (
    <div className="flex flex-col space-y-2">
      {/* Payment Status */}
      {paymentInfo && (
        <div className="flex items-center space-x-2">
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium ${paymentInfo.color}`}>
            Payment: {paymentStatus || 'Pending'}
          </span>
          <span className="text-sm text-gray-600">
            {paymentInfo.description}
          </span>
        </div>
      )}
      
      {/* Qualiphy Status */}
      <div className="flex items-center space-x-2">
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium ${qualiphyInfo.color}`}>
          Consultation: {qualiphyStatus || 'Not Started'}
        </span>
        <span className="text-sm text-gray-600">
          {qualiphyInfo.description}
        </span>
      </div>

      {/* Subscription Requirement */}
      {requiresSubscription && (
        <div className="flex items-center space-x-2">
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-indigo-100 text-indigo-800 border border-indigo-200">
            Subscription Required
          </span>
        </div>
      )}
    </div>
  );
};

export default AppointmentStatusBadges;