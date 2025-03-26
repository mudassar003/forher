//src/app/account/appointments/page.tsx
"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useSubscriptionStore } from "@/store/subscriptionStore";
import { useAuthStore } from "@/store/authStore";

// Status badge component with Qualiphy-specific styling
const StatusBadge = ({ qualiphyStatus }: { qualiphyStatus?: string }) => {
  // Define color and text mapping for Qualiphy statuses
  const statusMap = {
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

  // Default to Pending if no status or unknown status
  const statusInfo = statusMap[qualiphyStatus] || statusMap['Pending'];

  return (
    <div className="flex items-center space-x-2">
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusInfo.color}`}>
        {qualiphyStatus || 'Pending'}
      </span>
      <span className="text-sm text-gray-600">
        {statusInfo.description}
      </span>
    </div>
  );
};

export default function AppointmentsPage() {
  const { appointments, fetchUserAppointments, loading, error } = useSubscriptionStore();
  const { user } = useAuthStore();
  const [selectedAppointment, setSelectedAppointment] = useState(null);

  useEffect(() => {
    if (user?.id) {
      fetchUserAppointments(user.id);
    }
  }, [user, fetchUserAppointments]);

  // Detailed appointment view modal
  const viewAppointmentDetails = (appointment) => {
    setSelectedAppointment(appointment);
    document.getElementById("appointmentDetailsModal")?.classList.remove("hidden");
  };

  const closeAppointmentDetails = () => {
    document.getElementById("appointmentDetailsModal")?.classList.add("hidden");
    setSelectedAppointment(null);
  };

  // Render loading state
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-pink-500"></div>
      </div>
    );
  }

  // Render error state
  if (error) {
    return (
      <div className="p-6 text-center">
        <div className="text-red-500 mb-4">Error loading appointments: {error}</div>
        <button
          onClick={() => user?.id && fetchUserAppointments(user.id)}
          className="px-4 py-2 bg-pink-500 text-white rounded-md hover:bg-pink-600"
        >
          Try Again
        </button>
      </div>
    );
  }

  // No appointments view
  if (appointments.length === 0) {
    return (
      <div className="p-6 flex flex-col items-center justify-center text-center">
        <div className="w-16 h-16 bg-pink-100 rounded-full flex items-center justify-center mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 text-pink-500">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-800 mb-2">No Appointments</h3>
        <p className="text-gray-600 mb-6">You haven't booked any consultations yet.</p>
        <Link href="/appointments" className="px-4 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition-colors">
          Book an Appointment
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white shadow rounded-lg overflow-hidden border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
          <h2 className="text-lg font-semibold text-gray-800">Your Consultations</h2>
          <Link href="/appointments" className="px-4 py-2 bg-pink-500 text-white text-sm rounded-md hover:bg-pink-600 transition-colors">
            Book New Consultation
          </Link>
        </div>

        <div className="p-6 space-y-4">
          {appointments.map((appointment) => (
            <div key={appointment.id} className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition">
              <div className="p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center">
                <div className="flex-1">
                  <h3 className="font-medium text-gray-800 text-lg mb-2">
                    {appointment.treatment_name}
                  </h3>
                  
                  {/* Qualiphy Status Display */}
                  <div className="mb-3">
                    <StatusBadge 
                      qualiphyStatus={appointment.qualiphyExamStatus || 'Pending'} 
                    />
                  </div>

                  {/* Action Buttons */}
                  <div className="flex space-x-2 mt-3">
                    <button 
                      onClick={() => viewAppointmentDetails(appointment)}
                      className="px-3 py-1 border border-gray-300 text-gray-700 text-sm rounded hover:bg-gray-50"
                    >
                      View Details
                    </button>
                    
                    {/* Telehealth Access */}
                    <Link 
                      href="/appointment"
                      className="px-3 py-1 border border-pink-500 text-pink-500 text-sm rounded hover:bg-pink-50"
                    >
                      Access Telehealth
                    </Link>
                  </div>
                </div>

                {/* Booking Information */}
                <div className="mt-3 sm:mt-0 text-right">
                  <p className="text-sm text-gray-600">
                    Booked on: {new Date(appointment.created_at).toLocaleDateString()}
                  </p>
                  {appointment.qualiphyProviderName && (
                    <p className="text-sm text-gray-500 mt-1">
                      Provider: {appointment.qualiphyProviderName}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Appointment Details Modal - Similar to previous implementation */}
      {/* ... (keep the existing modal code) */}
    </div>
  );
}