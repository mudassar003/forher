// src/app/c/wm/components/FeaturedSubscriptionCard.tsx
"use client";

import { useState, useEffect } from "react";
import { groq } from 'next-sanity';
import { client } from '@/sanity/lib/client';
import { motion } from "framer-motion";
import Link from "next/link";
import { Subscription } from '@/types/subscription-page';

interface FeaturedSubscriptionCardProps {
  className?: string;
}

const FeaturedSubscriptionCard: React.FC<FeaturedSubscriptionCardProps> = ({ 
  className = "" 
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [featuredSubscription, setFeaturedSubscription] = useState<Subscription | null>(null);

  useEffect(() => {
    const fetchFeaturedSubscription = async () => {
      try {
        setIsLoading(true);
        
        // Query for weight loss subscription that is marked as featured
        // If none is marked as featured, get the first weight loss subscription
        const subscriptions: Subscription[] = await client.fetch(
          groq`*[
            _type == "subscription" && 
            references(*[_type == "subscriptionCategory" && slug.current == "weight-loss"]._id) && 
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
        
        // FIX: Check if subscriptions exists and is not an array
        if (subscriptions) {
          // Since the query returns a single item, we can set it directly
          setFeaturedSubscription(subscriptions);
        }
      } catch (err) {
        console.error("Error fetching featured subscription:", err);
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
        <div className="bg-gradient-to-r from-[#e63946] to-[#ff4d6d] p-6 text-white">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
            <h3 className="text-2xl font-bold">Weight Loss Subscription</h3>
            <span className="px-3 py-1 bg-white text-[#e63946] text-sm font-semibold rounded-full inline-block w-max">Recommended</span>
          </div>
          <p className="opacity-90 mt-1">Personalized weight management program</p>
        </div>
        
        <div className="p-6">
          <div className="mb-4">
            <div className="flex items-center justify-between mb-4">
              <span className="text-3xl font-bold">$199</span>
              <span className="px-3 py-1 bg-[#e63946] text-white text-sm rounded-full">Recommended</span>
            </div>
            
            <p className="text-gray-600 mb-6">Our weight loss program includes personalized treatment, expert guidance, and ongoing support to help you achieve sustainable results.</p>
          </div>
          
          <div className="space-y-3 mb-6">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-6 h-6 rounded-full bg-[#f9dde5] flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="#e63946" className="w-4 h-4">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
              <span className="text-gray-700">Personalized weight management</span>
            </div>
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-6 h-6 rounded-full bg-[#f9dde5] flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="#e63946" className="w-4 h-4">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
              <span className="text-gray-700">Medical provider support</span>
            </div>
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-6 h-6 rounded-full bg-[#f9dde5] flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="#e63946" className="w-4 h-4">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
              <span className="text-gray-700">Digital tracking tools</span>
            </div>
          </div>
          
          <button className="w-full bg-black text-white font-semibold py-3 px-6 rounded-full hover:bg-gray-900 transition-colors">
            Subscribe Now
          </button>
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
      <div className="bg-gradient-to-r from-[#e63946] to-[#ff4d6d] p-6 text-white">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
          <h3 className="text-2xl font-bold">{featuredSubscription.title}</h3>
          <span className="px-3 py-1 bg-white text-[#e63946] text-sm font-semibold rounded-full inline-block w-max">Recommended</span>
        </div>
        <p className="opacity-90 mt-1">Personalized weight management program</p>
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
              <div className="flex-shrink-0 w-6 h-6 rounded-full bg-[#f9dde5] flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="#e63946" className="w-4 h-4">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
              <span className="text-gray-700">{feature.featureText}</span>
            </div>
          ))}
        </div>
        
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

export default FeaturedSubscriptionCard;