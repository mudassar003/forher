// src/app/account/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useAuthStore } from '@/store/authStore';
import { useSubscriptionStore } from '@/store/subscriptionStore';
import Link from 'next/link';

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
        <h1 className="text-3xl font-bold mb-8">My Account</h1>

        {/* Account Overview Card */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Account Overview</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <p className="text-gray-600">Email</p>
              <p className="font-medium">{user?.email}</p>
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

        {/* Quick Actions Grid - Removed the two tabs */}

        {/* Subscriptions Table */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">My Subscriptions</h2>
          
          {subscriptions.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
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
                    <tr key={subscription.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="font-medium text-gray-900">
                          {subscription.plan_name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {subscription.billing_period}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span 
                          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                          ${subscription.is_active 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-yellow-100 text-yellow-800'
                          }`}
                        >
                          {subscription.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        ${subscription.billing_amount}/{subscription.billing_period.toLowerCase()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(subscription.next_billing_date).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <Link
                          href="/account/subscriptions"
                          className="text-indigo-600 hover:text-indigo-900"
                        >
                          Manage
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-6 bg-gray-50 rounded-lg">
              <p className="text-gray-600">You don't have any active subscriptions.</p>
              <Link
                href="/subscriptions"
                className="mt-4 inline-block bg-gradient-to-r from-pink-500 to-rose-500 text-white px-4 py-2 rounded-md hover:opacity-90 transition-all"
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