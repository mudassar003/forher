// src/app/account/appointments/components/AppointmentDetailsModal.tsx
"use client";

import { AppointmentStatusBadges } from './AppointmentStatusBadges';
import { Appointment } from '@/store/subscriptionStore';
import { formatDate } from '@/utils/dateUtils';

interface AppointmentDetailsModalProps {
  appointment: Appointment;
  onClose: () => void;
}

export const AppointmentDetailsModal = ({ appointment, onClose }: AppointmentDetailsModalProps) => {
  // Check if user can access the telehealth portal based on appointment status
  const canAccessTelehealth = 
    appointment.payment_status === 'paid' && 
    (appointment.qualiphyExamStatus === 'Pending' || appointment.qualiphyExamStatus === 'Deferred');
  
  // Format the creation date
  const formattedDate = formatDate(appointment.created_at, 'long');
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen p-4">
        <div className="bg-white rounded-lg shadow-lg w-full max-w-2xl overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center bg-gray-50">
            <h3 className="text-lg font-semibold text-gray-800">
              Appointment Details
            </h3>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          <div className="p-6">
            <div className="mb-4">
              <h4 className="text-xl font-semibold text-gray-800">{appointment.treatment_name}</h4>
              <p className="text-gray-600 mt-1">
                Booked on: {formattedDate}
              </p>
            </div>
            
            <div className="mb-4">
              <h5 className="font-medium text-gray-800 mb-2">Status</h5>
              <AppointmentStatusBadges 
                qualiphyStatus={appointment.qualiphyExamStatus} 
                paymentStatus={appointment.payment_status}
              />
            </div>
            
            {/* Additional appointment details */}
            <div className="mt-4 bg-gray-50 p-4 rounded-lg mb-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {appointment.appointment_date && (
                  <div>
                    <span className="text-sm text-gray-500">Scheduled for:</span>
                    <p className="font-medium">{formatDate(appointment.appointment_date, 'full')}</p>
                  </div>
                )}
                
                {appointment.qualiphyProviderName && (
                  <div>
                    <span className="text-sm text-gray-500">Provider:</span>
                    <p className="font-medium">{appointment.qualiphyProviderName}</p>
                  </div>
                )}
                
                {appointment.qualiphyPatientExamId && (
                  <div>
                    <span className="text-sm text-gray-500">Exam ID:</span>
                    <p className="font-medium">{appointment.qualiphyPatientExamId}</p>
                  </div>
                )}
                
                {appointment.requires_subscription && (
                  <div>
                    <span className="text-sm text-gray-500">Subscription requirement:</span>
                    <p className="font-medium">Active subscription required</p>
                  </div>
                )}
              </div>
            </div>
            
            {appointment.notes && (
              <div className="mb-4">
                <h5 className="font-medium text-gray-800 mb-2">Notes</h5>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-gray-600 whitespace-pre-line">{appointment.notes}</p>
                </div>
              </div>
            )}
            
            {canAccessTelehealth && appointment.qualiphyMeetingUrl && (
              <div className="mt-6">
                <a 
                  href={appointment.qualiphyMeetingUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-full inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-pink-600 hover:bg-pink-700"
                >
                  Join Consultation
                </a>
              </div>
            )}
            
            {canAccessTelehealth && !appointment.qualiphyMeetingUrl && (
              <div className="mt-6">
                <a 
                  href="/appointment" 
                  className="w-full inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-pink-600 hover:bg-pink-700"
                >
                  Access Telehealth Portal
                </a>
              </div>
            )}
          </div>
          
          <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 text-gray-700 font-medium rounded-md hover:bg-gray-50"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AppointmentDetailsModal;