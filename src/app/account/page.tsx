//src/app/account/page.tsx
"use client";

import { useAuthStore } from "@/store/authStore";
import { useSubscriptionStore } from "@/store/subscriptionStore";
import Link from "next/link";
import { useEffect } from "react";

const Dashboard = () => {
  const { user } = useAuthStore();
  const { hasActiveSubscription, fetchUserSubscriptions } = useSubscriptionStore();

  // Fetch subscription data when component mounts
  useEffect(() => {
    // Fetch subscriptions if user has ID
    if (user?.id) {
      fetchUserSubscriptions(user.id);
    }
  }, [user, fetchUserSubscriptions]);

  // Get display name from user data
  const displayName = 
    user?.user_metadata?.full_name || 
    user?.user_metadata?.name || 
    (user?.email ? user.email.split('@')[0] : 'User');

  return (
    <div className="space-y-6">
      <div className="bg-white shadow rounded-lg p-6 border border-gray-200">
        <h2 className="text-2xl font-semibold mb-6 text-gray-800">
          Welcome back, {displayName}!
        </h2>
        
        {/* Telehealth Access Status */}
        <div className={`${hasActiveSubscription ? "bg-green-50 border-green-100" : "bg-yellow-50 border-yellow-100"} p-5 rounded-lg border flex items-start mb-8`}>
          <div className="text-3xl mr-4">🩺</div>
          <div>
            <p className="text-lg font-bold text-gray-800">
              Telehealth Access: {hasActiveSubscription ? "Active" : "Inactive"}
            </p>
            <p className="text-sm text-gray-600">
              {hasActiveSubscription 
                ? "You have access to telehealth services with your current subscription." 
                : "You need an active subscription to access telehealth services."}
            </p>
          </div>
        </div>

        {/* Quick links */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Link href="/account/orders">
            <div className="bg-white p-5 rounded-lg border border-gray-200 hover:border-pink-300 hover:shadow-md transition-all group">
              <h3 className="font-medium text-gray-800 group-hover:text-pink-500 transition-colors flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                </svg>
                Your Orders
              </h3>
              <p className="text-sm text-gray-600 mt-2">
                View and track your recent orders and shipments
              </p>
            </div>
          </Link>
          
          <Link href="/appointment">
            <div className="bg-white p-5 rounded-lg border border-gray-200 hover:border-pink-300 hover:shadow-md transition-all group">
              <h3 className="font-medium text-gray-800 group-hover:text-pink-500 transition-colors flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                Telehealth Portal
              </h3>
              <p className="text-sm text-gray-600 mt-2">
                Access your telehealth consultations
              </p>
            </div>
          </Link>
          
          <Link href="/account/subscriptions">
            <div className="bg-white p-5 rounded-lg border border-gray-200 hover:border-pink-300 hover:shadow-md transition-all group">
              <h3 className="font-medium text-gray-800 group-hover:text-pink-500 transition-colors flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 11.25v8.25a1.5 1.5 0 01-1.5 1.5H5.25a1.5 1.5 0 01-1.5-1.5v-8.25M12 4.875A2.625 2.625 0 109.375 7.5H12m0-2.625V7.5m0-2.625A2.625 2.625 0 1114.625 7.5H12m0 0V21m-8.625-9.75h18c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125h-18c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
                </svg>
                Subscriptions
              </h3>
              <p className="text-sm text-gray-600 mt-2">
                Manage your subscriptions and telehealth access
              </p>
            </div>
          </Link>
          
          <Link href="/account/settings">
            <div className="bg-white p-5 rounded-lg border border-gray-200 hover:border-pink-300 hover:shadow-md transition-all group">
              <h3 className="font-medium text-gray-800 group-hover:text-pink-500 transition-colors flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Account Settings
              </h3>
              <p className="text-sm text-gray-600 mt-2">
                Update your password and security options
              </p>
            </div>
          </Link>
          
          <Link href="/account/help">
            <div className="bg-white p-5 rounded-lg border border-gray-200 hover:border-pink-300 hover:shadow-md transition-all group">
              <h3 className="font-medium text-gray-800 group-hover:text-pink-500 transition-colors flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z" />
                </svg>
                Help & Support
              </h3>
              <p className="text-sm text-gray-600 mt-2">
                Get assistance with your account or orders
              </p>
            </div>
          </Link>
        </div>
      </div>
      
      {/* Telehealth Access Section */}
      {hasActiveSubscription ? (
        <div className="bg-white shadow rounded-lg p-6 border border-gray-200">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">
            Telehealth Access
          </h2>
          <div className="bg-green-50 p-4 rounded-lg border border-green-100 mb-4">
            <div className="flex items-start">
              <div className="text-green-500 mt-1 mr-3">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <p className="font-medium text-green-700">Your subscription includes telehealth access</p>
                <p className="mt-1 text-sm text-green-600">
                  You can access the telehealth portal anytime during your subscription period.
                </p>
              </div>
            </div>
          </div>

          <div className="mt-4">
            <Link href="/appointment" className="inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-white bg-pink-600 hover:bg-pink-700">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              Go to Telehealth Portal
            </Link>
          </div>
        </div>
      ) : (
        <div className="bg-white shadow rounded-lg p-6 border border-gray-200">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">
            Telehealth Access
          </h2>
          <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-100 mb-4">
            <div className="flex items-start">
              <div className="text-yellow-500 mt-1 mr-3">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <p className="font-medium text-yellow-700">Subscription required for telehealth access</p>
                <p className="mt-1 text-sm text-yellow-600">
                  You need an active subscription to access the telehealth portal.
                </p>
              </div>
            </div>
          </div>

          <div className="mt-4">
            <Link href="/subscriptions" className="inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-white bg-pink-600 hover:bg-pink-700">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              View Subscription Plans
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;