// src/components/AppointmentFormSuccess.tsx
'use client';

import React from 'react';

interface AppointmentFormSuccessProps {
  meetingUrl?: string;
}

const AppointmentFormSuccess: React.FC<AppointmentFormSuccessProps> = ({ meetingUrl }) => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-lg w-full mx-auto p-8 bg-white rounded-xl shadow-lg">
        <div className="text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
            </svg>
          </div>
          
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Consultation Already Scheduled
          </h2>
          
          <p className="text-gray-600 mb-6">
            You have successfully submitted your consultation request. Only one submission is allowed per account.
          </p>

          {/* Show meeting URL if available */}
          {meetingUrl ? (
            <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-6">
              <h3 className="text-lg font-semibold text-green-800 mb-3">
                Your Meeting Details
              </h3>
              <p className="text-green-700 mb-4">
                Click the link below to join your consultation:
              </p>
              <a 
                href={meetingUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-semibold"
              >
                🔗 Join Your Meeting
              </a>
            </div>
          ) : (
            /* Show generic message if no meeting URL */
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
              <h3 className="text-lg font-semibold text-blue-800 mb-3">
                Appointment Confirmed
              </h3>
              <p className="text-blue-700">
                Your consultation has been scheduled. You will receive meeting details via email shortly.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AppointmentFormSuccess;