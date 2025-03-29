// src/app/(default)/subscriptions/components/BenefitsSection.tsx
import React from 'react';

const BenefitsSection: React.FC = () => {
  return (
    <div className="bg-white shadow-sm rounded-lg overflow-hidden mb-12">
      <div className="px-6 py-8">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Why Subscribe?</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="flex">
            <div className="flex-shrink-0 h-10 w-10 rounded-full bg-pink-100 flex items-center justify-center mr-3">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-pink-500">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-8-6h16" />
              </svg>
            </div>
            <div>
              <h3 className="text-base font-medium text-gray-800 mb-1">Save 15%</h3>
              <p className="text-sm text-gray-600">Subscribers save 15% on all treatments and products</p>
            </div>
          </div>
          
          <div className="flex">
            <div className="flex-shrink-0 h-10 w-10 rounded-full bg-pink-100 flex items-center justify-center mr-3">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-pink-500">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
              </svg>
            </div>
            <div>
              <h3 className="text-base font-medium text-gray-800 mb-1">Priority Appointments</h3>
              <p className="text-sm text-gray-600">Get priority scheduling for telehealth consultations</p>
            </div>
          </div>
          
          <div className="flex">
            <div className="flex-shrink-0 h-10 w-10 rounded-full bg-pink-100 flex items-center justify-center mr-3">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-pink-500">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
              </svg>
            </div>
            <div>
              <h3 className="text-base font-medium text-gray-800 mb-1">Personalized Care</h3>
              <p className="text-sm text-gray-600">Receive customized wellness plans and recommendations</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BenefitsSection;