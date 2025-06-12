// src/app/account/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useAuthStore } from '@/store/authStore';
import { useSubscriptionStore } from '@/store/subscriptionStore';
import Link from 'next/link';

// Helper function to format billing period display
const formatBillingPeriod = (period: string): string => {
  switch (period?.toLowerCase()) {
    case 'monthly':
      return 'Monthly';
    case 'three_month':
      return '3 Months';
    case 'six_month':
      return '6 Months';
    case 'annually':
      return 'Annually';
    case 'quarterly':
      return 'Quarterly';
    case 'yearly':
      return 'Yearly';
    default:
      return period ? period.charAt(0).toUpperCase() + period.slice(1) : 'Monthly';
  }
};

export default function AccountPage() {
  const { user, isAuthenticated } = useAuthStore();
  const { subscriptions, hasActiveSubscription, loading, fetchUserSubscriptions } = useSubscriptionStore();
  const [isLoadingPage, setIsLoadingPage] = useState<boolean>(true);

  // Load subscriptions when component mounts
  useEffect(() => {
    const loadData = async () => {
      if (isAuthenticated && user?.id) {
        console.log("Loading subscriptions in account page");
        // Force a refresh of subscription data when the account page loads
        await fetchUserSubscriptions(user.id, true);
      }
      setIsLoadingPage(false);
    };

    loadData();
  }, [isAuthenticated, user, fetchUserSubscriptions]);

  if (isLoadingPage || loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-pink-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-black">My Account</h1>

        {/* Account Overview Card */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4 text-black">Account Overview</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <p className="text-gray-600">Email</p>
              <p className="font-medium text-black">{user?.email}</p>
            </div>
            <div>
              <p className="text-gray-600">Account Status</p>
              <p className="font-medium">
                {hasActiveSubscription ? (
                  <span className="text-green-600">Active</span>
                ) : (
                  <span className="text-yellow-600">No Active Subscription</span>
                )}
              </p>
            </div>
          </div>
        </div>

        {/* Subscriptions Table - Now with scrollable container */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-black">My Subscriptions</h2>
          </div>
          
          {subscriptions.length > 0 ? (
            <div className="relative">
              {/* Scrollable container with custom scrollbar styling */}
              <div 
                className="overflow-x-auto overflow-y-auto max-h-96 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 hover:scrollbar-thumb-gray-400"
                style={{
                  scrollbarWidth: 'thin',
                  scrollbarColor: '#D1D5DB #F3F4F6'
                }}
              >
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50 sticky top-0 z-10">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Plan
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Price
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Renewal Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {subscriptions.map((subscription) => (
                      <tr key={subscription.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="font-medium text-gray-900">
                            {subscription.plan_name}
                          </div>
                          <div className="text-sm text-gray-500">
                            {formatBillingPeriod(subscription.billing_period)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span 
                            className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                            ${subscription.is_active && subscription.status.toLowerCase() === 'active'
                                ? 'bg-green-100 text-green-800' 
                                : subscription.status.toLowerCase() === 'cancelled'
                                ? 'bg-red-100 text-red-800'
                                : subscription.status.toLowerCase() === 'cancelling'
                                ? 'bg-orange-100 text-orange-800'
                                : subscription.status.toLowerCase() === 'pending'
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-yellow-100 text-yellow-800'
                            }`}
                          >
                            {subscription.status.charAt(0).toUpperCase() + subscription.status.slice(1)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          ${subscription.billing_amount}/{formatBillingPeriod(subscription.billing_period).toLowerCase()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {subscription.next_billing_date 
                            ? new Date(subscription.next_billing_date).toLocaleDateString()
                            : subscription.status.toLowerCase() === 'cancelled' 
                              ? 'Cancelled'
                              : 'N/A'
                          }
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <Link
                            href="/account/subscriptions"
                            className="text-indigo-600 hover:text-indigo-900 transition-colors"
                          >
                            Manage
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              {/* Scroll indicators */}
              {subscriptions.length > 4 && (
                <div className="absolute bottom-2 right-2 text-xs text-gray-400 bg-white px-2 py-1 rounded shadow">
                  Scroll for more
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-12 bg-gray-50">
              <div className="mx-auto w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center mb-4">
                <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <p className="text-gray-600 text-lg font-medium mb-2">No subscriptions yet</p>
              <p className="text-gray-500 mb-6">When you subscribe to a plan, it will appear here.</p>
              <Link
                href="/subscriptions"
                className="inline-block bg-gradient-to-r from-pink-500 to-rose-500 text-white px-6 py-3 rounded-md hover:opacity-90 transition-all font-medium"
              >
                View Subscription Plans
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}