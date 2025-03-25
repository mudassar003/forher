// src/components/Subscription/SubscriptionGrid.tsx
'use client';

import { useEffect, useState } from 'react';
import { client } from '@/sanity/lib/client';
import SubscriptionCard from './SubscriptionCard';
import { useAuthStore } from '@/store/authStore';
import { SanityImageSource } from '@sanity/image-url/lib/types/types';

interface Feature {
  featureText: string;
}

interface Subscription {
  _id: string;
  title: string;
  description?: string;
  price: number;
  billingPeriod: string;
  features: Feature[];
  image?: SanityImageSource;
  appointmentAccess: boolean;
  appointmentDiscountPercentage: number;
  isActive: boolean;
}

const SubscriptionGrid: React.FC = () => {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { isAuthenticated } = useAuthStore();

  useEffect(() => {
    const fetchSubscriptions = async () => {
      try {
        setLoading(true);
        
        // Fetch active subscription plans from Sanity
        const query = `*[_type == "subscription" && isActive == true] {
          _id,
          title,
          description,
          price,
          billingPeriod,
          features[]{featureText},
          image,
          appointmentAccess,
          appointmentDiscountPercentage,
          isActive
        } | order(price asc)`;
        
        const data = await client.fetch<Subscription[]>(query);
        
        setSubscriptions(data);
      } catch (err) {
        console.error("Error fetching subscriptions:", err);
        setError("Failed to load subscription plans. Please try again later.");
      } finally {
        setLoading(false);
      }
    };
    
    fetchSubscriptions();
  }, []);

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

  if (subscriptions.length === 0) {
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
    <div className="container mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {subscriptions.map((subscription) => (
          <SubscriptionCard
            key={subscription._id}
            id={subscription._id}
            title={subscription.title}
            description={subscription.description}
            price={subscription.price}
            billingPeriod={subscription.billingPeriod}
            features={subscription.features}
            image={subscription.image}
            appointmentAccess={subscription.appointmentAccess}
            appointmentDiscountPercentage={subscription.appointmentDiscountPercentage}
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
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SubscriptionGrid;