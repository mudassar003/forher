// src/app/account/appointments/components/AppointmentStatusBadges.tsx
"use client";

import { QualiphyExamStatus, PaymentStatus } from '@/types/appointment';

interface StatusBadgesProps {
  qualiphyStatus?: QualiphyExamStatus;
  paymentStatus?: PaymentStatus;
}

export const AppointmentStatusBadges = ({ qualiphyStatus, paymentStatus }: StatusBadgesProps) => {
  // Define color and text mapping for Qualiphy statuses
  const qualiphyStatusMap = {
    'Approved': { 
      color: 'bg-green-100 text-green-800', 
      description: 'Consultation Completed' 
    },
    'Deferred': { 
      color: 'bg-yellow-100 text-yellow-800', 
      description: 'Consultation Pending Review' 
    },
    'Pending': { 
      color: 'bg-blue-100 text-blue-800', 
      description: 'Awaiting Consultation' 
    },
    'N/A': { 
      color: 'bg-gray-100 text-gray-800', 
      description: 'No Consultation' 
    }
  };

  // Define color and text mapping for payment statuses
  const paymentStatusMap = {
    'paid': {
      color: 'bg-green-100 text-green-800',
      description: 'Payment Confirmed'
    },
    'pending': {
      color: 'bg-yellow-100 text-yellow-800',
      description: 'Payment Pending'
    },
    'failed': {
      color: 'bg-red-100 text-red-800',
      description: 'Payment Failed'
    },
    'refunded': {
      color: 'bg-purple-100 text-purple-800',
      description: 'Payment Refunded'
    },
    'cancelled': {
      color: 'bg-gray-100 text-gray-800',
      description: 'Payment Cancelled'
    }
  };

  // Default to Pending if no status or unknown status
  const qualiphyInfo = qualiphyStatus ? 
    qualiphyStatusMap[qualiphyStatus as keyof typeof qualiphyStatusMap] || qualiphyStatusMap['Pending'] 
    : null;
    
  const paymentInfo = paymentStatus ? 
    paymentStatusMap[paymentStatus as keyof typeof paymentStatusMap] || 
    paymentStatusMap['pending'] 
    : null;

  return (
    <div className="flex flex-col space-y-2">
      {paymentInfo && (
        <div className="flex items-center space-x-2">
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${paymentInfo.color}`}>
            Payment: {paymentStatus || 'Pending'}
          </span>
          <span className="text-sm text-gray-600">
            {paymentInfo.description}
          </span>
        </div>
      )}
      
      {qualiphyInfo && (
        <div className="flex items-center space-x-2">
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${qualiphyInfo.color}`}>
            Status: {qualiphyStatus || 'Pending'}
          </span>
          <span className="text-sm text-gray-600">
            {qualiphyInfo.description}
          </span>
        </div>
      )}
    </div>
  );
};

export default AppointmentStatusBadges;