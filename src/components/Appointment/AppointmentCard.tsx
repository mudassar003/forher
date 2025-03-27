// src/app/account/appointments/components/AppointmentCard.tsx
"use client";

import Link from 'next/link';
import { AppointmentStatusBadges } from './AppointmentStatusBadges';
import { Appointment } from '@/store/subscriptionStore';
import { formatDate } from '@/utils/dateUtils';

interface AppointmentCardProps {
  appointment: Appointment;
  onViewDetails: (appointment: Appointment) => void;
}

export const AppointmentCard = ({ appointment, onViewDetails }: AppointmentCardProps) => {
  // Check if user can access the telehealth portal based on appointment status
  const canAccessTelehealth = 
    appointment.payment_status === 'paid' && 
    (appointment.qualiphyExamStatus === 'Pending' || appointment.qualiphyExamStatus === 'Deferred');
  
  // Format the creation date
  const formattedDate = formatDate(appointment.created_at, 'medium');
  
  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition">
      <div className="p-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4">
          <h3 className="font-medium text-gray-800 text-lg mb-2 sm:mb-0">
            {appointment.treatment_name}
          </h3>
          
          <div className="text-sm text-gray-500">
            Booked on: {formattedDate}
          </div>
        </div>
        
        {/* Appointment Status Badges */}
        <div className="mb-4">
          <AppointmentStatusBadges
            qualiphyStatus={appointment.qualiphyExamStatus}
            paymentStatus={appointment.payment_status}
            requiresSubscription={appointment.requires_subscription}
          />
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-2 mt-3">
          <button 
            onClick={() => onViewDetails(appointment)}
            className="px-3 py-1 border border-gray-300 text-gray-700 text-sm rounded hover:bg-gray-50"
          >
            View Details
          </button>
          
          {/* Telehealth Access - only show if they can access */}
          {canAccessTelehealth && (
            <Link 
              href="/appointment"
              className="px-3 py-1 border border-pink-500 text-pink-500 text-sm rounded hover:bg-pink-50 inline-flex items-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              Access Telehealth
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};

export default AppointmentCard;