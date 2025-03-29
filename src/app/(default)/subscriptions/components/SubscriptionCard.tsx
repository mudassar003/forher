// src/app/(default)/subscriptions/components/SubscriptionCard.tsx
'use client';

import { useState } from 'react';
import Image from 'next/image';
import { urlFor } from '@/sanity/lib/image';
import { useSubscriptionPurchase } from '@/hooks/useSubscriptionPurchase';
import { useAuthStore } from '@/store/authStore';
import { SanityImageSource } from '@sanity/image-url/lib/types/types';
import { SubscriptionFeature } from '@/types/subscription-page';

interface SubscriptionCardProps {
  id: string;
  title: string;
  description?: string;
  price: number;
  billingPeriod: string;
  features: SubscriptionFeature[];
  image?: SanityImageSource;
  categories?: Array<{
    _id: string;
    title: string;
  }>;
}

const SubscriptionCard: React.FC<SubscriptionCardProps> = ({
  id,
  title,
  description,
  price,
  billingPeriod,
  features = [],
  image,
  categories
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
      {image ? (
        <div className="relative h-40 w-full overflow-hidden">
          <Image
            src={urlFor(image).width(600).url()}
            alt={title}
            fill
            className="object-cover"
          />
        </div>
      ) : (
        // Add placeholder if no image to maintain consistent heights
        <div className="relative h-40 w-full bg-gray-100 flex items-center justify-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
        </div>
      )}
      
      {/* Content - Fixed height with scrollable features */}
      <div className="p-6 flex flex-col flex-grow" style={{ minHeight: '350px' }}>
        {/* Categories */}
        <div className="flex flex-wrap gap-1 mb-2 min-h-6">
          {categories && categories.length > 0 ? (
            categories.map(category => (
              <span 
                key={category._id}
                className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full"
              >
                {category.title}
              </span>
            ))
          ) : (
            <span className="text-xs invisible">No categories</span>
          )}
        </div>
      
        {/* Title and price - Fixed height */}
        <div className="mb-4" style={{ minHeight: '80px' }}>
          <h3 className="text-2xl font-bold text-gray-900 line-clamp-2">{title}</h3>
          <div className="mt-2 flex items-baseline">
            <span className="text-3xl font-bold text-gray-900">{formatCurrency(price)}</span>
            <span className="ml-1 text-gray-500">{getBillingPeriodDisplay()}</span>
          </div>
        </div>
        
        {/* Description - Fixed height with line clamp */}
        <div className="mb-4" style={{ minHeight: '60px' }}>
          {description ? (
            <p className="text-gray-600 line-clamp-3">{description}</p>
          ) : (
            <p className="text-gray-400 italic">No description available</p>
          )}
        </div>
        
        {/* Features list - Scrollable if too many */}
        <div className="mt-4 flex-grow overflow-y-auto" style={{ maxHeight: '150px' }}>
          {features.length > 0 ? (
            <ul className="space-y-3">
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
          ) : (
            <p className="text-gray-400 italic">No features listed</p>
          )}
        </div>
        
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