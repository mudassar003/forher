// src/app/(default)/appointment/page.tsx
import React from 'react';
import DoctorList from '@/components/AppointmentPage/DoctorList';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Book an Appointment | Your Health Journey',
  description: 'Schedule a consultation with one of our healthcare professionals',
};

export default function AppointmentPage() {
  return (
    <main className="min-h-screen bg-white">
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 md:px-8 py-8 sm:py-12">
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-normal text-center mb-8" style={{ color: "#e63946" }}>
          Book Your Appointment
        </h1>
        
        <p className="text-gray-600 text-lg sm:text-xl text-center max-w-3xl mx-auto mb-12">
          Select a healthcare provider below to schedule your personalized consultation and start your journey to better health today.
        </p>
        
        <DoctorList />
      </div>
      
      {/* Wave transition at the bottom of the page */}
      <div className="relative w-full overflow-hidden leading-[0]">
        <svg 
          className="relative block w-full h-16 sm:h-24" 
          viewBox="0 0 1200 120" 
          preserveAspectRatio="none"
        >
          <path 
            d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V120H0V0C15,10.18,36.88,20.62,58.94,31.06,108.88,52.93,163.34,71.36,216,87.57,281.12,107.36,345.66,119.57,411,119.22Z" 
            className="fill-white dark:fill-gray-900"
            style={{
              filter: "drop-shadow(0px -2px 3px rgba(230, 57, 70, 0.1))"
            }}
          ></path>
        </svg>
      </div>
    </main>
  );
}