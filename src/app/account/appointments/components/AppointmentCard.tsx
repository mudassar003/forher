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
      <div className="p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center">
        <div className="flex-1">
          <h3 className="font-medium text-gray-800 text-lg mb-2">
            {appointment.treatment_name}
          </h3>
          
          {/* Appointment Status Badges */}
          <div className="mb-3">
            <AppointmentStatusBadges
              qualiphyStatus={appointment.qualiphyExamStatus}
              paymentStatus={appointment.payment_status}
            />
          </div>

          {/* Subscription requirement indicator */}
          {appointment.requires_subscription && (
            <div className="mb-3">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                Requires Subscription
              </span>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex space-x-2 mt-3">
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
                className="px-3 py-1 border border-pink-500 text-pink-500 text-sm rounded hover:bg-pink-50"
              >
                Access Telehealth
              </Link>
            )}
          </div>
        </div>

        {/* Booking Information */}
        <div className="mt-3 sm:mt-0 text-right">
          <p className="text-sm text-gray-600">
            Booked on: {formattedDate}
          </p>
        </div>
      </div>
    </div>
  );
};

export default AppointmentCard;