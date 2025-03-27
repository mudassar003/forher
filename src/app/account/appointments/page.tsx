// src/app/account/appointments/page.tsx
"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useSubscriptionStore, Appointment } from "@/store/subscriptionStore";
import { useAuthStore } from "@/store/authStore";
import AppointmentCard from "./components/AppointmentCard";
import AppointmentDetailsModal from "./components/AppointmentDetailsModal";
import RefreshAppointmentsButton from "./components/RefreshAppointmentsButton";

export default function AppointmentsPage() {
  const { appointments, fetchUserAppointments, loading, error } = useSubscriptionStore();
  const { user } = useAuthStore();
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    if (user?.id) {
      fetchUserAppointments(user.id);
    }
  }, [user, fetchUserAppointments]);

  // Detailed appointment view modal
  const viewAppointmentDetails = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setIsModalOpen(true);
  };

  const closeAppointmentDetails = () => {
    setIsModalOpen(false);
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
          <div className="flex items-center space-x-3">
            <RefreshAppointmentsButton />
            <Link href="/appointments" className="px-4 py-2 bg-pink-500 text-white text-sm rounded-md hover:bg-pink-600 transition-colors">
              Book New Consultation
            </Link>
          </div>
        </div>

        <div className="p-6 space-y-4">
          {appointments.map((appointment) => (
            <AppointmentCard
              key={appointment.id}
              appointment={appointment}
              onViewDetails={viewAppointmentDetails}
            />
          ))}
        </div>
      </div>

      {/* Appointment Details Modal */}
      {isModalOpen && selectedAppointment && (
        <AppointmentDetailsModal
          appointment={selectedAppointment}
          onClose={closeAppointmentDetails}
        />
      )}
    </div>
  );
}