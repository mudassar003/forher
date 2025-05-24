// src/app/(default)/about/page.tsx
'use client';

import React, { useState } from 'react';
import PageHeader from '@/components/PageHeader';

// Define proper interfaces for our component props
interface FeatureCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
}

// Interface for contact information
interface ContactInfo {
  email: string;
  phone: string;
  address: string;
}

// Enhanced Feature Card Component with gradient and animations
const FeatureCard: React.FC<FeatureCardProps> = ({ title, description, icon }) => (
      <div className="group relative bg-white rounded-2xl shadow-lg p-8 transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 border border-gray-100">
    {/* Gradient overlay on hover */}
    <div className="absolute inset-0 bg-gradient-to-br from-red-50 to-red-50 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
    
    <div className="relative z-10">
      <div className="flex items-center justify-center h-16 w-16 rounded-xl bg-gradient-to-br from-[#E63946] to-red-600 text-white mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300">
        {icon}
      </div>
      <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-[#E63946] transition-colors duration-300">{title}</h3>
      <p className="text-gray-600 leading-relaxed">{description}</p>
    </div>
  </div>
);

// Collapsible Contact Info Component with enhanced styling
const CollapsibleContactInfo: React.FC = () => {
  const [isExpanded, setIsExpanded] = useState<boolean>(false);

  const contactInfo: ContactInfo = {
    email: 'contact@qualiphy.me',
    phone: '+1 (424) 257-3977',
    address: '13 N San Vicente Blvd, Beverly Hills, CA 90211'
  };

  const toggleExpanded = (): void => {
    setIsExpanded(prev => !prev);
  };

  return (
    <div className="mt-12 bg-gradient-to-r from-red-25 to-red-25 rounded-lg border border-red-100 overflow-hidden shadow-sm">
      {/* Header Button */}
      <button
        onClick={toggleExpanded}
        className="w-full p-3 text-left focus:outline-none focus:ring-1 focus:ring-[#E63946] focus:ring-inset transition-all duration-200 hover:bg-white/30"
        aria-expanded={isExpanded}
        aria-controls="contact-info-content"
      >
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-light text-gray-500 flex items-center opacity-60">
            <span className="h-1 w-1 bg-[#E63946] rounded-full mr-2"></span>
            Qualiphy Contact Information
          </h3>
          <svg
            className={`h-3 w-3 text-[#E63946] transition-transform duration-300 opacity-60 ${
              isExpanded ? 'rotate-180' : 'rotate-0'
            }`}
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            aria-hidden="true"
          >
            <path
              fillRule="evenodd"
              d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
              clipRule="evenodd"
            />
          </svg>
        </div>
      </button>

      {/* Collapsible Content */}
      <div
        id="contact-info-content"
        className={`transition-all duration-500 ease-in-out ${
          isExpanded ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
        } overflow-hidden`}
      >
        <div className="px-4 pb-4 space-y-2 bg-white/20 backdrop-blur-sm">
          <div className="flex flex-col sm:flex-row sm:items-center p-2 bg-white/40 rounded text-xs">
            <span className="font-medium text-gray-600 min-w-[60px] flex items-center">
              <svg className="h-3 w-3 mr-1 text-[#E63946]" fill="currentColor" viewBox="0 0 20 20">
                <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z"/>
                <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z"/>
              </svg>
              Email:
            </span>
            <a
              href={`mailto:${contactInfo.email}`}
              className="text-[#E63946] hover:text-red-700 transition-colors underline text-xs"
            >
              {contactInfo.email}
            </a>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center p-2 bg-white/40 rounded text-xs">
            <span className="font-medium text-gray-600 min-w-[60px] flex items-center">
              <svg className="h-3 w-3 mr-1 text-[#E63946]" fill="currentColor" viewBox="0 0 20 20">
                <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z"/>
              </svg>
              Phone:
            </span>
            <a
              href={`tel:${contactInfo.phone}`}
              className="text-[#E63946] hover:text-red-700 transition-colors underline text-xs"
            >
              {contactInfo.phone}
            </a>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-start p-2 bg-white/40 rounded text-xs">
            <span className="font-medium text-gray-600 min-w-[60px] flex items-center">
              <svg className="h-3 w-3 mr-1 text-[#E63946]" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd"/>
              </svg>
              Address:
            </span>
            <span className="text-gray-600 text-xs">{contactInfo.address}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function AboutPage(): React.ReactElement {
  // Define feature content with enhanced icons
  const features: FeatureCardProps[] = [
    {
      title: "Medical Expertise",
      description: "Our treatments are backed by science and prescribed by licensed healthcare providers who specialize in women's health.",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      )
    },
    {
      title: "Personalized Plans",
      description: "Every individual's health journey is different—we create a strategy tailored to your body and goals for optimal results.",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      )
    },
    {
      title: "Convenience & Accessibility",
      description: "With our telehealth platform, you can access effective health solutions from the comfort of your home, on your schedule.",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
        </svg>
      )
    }
  ];

  return (
    <main className="bg-white">

      
      {/* Mission Section with enhanced design */}
      <div className="py-20 bg-white overflow-hidden relative">
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ec4899' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}></div>
        </div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          {/* Section header */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center justify-center p-2 bg-red-100 rounded-full mb-4">
              <div className="flex items-center justify-center h-8 w-8 bg-[#E63946] rounded-full">
                <svg className="h-4 w-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd"/>
                </svg>
              </div>
            </div>
            <h2 className="text-4xl font-bold text-gray-900 sm:text-5xl mb-4">
              Our <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#E63946] to-red-600">Mission</span>
            </h2>
            <div className="w-24 h-1 bg-gradient-to-r from-[#E63946] to-red-600 mx-auto rounded-full"></div>
          </div>

          {/* Mission content */}
          <div className="space-y-8">
            <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
              <p className="text-lg text-gray-700 leading-relaxed mb-6">
                At Lily's, we're on a mission to make medically guided weight loss simple, supportive, and accessible for every woman.
              </p>
              
              <p className="text-lg text-gray-700 leading-relaxed mb-6">
                We understand that lasting change starts with trusted support, which is why we've built an easy-to-use platform that connects women with licensed doctors through secure telehealth consultations. While Lily's doesn't provide medical care directly, we work hand-in-hand with <strong className="text-[#E63946]">Qualiphy</strong>, a reputable telehealth provider, to ensure you receive expert care tailored to your goals.
              </p>
              
              <p className="text-lg text-gray-700 leading-relaxed mb-6">
                Our focus is on <strong className="text-red-600">clinically backed weight loss solutions</strong>, including prescriptions like GLP-1 medications (such as semaglutide or tirzepatide), all prescribed by licensed professionals when appropriate. Through our website, you can explore your options, complete an intake, and get connected to the care you need—all from the comfort of home.
              </p>
              
              <p className="text-lg text-gray-700 leading-relaxed mb-8">
                We're here to guide you every step of the way, from discovery to results. At Lily's, you're not just starting a program—you're beginning a journey with the right support behind you.
              </p>
              
              {/* Collapsible Contact Information */}
              <CollapsibleContactInfo />
            </div>
          </div>
        </div>
      </div>

      {/* Why Choose Us Section with enhanced styling */}
      <div className="py-20 bg-gradient-to-br from-gray-50 to-red-50 relative overflow-hidden">
        {/* Background decorations */}
        <div className="absolute top-0 left-0 w-full h-full">
          <div className="absolute top-10 left-1/4 w-4 h-4 bg-red-300 rounded-full opacity-30 animate-bounce"></div>
          <div className="absolute bottom-10 right-1/4 w-6 h-6 bg-red-300 rounded-full opacity-30 animate-bounce delay-500"></div>
          <div className="absolute top-1/2 left-10 w-3 h-3 bg-red-400 rounded-full opacity-40 animate-pulse"></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center mb-16">
            <div className="inline-flex items-center justify-center p-2 bg-red-100 rounded-full mb-4">
              <div className="flex items-center justify-center h-8 w-8 bg-[#E63946] rounded-full">
                <svg className="h-4 w-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                </svg>
              </div>
            </div>
            <h2 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl mb-4">
              Why Choose <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#E63946] to-red-600">Us?</span>
            </h2>
            <p className="mt-4 max-w-2xl text-xl text-gray-600 lg:mx-auto">
              We believe in accessible, personalized healthcare for all women.
            </p>
            <div className="w-24 h-1 bg-gradient-to-r from-[#E63946] to-red-600 mx-auto rounded-full mt-6"></div>
          </div>

          <div className="mt-20">
            <div className="grid grid-cols-1 gap-12 lg:grid-cols-3 lg:gap-8">
              {features.map((feature: FeatureCardProps, index: number) => (
                <div key={index} className="transform transition-all duration-500 hover:scale-105" style={{ animationDelay: `${index * 200}ms` }}>
                  <FeatureCard 
                    title={feature.title}
                    description={feature.description}
                    icon={feature.icon}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

    
    </main>
  );
}