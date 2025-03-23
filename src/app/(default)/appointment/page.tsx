// src/app/(default)/appointment/page.tsx
import React from 'react';
import QualiphyWidget from '@/components/QualiphyWidget';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Book an Appointment | Your Health Journey',
  description: 'Schedule a consultation with one of our healthcare professionals',
};

export default function AppointmentPage() {
  return (
    <main className="min-h-screen bg-white">
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 md:px-8 py-8 sm:py-12">
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-normal text-center mb-4" style={{ color: "#e63946" }}>
          Book Your Appointment
        </h1>
        
        <p className="text-gray-600 text-lg sm:text-xl text-center max-w-3xl mx-auto mb-8">
          Complete your initial assessment online and start your journey to better health today.
        </p>
        
        {/* Enhanced call-to-action section */}
        <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl shadow-lg p-8 mb-16 text-center">
          <h2 className="text-2xl sm:text-3xl font-semibold mb-4" style={{ color: "#e63946" }}>
            Begin Your Online Health Assessment
          </h2>
          
          <p className="text-gray-700 text-lg max-w-2xl mx-auto mb-8">
            Our secure online assessment takes just a few minutes to complete. After submission, 
            one of our healthcare providers will review your information and contact you to schedule your appointment.
          </p>
          
          {/* Features list */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
            <div className="bg-white p-5 rounded-lg shadow">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium mb-2">Quick & Convenient</h3>
              <p className="text-gray-600">Complete your assessment anytime, anywhere - no waiting rooms.</p>
            </div>
            
            <div className="bg-white p-5 rounded-lg shadow">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium mb-2">Secure & Private</h3>
              <p className="text-gray-600">Your information is protected with healthcare-grade security.</p>
            </div>
            
            <div className="bg-white p-5 rounded-lg shadow">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <h3 className="text-lg font-medium mb-2">Personalized Care</h3>
              <p className="text-gray-600">Get treatment options tailored to your specific needs.</p>
            </div>
          </div>
          
          {/* Prominent Qualiphy Widget button */}
          <div className="flex justify-center">
            <QualiphyWidget buttonText="Start Your Health Assessment" />
          </div>
        </div>
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