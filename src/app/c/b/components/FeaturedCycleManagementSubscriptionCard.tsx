//src/app/c/b/components/FeaturedCycleManagementSubscriptionCard.tsx
"use client";

import { useState, useEffect } from "react";
import { groq } from 'next-sanity';
import { client } from '@/sanity/lib/client';
import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { Subscription } from '@/types/subscription-page';
import { urlFor } from '@/sanity/lib/image';

interface FeaturedCycleManagementSubscriptionCardProps {
  className?: string;
}

const FeaturedCycleManagementSubscriptionCard: React.FC<FeaturedCycleManagementSubscriptionCardProps> = ({ 
  className = "" 
}) => {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [featuredSubscription, setFeaturedSubscription] = useState<Subscription | null>(null);
  const [imageUrl, setImageUrl] = useState<string>('/images/cycle-management-product.jpg'); // Default fallback image

  useEffect(() => {
    const fetchFeaturedSubscription = async (): Promise<void> => {
      try {
        setIsLoading(true);
        
        // Query for cycle management subscription that is marked as featured
        // If none is marked as featured, get the first cycle management subscription
        const result = await client.fetch(
          groq`*[
            _type == "subscription" && 
            references(*[_type == "subscriptionCategory" && slug.current == "cycle-management"]._id) && 
            isActive == true && 
            isDeleted != true
          ] | order(isFeatured desc) [0] {
            _id,
            title,
            titleEs,
            slug,
            description,
            descriptionEs,
            price,
            billingPeriod,
            features,
            featuresEs,
            image,
            featuredImage,
            isActive,
            isFeatured,
            stripePriceId,
            "categories": categories[]->{ 
              _id, 
              title, 
              titleEs,
              slug
            }
          }`
        );
        
        // Important fix: The GROQ query with [0] at the end should return a single object,
        // but TypeScript still sees it as an array. We need to explicitly cast it.
        if (result) {
          // Cast the result to Subscription (not an array)
          const subscription = result as Subscription;
          setFeaturedSubscription(subscription);
          
          // Set the image URL based on available images
          if (subscription.featuredImage) {
            setImageUrl(urlFor(subscription.featuredImage).width(800).height(600).url());
          } else if (subscription.image) {
            setImageUrl(urlFor(subscription.image).width(800).height(600).url());
          }
        }
      } catch (err) {
        console.error("Error fetching featured cycle management subscription:", err);
        setError(err instanceof Error ? err.message : "An unknown error occurred");
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchFeaturedSubscription();
  }, []);

  // Get the billing period display
  const getBillingPeriodDisplay = (period: string): string => {
    switch (period.toLowerCase()) {
      case 'monthly':
        return '/month';
      case 'quarterly':
        return '/quarter';
      case 'annually':
        return '/year';
      default:
        return `/${period}`;
    }
  };

  // Format currency
  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  if (isLoading) {
    return (
      <div className={`w-full flex justify-center items-center py-12 ${className}`}>
        <div className="w-16 h-16 border-4 border-gray-300 border-t-[#fe92b5] rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error || !featuredSubscription) {
    // Fallback static card when there's an error or no subscription found
    return (
      <div className={`bg-white rounded-2xl shadow-xl overflow-hidden ${className}`}>
        <div className="bg-gradient-to-r from-[#fe92b5] to-[#ff92b5] p-6 text-white">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
            <h3 className="text-2xl font-bold">Cycle Management Subscription</h3>
            <span className="px-3 py-1 bg-white text-[#fe92b5] text-sm font-semibold rounded-full inline-block w-max">Coming Soon</span>
          </div>
          <p className="opacity-90 mt-1">Personalized cycle management program</p>
        </div>
        
        <div className="p-6">
          <div className="mb-4 text-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-gray-400 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
            <h4 className="text-xl font-semibold text-black mb-2">No Cycle Management Plans Available Yet</h4>
            <p className="text-gray-600 mb-6">
              We're working on bringing you personalized cycle management plans. Thank you for completing our assessment - your responses help us develop better solutions for your needs.
            </p>
          </div>
          
          <div className="space-y-3 mb-6">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-6 h-6 rounded-full bg-[#ffe6f0] flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="#fe92b5" className="w-4 h-4">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
              <span className="text-gray-700">Personalized cycle management</span>
            </div>
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-6 h-6 rounded-full bg-[#ffe6f0] flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="#fe92b5" className="w-4 h-4">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
              <span className="text-gray-700">Expert healthcare provider support</span>
            </div>
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-6 h-6 rounded-full bg-[#ffe6f0] flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="#fe92b5" className="w-4 h-4">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
              <span className="text-gray-700">Convenient home delivery</span>
            </div>
          </div>
          
          <Link href="/subscriptions">
            <motion.button 
              className="w-full bg-black text-white font-semibold py-4 px-6 rounded-full text-lg hover:bg-gray-900 transition-colors"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Browse All Subscriptions
            </motion.button>
          </Link>
          
          <p className="text-center text-gray-500 text-sm mt-4">
            Be the first to know when our cycle management plans launch
          </p>
        </div>
      </div>
    );
  }

  return (
    <motion.div 
      className={`bg-white rounded-2xl shadow-xl overflow-hidden ${className}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="bg-gradient-to-r from-[#fe92b5] to-[#ff92b5] p-6 text-white">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
          <h3 className="text-2xl font-bold">{featuredSubscription.title}</h3>
          <span className="px-3 py-1 bg-white text-[#fe92b5] text-sm font-semibold rounded-full inline-block w-max">Recommended</span>
        </div>
        <p className="opacity-90 mt-1">Personalized cycle management program</p>
      </div>
      
      <div className="p-6">
        <div className="mb-6">
          <div className="flex items-center mb-4">
            <span className="text-3xl font-bold">{formatCurrency(featuredSubscription.price)}</span>
            <span className="text-gray-600 ml-1">{getBillingPeriodDisplay(featuredSubscription.billingPeriod)}</span>
          </div>
          
          {/* Description */}
          {featuredSubscription.description && Array.isArray(featuredSubscription.description) && (
            <div className="text-gray-700 mb-6">
              {/* For BlockContent - just display first paragraph for simplicity */}
              {featuredSubscription.description[0]?.children?.map((child: any, index: number) => (
                <p key={index}>{child.text}</p>
              ))}
            </div>
          )}
        </div>
        
        {/* Features */}
        <div className="space-y-3 mb-8">
          {featuredSubscription.features && featuredSubscription.features.map((feature, index) => (
            <div key={index} className="flex items-start gap-3">
              <div className="flex-shrink-0 w-6 h-6 rounded-full bg-[#ffe6f0] flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="#fe92b5" className="w-4 h-4">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
              <span className="text-gray-700">{feature.featureText}</span>
            </div>
          ))}
        </div>
        
        {/* View Details Button */}
        {featuredSubscription.slug && featuredSubscription.slug.current && (
          <div className="mb-4">
            <Link 
              href={`/subscriptions/${featuredSubscription.slug.current}`}
              className="block w-full text-center border border-[#fe92b5] text-[#fe92b5] font-semibold py-3 px-6 rounded-full hover:bg-[#fff5f7] transition-colors mb-4"
            >
              View Plan Details
            </Link>
          </div>
        )}
        
        {/* CTA Button */}
        <Link href={featuredSubscription.stripePriceId ? `/checkout?plan=${featuredSubscription._id}` : `/subscriptions/${featuredSubscription.slug?.current}`}>
          <motion.button 
            className="w-full bg-black text-white font-semibold py-4 px-6 rounded-full text-lg hover:bg-gray-900 transition-colors"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            Subscribe Now
          </motion.button>
        </Link>
        
        <p className="text-center text-gray-500 text-sm mt-4">
          30-day satisfaction guarantee • Cancel anytime
        </p>
      </div>
    </motion.div>
  );
};

export default FeaturedCycleManagementSubscriptionCard;