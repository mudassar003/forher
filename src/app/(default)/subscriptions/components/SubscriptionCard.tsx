// src/app/(default)/subscriptions/components/SubscriptionCard.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSubscriptionPurchase } from '@/hooks/useSubscriptionPurchase';
import { useAuthStore } from '@/store/authStore';
import { SubscriptionFeature } from '@/types/subscription-page';

interface SubscriptionCardProps {
  id: string;
  title: string;
  description?: string;
  price: number;
  billingPeriod: string;
  features: SubscriptionFeature[];
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
  categories
}) => {
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const { user, isAuthenticated, checkSession } = useAuthStore();
  const { purchaseSubscription, isLoading, error } = useSubscriptionPurchase();
  const router = useRouter();
  
  // Check auth state when component mounts
  useEffect(() => {
    if (!isAuthenticated) {
      checkSession();
    }
  }, [isAuthenticated, checkSession]);

  // Format currency
  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Determine proper billing period display
  const getBillingPeriodDisplay = (): string => {
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

  // Handle the subscription purchase or redirect to login
  const handleSubscribe = async (): Promise<void> => {
    if (isProcessing || isLoading) return;
    
    // Store current path in sessionStorage
    const currentPath = window.location.pathname;
    sessionStorage.setItem('subscriptionReturnPath', currentPath);
    
    // If not authenticated, redirect to login with return URL
    if (!isAuthenticated) {
      // Save intended subscription ID to purchase after login
      sessionStorage.setItem('pendingSubscriptionId', id);
      const returnUrl = encodeURIComponent('/subscriptions');
      router.push(`/login?returnUrl=${returnUrl}`);
      return;
    }
    
    setIsProcessing(true);
    
    try {
      // Store appointment page as the return URL after successful purchase
      sessionStorage.setItem('loginReturnUrl', '/appointment');
      
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
    <div className="flex flex-col bg-white border border-gray-200 rounded-xl shadow-sm h-full hover:shadow-md transition-shadow">
      {/* Simple elegant header */}
      <div className="px-6 pt-6 pb-2">
        <h3 className="text-xl font-semibold text-gray-900">{title}</h3>
      </div>
      
      {/* Content */}
      <div className="px-6 pb-6 flex flex-col flex-grow">
        {/* Price with prominent display */}
        <div className="mt-2 mb-6">
          <div className="flex items-baseline">
            <span className="text-4xl font-bold text-gray-900">{formatCurrency(price)}</span>
            <span className="ml-2 text-gray-600">{getBillingPeriodDisplay()}</span>
          </div>
          
          {/* Categories as subtle tags */}
          {categories && categories.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {categories.map(category => (
                <span 
                  key={category._id}
                  className="text-xs text-gray-500"
                >
                  {category.title}
                </span>
              ))}
            </div>
          )}
        </div>
        
        {/* Description with clean styling */}
        <div className="mb-6">
          {description ? (
            <p className="text-gray-600 text-sm">{description}</p>
          ) : null}
        </div>
        
        {/* Features list with modern checkmarks */}
        <div className="mb-6 flex-grow">
          {features.length > 0 ? (
            <ul className="space-y-2">
              {features.filter(feature => feature && feature.featureText).map((feature, index) => (
                <li key={index} className="flex items-center">
                  <svg
                    className="h-4 w-4 text-indigo-500 flex-shrink-0 mr-2"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  <span className="text-sm text-gray-600">{feature.featureText}</span>
                </li>
              ))}
            </ul>
          ) : null}
        </div>
        
        {/* Clean, minimal button design */}
        <div className="mt-auto pt-4 border-t border-gray-100">
          <button
            onClick={handleSubscribe}
            disabled={isProcessing || isLoading}
            className={`w-full py-3 rounded-lg text-white font-medium ${
              isProcessing || isLoading
                ? 'bg-gray-300 cursor-not-allowed'
                : 'bg-black hover:bg-gray-800'
            } transition-all focus:outline-none focus:ring-2 focus:ring-black focus:ring-opacity-50 shadow-sm`}
          >
            {isProcessing || isLoading 
              ? 'Processing...' 
              : isAuthenticated 
                ? 'Subscribe Now'
                : 'Sign In to Subscribe'}
          </button>
          
          {error && (
            <p className="mt-2 text-xs text-red-600 text-center">
              {error}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default SubscriptionCard;