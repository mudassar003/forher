// src/components/Subscription/SubscriptionCard.tsx
'use client';

import { useState } from 'react';
import Image from 'next/image';
import { urlFor } from '@/sanity/lib/image';
import { useSubscriptionPurchase } from '@/hooks/useSubscriptionPurchase';
import { useAuthStore } from '@/store/authStore';
import { SanityImageSource } from '@sanity/image-url/lib/types/types';

interface Feature {
  featureText: string;
}

interface SubscriptionProps {
  id: string;
  title: string;
  description?: string;
  price: number;
  billingPeriod: string;
  features: Feature[];
  image?: SanityImageSource;
  appointmentAccess?: boolean;
  appointmentDiscountPercentage?: number;
}

const SubscriptionCard: React.FC<SubscriptionProps> = ({
  id,
  title,
  description,
  price,
  billingPeriod,
  features = [], // Add a default empty array
  image,
  appointmentAccess = false,
  appointmentDiscountPercentage = 0
}) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const { isAuthenticated } = useAuthStore();
  const { purchaseSubscription, isLoading, error } = useSubscriptionPurchase();

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Determine proper billing period display
  const getBillingPeriodDisplay = () => {
    switch (billingPeriod.toLowerCase()) {
      case 'monthly':
        return '/month';
      case 'quarterly':
        return '/quarter';
      case 'annually':
        return '/year';
      default:
        return `/${billingPeriod}`;
    }
  };

  // Handle the subscription purchase
  const handleSubscribe = async () => {
    if (isProcessing || isLoading) return;
    
    setIsProcessing(true);
    
    try {
      const result = await purchaseSubscription(id);
      
      if (result.success && result.url) {
        // Redirect to Stripe checkout
        window.location.href = result.url;
      }
    } catch (err) {
      console.error('Failed to initiate subscription purchase:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="flex flex-col bg-white border rounded-lg shadow-sm overflow-hidden h-full">
      {/* Header with image if available */}
      {image && (
        <div className="relative h-32 w-full overflow-hidden">
          <Image
            src={urlFor(image).width(600).url()}
            alt={title}
            fill
            className="object-cover"
          />
        </div>
      )}
      
      {/* Content */}
      <div className="p-6 flex flex-col h-full">
        {/* Title and price */}
        <div className="mb-4">
          <h3 className="text-2xl font-bold text-gray-900">{title}</h3>
          <div className="mt-2 flex items-baseline">
            <span className="text-3xl font-bold text-gray-900">{formatCurrency(price)}</span>
            <span className="ml-1 text-gray-500">{getBillingPeriodDisplay()}</span>
          </div>
        </div>
        
        {/* Description */}
        {description && (
          <p className="text-gray-600 mb-4">{description}</p>
        )}
        
        {/* Special features */}
        {appointmentAccess && (
          <div className="mt-1 mb-4">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
              Includes Appointment Access
            </span>
            {appointmentDiscountPercentage > 0 && (
              <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                {appointmentDiscountPercentage}% Off Appointments
              </span>
            )}
          </div>
        )}
        
        {/* Features list */}
        <ul className="mt-4 space-y-3 flex-grow">
          {features.filter(feature => feature && feature.featureText).map((feature, index) => (
            <li key={index} className="flex">
              <svg
                className="h-5 w-5 text-green-500 flex-shrink-0"
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
              <span className="ml-2 text-gray-600">{feature.featureText}</span>
            </li>
          ))}
        </ul>
        
        {/* Subscribe button */}
        <div className="mt-6">
          <button
            onClick={handleSubscribe}
            disabled={isProcessing || isLoading || !isAuthenticated}
            className={`w-full px-4 py-2 rounded-md text-white font-medium ${
              isProcessing || isLoading || !isAuthenticated
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-indigo-600 hover:bg-indigo-700'
            } transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-50`}
          >
            {isProcessing || isLoading ? 'Processing...' : 'Subscribe Now'}
          </button>
          
          {!isAuthenticated && (
            <p className="mt-2 text-sm text-gray-500 text-center">
              Please log in to subscribe
            </p>
          )}
          
          {error && (
            <p className="mt-2 text-sm text-red-600 text-center">
              {error}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default SubscriptionCard;