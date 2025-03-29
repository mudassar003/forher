// src/app/(default)/subscriptions/components/SubscriptionGrid.tsx
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import SubscriptionCard from './SubscriptionCard';
import { useAuthStore } from '@/store/authStore';
import { SubscriptionsData, Subscription, SubscriptionCategory } from '@/types/subscription-page';

interface SubscriptionGridProps extends SubscriptionsData {}

const SubscriptionGrid: React.FC<SubscriptionGridProps> = ({
  categories,
  subscriptionsByCategory,
  uncategorizedSubscriptions,
  featuredSubscriptions,
  allSubscriptions,
  error
}) => {
  const { isAuthenticated } = useAuthStore();
  const [loading, setLoading] = useState(false);

  // FALLBACK: If no categories were found, just show all subscriptions
  if (categories.length === 0 && allSubscriptions.length > 0) {
    return (
      <div className="container mx-auto px-4 py-12">
        <h2 className="text-2xl font-bold mb-8">Our Subscription Plans</h2>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {allSubscriptions.map((subscription) => (
            <SubscriptionCard 
              key={subscription._id}
              id={subscription._id}
              title={subscription.title}
              description={subscription.description}
              price={subscription.price}
              billingPeriod={subscription.billingPeriod}
              features={subscription.features || []}
              image={subscription.image}
            />
          ))}
        </div>
        
        {!isAuthenticated && (
          <div className="mt-12 p-4 bg-indigo-50 rounded-lg max-w-2xl mx-auto">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <svg className="h-6 w-6 text-indigo-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-3 flex-1">
                <h3 className="text-sm font-medium text-indigo-800">Sign in to subscribe</h3>
                <div className="mt-2 text-sm text-indigo-700">
                  <p>You need to be signed in to purchase a subscription plan. Please sign in or create an account.</p>
                </div>
                <div className="mt-4">
                  <Link 
                    href="/login?returnUrl=/subscriptions" 
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    Sign In
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  if (loading) {
    return (
      <div className="container mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 border-4 border-pink-500 border-t-transparent rounded-full animate-spin"></div>
          <h2 className="text-lg text-gray-600">Loading subscription plans...</h2>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-lg mx-auto p-6 bg-red-50 rounded-lg text-center">
          <svg className="w-12 h-12 text-red-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h2 className="text-lg font-medium text-red-800 mb-2">Something went wrong</h2>
          <p className="text-red-600">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (allSubscriptions.length === 0) {
    return (
      <div className="container mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-xl font-medium text-gray-800 mb-4">No subscription plans available</h2>
          <p className="text-gray-600">
            Please check back later for new subscription options.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-12">
      {/* Featured Subscriptions Section */}
      {featuredSubscriptions.length > 0 && (
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-6 pb-2 border-b border-gray-200">
            Featured Subscriptions
          </h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredSubscriptions.map((subscription) => (
              <SubscriptionCard 
                key={subscription._id}
                id={subscription._id}
                title={subscription.title}
                description={subscription.description}
                price={subscription.price}
                billingPeriod={subscription.billingPeriod}
                features={subscription.features || []}
                image={subscription.image}
                categories={subscription.categories}
              />
            ))}
          </div>
        </div>
      )}
      
      {/* Display subscriptions by category */}
      {categories.map(category => {
        const categorySubscriptions = subscriptionsByCategory[category._id] || [];
        
        // Only render category section if it has subscriptions
        if (categorySubscriptions.length === 0) return null;
        
        return (
          <div key={category._id} className="mb-12">
            <div className="flex flex-col md:flex-row md:items-end md:justify-between mb-6 pb-2 border-b border-gray-200">
              <h2 className="text-2xl font-semibold">
                {category.title}
              </h2>
              {category.description && (
                <p className="text-gray-600 md:mb-0 mt-1 md:mt-0">
                  {category.description}
                </p>
              )}
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {categorySubscriptions.map((subscription) => (
                <SubscriptionCard 
                  key={subscription._id}
                  id={subscription._id}
                  title={subscription.title}
                  description={subscription.description}
                  price={subscription.price}
                  billingPeriod={subscription.billingPeriod}
                  features={subscription.features || []}
                  image={subscription.image}
                  categories={subscription.categories}
                />
              ))}
            </div>
          </div>
        );
      })}
      
      {/* Display uncategorized subscriptions if any */}
      {uncategorizedSubscriptions.length > 0 && (
        <div className="mb-12">
          <h2 className="text-2xl font-semibold mb-6 pb-2 border-b border-gray-200">
            Other Plans
          </h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {uncategorizedSubscriptions.map((subscription) => (
              <SubscriptionCard 
                key={subscription._id}
                id={subscription._id}
                title={subscription.title}
                description={subscription.description}
                price={subscription.price}
                billingPeriod={subscription.billingPeriod}
                features={subscription.features || []}
                image={subscription.image}
              />
            ))}
          </div>
        </div>
      )}
      
      {!isAuthenticated && (
        <div className="mt-12 p-4 bg-indigo-50 rounded-lg max-w-2xl mx-auto">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <svg className="h-6 w-6 text-indigo-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="ml-3 flex-1">
              <h3 className="text-sm font-medium text-indigo-800">Sign in to subscribe</h3>
              <div className="mt-2 text-sm text-indigo-700">
                <p>You need to be signed in to purchase a subscription plan. Please sign in or create an account.</p>
              </div>
              <div className="mt-4">
                <Link 
                  href="/login?returnUrl=/subscriptions" 
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Sign In
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SubscriptionGrid;