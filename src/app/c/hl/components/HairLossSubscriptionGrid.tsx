//src/app/c/hl/components/HairLossSubscriptionGrid.tsx
"use client";

import { useState, useEffect } from "react";
import { groq } from 'next-sanity';
import { client } from '@/sanity/lib/client';
import { Subscription, SubscriptionCategory } from '@/types/subscription-page';
import Image from 'next/image';
import Link from 'next/link';
import { urlFor } from '@/sanity/lib/image';

interface HairLossSubscriptionGridProps {
  className?: string;
}

const HairLossSubscriptionGrid: React.FC<HairLossSubscriptionGridProps> = ({ 
  className = "" 
}) => {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [hairLossSubscriptions, setHairLossSubscriptions] = useState<Subscription[]>([]);
  const [category, setCategory] = useState<SubscriptionCategory | null>(null);

  useEffect(() => {
    const fetchHairLossSubscriptions = async (): Promise<void> => {
      try {
        setIsLoading(true);
        
        // Find the hair-care category first
        const categoriesResult = await client.fetch(
          groq`*[_type == "subscriptionCategory" && slug.current == "hair-care"]{
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
          // Hair care category not found
          setError("Hair care category not found. Please check your Sanity schema.");
          setIsLoading(false);
          return;
        }
        
        const hairCareCategory = categories[0];
        setCategory(hairCareCategory);
        
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
          { categoryId: hairCareCategory._id }
        );
        
        // Properly cast the result
        const subscriptions = subscriptionsResult as Subscription[];
        setHairLossSubscriptions(subscriptions);
      } catch (err) {
        console.error("Error fetching hair care subscriptions:", err);
        setError(err instanceof Error ? err.message : "An unknown error occurred");
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchHairLossSubscriptions();
  }, []);

  // Format price - show only main price without monthly equivalent
  const formatPrice = (subscription: Subscription): string => {
    const formattedPrice = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(subscription.price);

    // Get billing period display
    let periodDisplay: string;
    switch (subscription.billingPeriod) {
      case 'monthly':
        periodDisplay = '/month';
        break;
      case 'three_month':
        periodDisplay = '/3 months';
        break;
      case 'six_month':
        periodDisplay = '/6 months';
        break;
      case 'annually':
        periodDisplay = '/year';
        break;
      case 'other':
        if (subscription.customBillingPeriodMonths && subscription.customBillingPeriodMonths > 1) {
          periodDisplay = `/${subscription.customBillingPeriodMonths} months`;
        } else {
          periodDisplay = '/month';
        }
        break;
      default:
        periodDisplay = `/${subscription.billingPeriod}`;
    }

    return `${formattedPrice}${periodDisplay}`;
  };

  // Get image URL or fallback
  const getImageUrl = (subscription: Subscription): string => {
    if (subscription.featuredImage) {
      return urlFor(subscription.featuredImage).width(600).height(450).url();
    }
    if (subscription.image) {
      return urlFor(subscription.image).width(600).height(450).url();
    }
    return '/images/hair-loss-subscription-placeholder.jpg';
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

  if (hairLossSubscriptions.length === 0) {
    return (
      <div className={`w-full py-8 text-center ${className}`}>
        <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-gray-400 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
        </svg>
        <h3 className="text-xl font-medium text-gray-700 mb-2">No Hair Care Subscription Plans Available</h3>
        <p className="text-gray-500 mb-6">
          We couldn't find any active hair care subscription plans at this time. Please check back later.
        </p>
        <Link 
          href="/subscriptions"
          className="inline-block px-6 py-3 bg-[#e63946] text-white font-medium rounded-lg hover:bg-[#d52b36] transition-colors"
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
        {hairLossSubscriptions.map((subscription) => (
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
                  <div className="absolute top-3 right-3 bg-white text-[#e63946] text-xs font-bold px-3 py-1 rounded-full shadow-md z-10">
                    Featured
                  </div>
                )}
              </div>
              
              {/* Title and Price Below Image */}
              <div className="p-4 border-b border-gray-200">
                <h3 className="text-xl font-bold text-gray-800">{subscription.title}</h3>
                <div className="mt-1">
                  <span className="text-lg font-medium text-[#e63946]">
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
                    <div className="flex-shrink-0 w-5 h-5 rounded-full bg-[#e63946] flex items-center justify-center text-white text-xs">
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
                    className="block w-full text-center py-3 px-4 border-2 border-[#e63946] text-[#e63946] hover:bg-[#e63946] hover:text-white rounded-lg transition-colors font-medium"
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

export default HairLossSubscriptionGrid;