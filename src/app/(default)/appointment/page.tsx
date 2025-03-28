// src/app/(default)/appointment/page.tsx
'use client';

import QualiphyWidget from '@/components/QualiphyWidget';
import QualiphyWidgetAuthWrapper from '@/components/QualiphyWidgetAuthWrapper';
import Link from 'next/link';
import { useEffect, useRef, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { useSubscriptionStore } from '@/store/subscriptionStore';

// Main content component
const AppointmentContent: React.FC = () => {
  const router = useRouter();
  const { user } = useAuthStore();
  const { syncSubscriptionStatuses } = useSubscriptionStore();
  const hasProcessedParams = useRef<boolean>(false);

  // Handle URL parameters and subscription syncing only once after mount
  useEffect(() => {
    const handleSubscriptionRedirect = async () => {
      if (!user?.id || hasProcessedParams.current) return;

      // Get URL parameters
      const urlParams = new URLSearchParams(window.location.search);
      const success = urlParams.get('subscription_success') === 'true';
      const sessionId = urlParams.get('session_id');
      
      // If we have a successful subscription payment & user
      if (success && sessionId) {
        // Trigger a sync with Stripe to ensure subscription is active
        try {
          await syncSubscriptionStatuses(user.id);
          
          // Remove the query parameters from the URL for cleaner UX
          // but only after successfully checking subscription status
          router.replace(window.location.pathname);
        } catch (err) {
          console.error("Error syncing subscription status:", err);
        }
      }
      
      // Mark that we've processed parameters to avoid duplicate processing
      hasProcessedParams.current = true;
    };
    
    handleSubscriptionRedirect();
  }, [user, syncSubscriptionStatuses, router]);

  return (
    <div className="py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-extrabold text-gray-900 sm:text-4xl mb-4">
            Telehealth Consultation
          </h1>
          <p className="max-w-2xl mx-auto text-xl text-gray-500">
            Connect with our healthcare providers for your virtual consultation
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-2">
            <QualiphyWidget className="mb-8" />
          </div>
          
          <div className="md:col-span-1">
            <div className="bg-white shadow-sm rounded-lg overflow-hidden mb-8">
              <div className="px-6 py-6">
                <h2 className="text-lg font-semibold text-gray-800 mb-4">Before Your Consultation</h2>
                <ul className="space-y-3">
                  <li className="flex">
                    <svg
                      className="h-5 w-5 text-green-500 flex-shrink-0 mt-1"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span className="ml-2 text-gray-600">Find a quiet, private space with good lighting</span>
                  </li>
                  <li className="flex">
                    <svg
                      className="h-5 w-5 text-green-500 flex-shrink-0 mt-1"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span className="ml-2 text-gray-600">Ensure your internet connection is stable</span>
                  </li>
                  <li className="flex">
                    <svg
                      className="h-5 w-5 text-green-500 flex-shrink-0 mt-1"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span className="ml-2 text-gray-600">Have your medical history and medication list ready</span>
                  </li>
                  <li className="flex">
                    <svg
                      className="h-5 w-5 text-green-500 flex-shrink-0 mt-1"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span className="ml-2 text-gray-600">Write down any questions you want to ask</span>
                  </li>
                  <li className="flex">
                    <svg
                      className="h-5 w-5 text-green-500 flex-shrink-0 mt-1"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span className="ml-2 text-gray-600">Test your camera and microphone</span>
                  </li>
                </ul>
              </div>
            </div>
            
            <div className="bg-white shadow-sm rounded-lg overflow-hidden mb-8">
              <div className="px-6 py-6">
                <h2 className="text-lg font-semibold text-gray-800 mb-4">Technical Requirements</h2>
                <ul className="space-y-3">
                  <li className="flex">
                    <svg
                      className="h-5 w-5 text-blue-500 flex-shrink-0 mt-1"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path fillRule="evenodd" d="M10 2a8 8 0 100 16 8 8 0 000-16zm0 14a6 6 0 100-12 6 6 0 000 12zm-1-5a1 1 0 011-1h.01a1 1 0 110 2H10a1 1 0 01-1-1zm0-4a1 1 0 011-1h.01a1 1 0 110 2H10a1 1 0 01-1-1z" clipRule="evenodd" />
                    </svg>
                    <span className="ml-2 text-gray-600">Up-to-date browser (Chrome, Firefox, or Safari)</span>
                  </li>
                  <li className="flex">
                    <svg
                      className="h-5 w-5 text-blue-500 flex-shrink-0 mt-1"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path fillRule="evenodd" d="M10 2a8 8 0 100 16 8 8 0 000-16zm0 14a6 6 0 100-12 6 6 0 000 12zm-1-5a1 1 0 011-1h.01a1 1 0 110 2H10a1 1 0 01-1-1zm0-4a1 1 0 011-1h.01a1 1 0 110 2H10a1 1 0 01-1-1z" clipRule="evenodd" />
                    </svg>
                    <span className="ml-2 text-gray-600">Webcam and microphone</span>
                  </li>
                  <li className="flex">
                    <svg
                      className="h-5 w-5 text-blue-500 flex-shrink-0 mt-1"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path fillRule="evenodd" d="M10 2a8 8 0 100 16 8 8 0 000-16zm0 14a6 6 0 100-12 6 6 0 000 12zm-1-5a1 1 0 011-1h.01a1 1 0 110 2H10a1 1 0 01-1-1zm0-4a1 1 0 011-1h.01a1 1 0 110 2H10a1 1 0 01-1-1z" clipRule="evenodd" />
                    </svg>
                    <span className="ml-2 text-gray-600">Stable internet connection (minimum 1 Mbps)</span>
                  </li>
                </ul>
              </div>
            </div>
            
            <div className="text-center">
              <Link href="/account" className="inline-flex items-center text-indigo-600 hover:text-indigo-800">
                <svg className="h-5 w-5 mr-1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm.707-10.293a1 1 0 00-1.414-1.414l-3 3a1 1 0 000 1.414l3 3a1 1 0 001.414-1.414L9.414 11H13a1 1 0 100-2H9.414l1.293-1.293z" clipRule="evenodd" />
                </svg>
                Back to Account
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Main page component with Suspense boundary and auth wrapper
export default function AppointmentAccessPage() {
  return (
    <QualiphyWidgetAuthWrapper>
      <Suspense fallback={<div className="flex justify-center py-10"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-pink-500"></div></div>}>
        <AppointmentContent />
      </Suspense>
    </QualiphyWidgetAuthWrapper>
  );
}