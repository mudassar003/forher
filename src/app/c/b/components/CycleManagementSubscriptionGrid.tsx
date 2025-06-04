//src/app/c/b/components/CycleManagementSubscriptionGrid.tsx
"use client";

import { useState, useEffect } from "react";
import { groq } from 'next-sanity';
import { client } from '@/sanity/lib/client';
import { Subscription, SubscriptionCategory } from '@/types/subscription-page';
import Image from 'next/image';
import Link from 'next/link';
import { urlFor } from '@/sanity/lib/image';

interface CycleManagementSubscriptionGridProps {
  className?: string;
}

const CycleManagementSubscriptionGrid: React.FC<CycleManagementSubscriptionGridProps> = ({ 
  className = "" 
}) => {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [cycleManagementSubscriptions, setCycleManagementSubscriptions] = useState<Subscription[]>([]);
  const [category, setCategory] = useState<SubscriptionCategory | null>(null);

  useEffect(() => {
    const fetchCycleManagementSubscriptions = async (): Promise<void> => {
      try {
        setIsLoading(true);
        
        // Find the cycle-management category first
        const categoriesResult = await client.fetch(
          groq`*[_type == "subscriptionCategory" && slug.current == "cycle-management"]{
            _id,
            title,
            titleEs,
            slug,
            description,
            descriptionEs
          }`
        );
        
        // Properly cast the result
        const categories = categoriesResult as SubscriptionCategory[];
        
        if (categories.length === 0) {
          // Cycle management category not found
          setError("Cycle management category not found. Please check your Sanity schema.");
          setIsLoading(false);
          return;
        }
        
        const cycleManagementCategory = categories[0];
        setCategory(cycleManagementCategory);
        
        // Now fetch subscriptions that belong to this category
        const subscriptionsResult = await client.fetch(
          groq`*[_type == "subscription" && references($categoryId) && isActive == true && isDeleted != true] {
            _id,
            title,
            titleEs,
            slug,
            description,
            descriptionEs,
            price,
            billingPeriod,
            customBillingPeriodMonths,
            hasVariants,
            variants[]{
              _key,
              title,
              titleEs,
              description,
              descriptionEs,
              dosageAmount,
              dosageUnit,
              price,
              compareAtPrice,
              billingPeriod,
              customBillingPeriodMonths,
              stripePriceId,
              isDefault,
              isPopular
            },
            features,
            featuresEs,
            image,
            featuredImage,
            isActive,
            isFeatured,
            "categories": categories[]->{ 
              _id, 
              title, 
              titleEs,
              slug, 
              description, 
              descriptionEs
            }
          }`,
          { categoryId: cycleManagementCategory._id }
        );
        
        // Properly cast the result
        const subscriptions = subscriptionsResult as Subscription[];
        setCycleManagementSubscriptions(subscriptions);
      } catch (err) {
        console.error("Error fetching cycle management subscriptions:", err);
        setError(err instanceof Error ? err.message : "An unknown error occurred");
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchCycleManagementSubscriptions();
  }, []);

  // Get the price and billing details to use (default variant or base subscription)
  const getPriceDetails = (subscription: Subscription): { price: number; billingPeriod: string; customBillingPeriodMonths?: number | null } => {
    // If has variants, look for default variant first
    if (subscription.hasVariants && subscription.variants && subscription.variants.length > 0) {
      const defaultVariant = subscription.variants.find(variant => variant.isDefault);
      if (defaultVariant) {
        return {
          price: defaultVariant.price,
          billingPeriod: defaultVariant.billingPeriod,
          customBillingPeriodMonths: defaultVariant.customBillingPeriodMonths
        };
      }
    }
    
    // Fall back to base subscription price
    return {
      price: subscription.price,
      billingPeriod: subscription.billingPeriod,
      customBillingPeriodMonths: subscription.customBillingPeriodMonths
    };
  };

  // Format price - show monthly equivalent
  const formatPrice = (subscription: Subscription): string => {
    const priceDetails = getPriceDetails(subscription);
    const subscriptionPrice = priceDetails.price;
    const period = priceDetails.billingPeriod;
    const customMonths = priceDetails.customBillingPeriodMonths;

    // Calculate monthly equivalent
    let monthlyPrice: number;
    switch (period) {
      case 'monthly':
        monthlyPrice = subscriptionPrice;
        break;
      case 'three_month':
        monthlyPrice = subscriptionPrice / 3;
        break;
      case 'six_month':
        monthlyPrice = subscriptionPrice / 6;
        break;
      case 'annually':
        monthlyPrice = subscriptionPrice / 12;
        break;
      case 'other':
        if (customMonths && customMonths > 1) {
          monthlyPrice = subscriptionPrice / customMonths;
        } else {
          monthlyPrice = subscriptionPrice;
        }
        break;
      default:
        monthlyPrice = subscriptionPrice;
    }

    const formattedPrice = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(monthlyPrice);

    return `${formattedPrice}/month`;
  };

  // Get image URL or fallback
  const getImageUrl = (subscription: Subscription): string => {
    if (subscription.featuredImage) {
      return urlFor(subscription.featuredImage).width(600).height(450).url();
    }
    if (subscription.image) {
      return urlFor(subscription.image).width(600).height(450).url();
    }
    return '/images/cycle-management-subscription-placeholder.jpg';
  };

  if (isLoading) {
    return (
      <div className={`w-full flex justify-center items-center py-12 ${className}`}>
        <div className="w-16 h-16 border-4 border-gray-300 border-t-[#fe92b5] rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`w-full py-8 ${className}`}>
        <div className="max-w-lg mx-auto p-6 bg-red-50 rounded-lg text-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-red-500 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h3 className="text-lg font-medium text-red-800 mb-2">Error Loading Subscriptions</h3>
          <p className="text-red-600 mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (cycleManagementSubscriptions.length === 0) {
    return (
      <div className={`w-full py-8 text-center ${className}`}>
        <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-gray-400 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
        </svg>
        <h3 className="text-xl font-medium text-gray-700 mb-2">No Cycle Management Subscription Plans Available</h3>
        <p className="text-gray-500 mb-6">
          We couldn't find any active cycle management subscription plans at this time. Please check back later.
        </p>
        <Link 
          href="/subscriptions"
          className="inline-block px-6 py-3 bg-[#fe92b5] text-white font-medium rounded-lg hover:bg-[#e682a3] transition-colors"
        >
          Browse All Subscriptions
        </Link>
      </div>
    );
  }

  return (
    <div className={`w-full ${className}`}>
      {/* Subscription grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
        {cycleManagementSubscriptions.map((subscription) => (
          <div 
            key={subscription._id}
            className="bg-white rounded-xl shadow-md overflow-hidden transition-all duration-300 hover:shadow-xl border border-gray-200 hover:transform hover:-translate-y-2"
          >
            {/* Image - Updated to match main subscription cards */}
            <div className="w-full">
              <div className="relative h-72 w-full overflow-hidden">
                <Image
                  src={getImageUrl(subscription)}
                  alt={subscription.title}
                  fill
                  className="object-cover hover:scale-105 transition-transform duration-500"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 33vw, 400px"
                  style={{ objectPosition: 'center' }}
                />
                
                {/* Featured Badge */}
                {subscription.isFeatured && (
                  <div className="absolute top-3 right-3 bg-white text-[#fe92b5] text-xs font-bold px-3 py-1 rounded-full shadow-md z-10">
                    Featured
                  </div>
                )}
              </div>
              
              {/* Title and Price Below Image */}
              <div className="p-4 border-b border-gray-200">
                <h3 className="text-xl font-bold text-gray-800">{subscription.title}</h3>
                <div className="mt-1">
                  <span className="text-lg font-medium text-[#fe92b5]">
                    {formatPrice(subscription)}
                  </span>
                </div>
              </div>
            </div>
            
            {/* Features and Actions */}
            <div className="p-5">
              {/* Features */}
              <div className="space-y-3 mb-6">
                {subscription.features && subscription.features.filter(feature => feature && feature.featureText).map((feature, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-5 h-5 rounded-full bg-[#fe92b5] flex items-center justify-center text-white text-xs">
                      ✓
                    </div>
                    <div className="text-gray-700 text-sm">{feature.featureText}</div>
                  </div>
                ))}
              </div>
              
              <div className="space-y-3">
                {/* View Details Link - Only Button */}
                {subscription.slug && subscription.slug.current && (
                  <Link 
                    href={`/subscriptions/${subscription.slug.current}`}
                    className="block w-full text-center py-3 px-4 border-2 border-[#fe92b5] text-[#fe92b5] hover:bg-[#fe92b5] hover:text-white rounded-lg transition-colors font-medium"
                  >
                    View Details
                  </Link>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CycleManagementSubscriptionGrid;