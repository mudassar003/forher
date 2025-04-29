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
  const [isHovered, setIsHovered] = useState<boolean>(false);
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

  // Check if the subscription is featured based on categories or title
  const isFeatured = categories?.some(cat => cat.title.toLowerCase().includes('featured')) || title.toLowerCase().includes('featured');

  return (
    <div 
      className={`flex flex-col rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-all duration-300 h-full transform ${
        isHovered ? '-translate-y-2' : 'hover:-translate-y-1'
      } ${
        isFeatured ? 'border-2 border-[#e63946] relative' : 'border border-gray-100'
      }`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Decorative bubble elements that appear on hover */}
      {isHovered && (
        <>
          <div className="absolute -top-10 -right-10 w-20 h-20 rounded-full bg-[#ffe6f0] opacity-40 blur-xl transition-opacity duration-300"></div>
          <div className="absolute -bottom-10 -left-10 w-16 h-16 rounded-full bg-[#f9dde5] opacity-30 blur-xl transition-opacity duration-300"></div>
        </>
      )}
      
      {/* Header with gradient background for featured plans, subtle for regular */}
      <div className={`px-6 py-6 ${
        isFeatured 
          ? 'bg-gradient-to-r from-[#e63946] to-[#ff4d6d] text-white' 
          : 'bg-white border-b border-gray-100'
      }`}>
        <h3 className={`text-xl font-bold ${isFeatured ? 'text-white' : 'text-gray-900'}`}>
          {title}
        </h3>
        
        {/* Price display */}
        <div className="mt-4">
          <div className="flex items-baseline">
            <span className={`text-4xl font-extrabold ${isFeatured ? 'text-white' : 'text-gray-900'}`}>
              {formatCurrency(price)}
            </span>
            <span className={`ml-2 ${isFeatured ? 'text-pink-100' : 'text-gray-500'}`}>
              {getBillingPeriodDisplay()}
            </span>
          </div>
          
          {/* Categories as tags */}
          {categories && categories.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-3">
              {categories.map(category => (
                <span 
                  key={category._id}
                  className={`text-xs px-2 py-1 rounded-full ${
                    isFeatured 
                      ? 'bg-pink-700 text-pink-100' 
                      : 'bg-pink-50 text-pink-700'
                  }`}
                >
                  {category.title}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
      
      {/* Content */}
      <div className="px-6 py-6 bg-white flex-grow flex flex-col relative overflow-hidden">
        {/* Subtle background decoration for card content */}
        <div className="absolute -right-16 -bottom-16 w-32 h-32 rounded-full bg-[#f9f9f9] opacity-70 z-0"></div>
        
        {/* Description */}
        {description && (
          <div className="mb-6 relative z-10">
            <p className="text-gray-600 text-sm leading-relaxed">{description}</p>
          </div>
        )}
        
        {/* Features list with pink checkmarks */}
        <div className="mb-6 flex-grow relative z-10">
          {features.length > 0 ? (
            <ul className="space-y-3">
              {features.filter(feature => feature && feature.featureText).map((feature, index) => (
                <li key={index} className="flex items-start">
                  <div className="mt-1 mr-3 flex-shrink-0 flex items-center justify-center w-5 h-5 rounded-full bg-pink-100">
                    <svg
                      className="h-3 w-3 text-[#e63946]"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <span className="text-gray-700">{feature.featureText}</span>
                </li>
              ))}
            </ul>
          ) : null}
        </div>
        
        {/* Call to action button */}
        <div className="mt-auto pt-4 border-t border-gray-100 relative z-10">
          <button
            onClick={handleSubscribe}
            disabled={isProcessing || isLoading}
            className={`w-full py-3 px-4 rounded-lg text-white font-medium transition-all duration-300 ${
              isProcessing || isLoading
                ? 'bg-gray-400 cursor-not-allowed'
                : isFeatured
                  ? 'bg-gradient-to-r from-[#e63946] to-[#ff4d6d] hover:from-[#d52d3a] hover:to-[#e63956] shadow-md hover:shadow-lg'
                  : 'bg-[#e63946] hover:bg-[#d52d3a]'
            } focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-opacity-50`}
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