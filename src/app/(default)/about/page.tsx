// src/app/(default)/about/page.tsx
import { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';

// Define metadata for SEO
export const metadata: Metadata = {
  title: 'About Us | Lily&apos;s',
  description: 'Learn about our mission to provide accessible telehealth services for women.',
};

export default function AboutPage() {
  return (
    <div className="py-12 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-gray-900 sm:text-5xl mb-6">
            Our Story
          </h1>
          <p className="max-w-2xl mx-auto text-xl text-gray-500">
            We're on a mission to make healthcare accessible, convenient, and personalized for women everywhere.
          </p>
        </div>

        {/* Mission Section */}
        <div className="bg-pink-50 rounded-xl overflow-hidden mb-16">
          <div className="md:flex">
            <div className="md:w-1/2 p-8 md:p-12 flex flex-col justify-center">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">
                Our Mission
              </h2>
              <p className="text-lg text-gray-700 mb-6">
                At Lily&apos;s, we believe that healthcare should be accessible to all women, regardless of where they live or their schedule constraints. Our telehealth platform connects women with licensed healthcare providers who specialize in women's health issues.
              </p>
              <p className="text-lg text-gray-700">
                We're dedicated to providing a safe, confidential, and convenient way for women to receive the care they need, when they need it.
              </p>
            </div>
            <div className="md:w-1/2 h-64 md:h-auto relative">
              <div className="h-full">
                <div className="absolute inset-0 bg-[#fc4e87] opacity-20"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <svg className="w-24 h-24 text-[#fc4e87]" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                    <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd"></path>
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Values Section */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-10 text-center">
            Our Values
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
              <div className="w-12 h-12 bg-pink-100 rounded-full flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-[#fc4e87]" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path>
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Trust</h3>
              <p className="text-gray-600">
                We build trust by connecting you with licensed healthcare providers who deliver evidence-based care.
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
              <div className="w-12 h-12 bg-pink-100 rounded-full flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-[#fc4e87]" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Privacy</h3>
              <p className="text-gray-600">
                Your health information is private. We utilize secure technology and follow strict privacy protocols.
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
              <div className="w-12 h-12 bg-pink-100 rounded-full flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-[#fc4e87]" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z"></path>
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Efficiency</h3>
              <p className="text-gray-600">
                We deliver healthcare efficiently, eliminating wait times and unnecessary visits while maintaining quality care.
              </p>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="bg-gray-50 rounded-xl p-8 md:p-12 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">
            Ready to experience healthcare designed for you?
          </h2>
          <p className="max-w-2xl mx-auto text-lg text-gray-600 mb-8">
            Join thousands of women who have discovered a better way to access healthcare.
          </p>
          <Link 
            href="/subscriptions" 
            className="inline-block bg-[#fc4e87] text-white px-8 py-3 rounded-md font-medium hover:bg-pink-600 transition-colors"
          >
            Schedule a Consultation
          </Link>
        </div>
      </div>
    </div>
  );
}