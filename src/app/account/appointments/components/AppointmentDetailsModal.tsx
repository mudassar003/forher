// src/app/account/appointments/components/AppointmentDetailsModal.tsx
"use client";

import { AppointmentStatusBadges } from './AppointmentStatusBadges';
import { Appointment } from '@/store/subscriptionStore';
import { formatDate } from '@/utils/dateUtils';
import Link from 'next/link';

interface AppointmentDetailsModalProps {
  appointment: Appointment;
  onClose: () => void;
}

export const AppointmentDetailsModal = ({ appointment, onClose }: AppointmentDetailsModalProps) => {
  // Check if user can access the telehealth portal based on payment status and exam status
  // Only N/A status is valid for access
  const canAccessTelehealth = 
    appointment.payment_status === 'paid' && 
    appointment.qualiphyExamStatus === 'N/A';
  
  // Format the creation date
  const formattedDate = formatDate(appointment.created_at, 'long');
  const formattedAppointmentDate = appointment.appointment_date 
    ? formatDate(appointment.appointment_date, 'full') 
    : null;

  // Create a description of the current consultation status based on Qualiphy status
  const getConsultationStateMessage = (): { title: string; description: string } => {
    if (appointment.payment_status !== 'paid') {
      return { 
        title: 'Payment Required', 
        description: 'Complete payment to access your consultation.'
      };
    }
    
    switch (appointment.qualiphyExamStatus) {
      case 'Approved':
        return { 
          title: 'Consultation Completed', 
          description: 'Your consultation has been completed and approved by the provider.' 
        };
      case 'Deferred':
        return { 
          title: 'Consultation Under Review', 
          description: 'Your consultation is currently under review by our medical team. Telehealth access is no longer available.' 
        };
      case 'Pending':
        return { 
          title: 'Processing Consultation', 
          description: 'Your consultation is being processed. Telehealth access is no longer available.' 
        };
      case 'N/A':
        return { 
          title: 'Ready for Consultation', 
          description: 'Your appointment is ready. You can access the telehealth portal to begin your consultation.' 
        };
      default:
        return { 
          title: 'Status Unknown', 
          description: 'The status of your consultation is currently unknown.' 
        };
    }
  };

  const consultationState = getConsultationStateMessage();
  
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
            <div className="mb-6">
              <h4 className="text-xl font-semibold text-gray-800">{appointment.treatment_name}</h4>
              <p className="text-gray-600 mt-1">
                Booked on: {formattedDate}
              </p>
            </div>

            {/* Consultation Status Summary */}
            <div className="mb-6 p-4 rounded-lg border border-gray-200 bg-gray-50">
              <h5 className="font-medium text-gray-800 mb-3">{consultationState.title}</h5>
              <p className="text-gray-600 mb-4">{consultationState.description}</p>
              
              {/* Status badges */}
              <div className="mt-4">
                <AppointmentStatusBadges 
                  qualiphyStatus={appointment.qualiphyExamStatus} 
                  paymentStatus={appointment.payment_status}
                  appointmentStatus={appointment.status}
                  requiresSubscription={appointment.requires_subscription}
                />
              </div>
            </div>
            
            {/* Additional appointment details */}
            <div className="mb-6">
              <h5 className="font-medium text-gray-800 mb-2">Appointment Information</h5>
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {formattedAppointmentDate && (
                    <div>
                      <span className="text-sm text-gray-500">Scheduled for:</span>
                      <p className="font-medium">{formattedAppointmentDate}</p>
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
                  
                  {appointment.requires_subscription !== undefined && (
                    <div>
                      <span className="text-sm text-gray-500">Subscription requirement:</span>
                      <p className="font-medium">{appointment.requires_subscription ? 'Required' : 'Not required'}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            {/* Payment details if available */}
            {appointment.payment_status && (
              <div className="mb-6">
                <h5 className="font-medium text-gray-800 mb-2">Payment Information</h5>
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <span className="text-sm text-gray-500">Payment Status:</span>
                      <p className="font-medium capitalize">{appointment.payment_status}</p>
                    </div>
                    
                    {appointment.payment_method && (
                      <div>
                        <span className="text-sm text-gray-500">Payment Method:</span>
                        <p className="font-medium capitalize">{appointment.payment_method === 'stripe' ? 'Credit Card (Stripe)' : appointment.payment_method}</p>
                      </div>
                    )}
                    
                    {appointment.stripe_payment_intent_id && (
                      <div className="col-span-2">
                        <span className="text-sm text-gray-500">Payment ID:</span>
                        <p className="font-medium text-xs break-all">{appointment.stripe_payment_intent_id}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
            
            {appointment.notes && (
              <div className="mb-6">
                <h5 className="font-medium text-gray-800 mb-2">Consultation Notes</h5>
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                  <p className="text-gray-600 whitespace-pre-line">{appointment.notes}</p>
                </div>
              </div>
            )}
            
            {/* Telehealth Access Section */}
            {canAccessTelehealth && (
              <div className="mt-6 bg-blue-50 p-4 rounded-lg border border-blue-200">
                <h5 className="font-medium text-blue-800 mb-2">Telehealth Access</h5>
                <p className="text-blue-700 mb-4">Your appointment is ready for telehealth consultation.</p>
                
                {appointment.qualiphyMeetingUrl ? (
                  <a 
                    href={appointment.qualiphyMeetingUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="w-full inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                    Join Consultation
                  </a>
                ) : (
                  <Link
                    href="/appointment" 
                    className="w-full inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                    Access Telehealth Portal
                  </Link>
                )}
              </div>
            )}
          </div>
          
          <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex justify-between">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 text-gray-700 font-medium rounded-md hover:bg-gray-50"
            >
              Close
            </button>
            
            {canAccessTelehealth && (
              <Link 
                href="/appointment"
                className="px-4 py-2 bg-pink-500 text-white font-medium rounded-md hover:bg-pink-600 inline-flex items-center"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                Go to Telehealth
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AppointmentDetailsModal;