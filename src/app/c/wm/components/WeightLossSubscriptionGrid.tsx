// src/app/c/wm/components/WeightLossSubscriptionGrid.tsx
"use client";

import { useState, useEffect } from "react";
import { groq } from 'next-sanity';
import { client } from '@/sanity/lib/client';
import { Subscription, SubscriptionCategory } from '@/types/subscription-page';
import SubscriptionCard from '@/app/(default)/subscriptions/components/SubscriptionCard';

interface WeightLossSubscriptionGridProps {
  className?: string;
}

const WeightLossSubscriptionGrid: React.FC<WeightLossSubscriptionGridProps> = ({ 
  className = "" 
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [weightLossSubscriptions, setWeightLossSubscriptions] = useState<Subscription[]>([]);
  const [category, setCategory] = useState<SubscriptionCategory | null>(null);

  useEffect(() => {
    const fetchWeightLossSubscriptions = async () => {
      try {
        setIsLoading(true);
        
        // Find the weight-loss category first
        const categoriesResult = await client.fetch(
          groq`*[_type == "subscriptionCategory" && slug.current == "weight-loss"]{
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
          // Weight loss category not found
          setError("Weight loss category not found. Please check your Sanity schema.");
          setIsLoading(false);
          return;
        }
        
        const weightLossCategory = categories[0];
        setCategory(weightLossCategory);
        
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
            features,
            featuresEs,
            image,
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
          { categoryId: weightLossCategory._id }
        );
        
        // Properly cast the result
        const subscriptions = subscriptionsResult as Subscription[];
        setWeightLossSubscriptions(subscriptions);
      } catch (err) {
        console.error("Error fetching weight loss subscriptions:", err);
        setError(err instanceof Error ? err.message : "An unknown error occurred");
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchWeightLossSubscriptions();
  }, []);

  // Assign card type based on position in grid
  const getCardType = (index: number) => {
    const types = ['basic', 'premium', 'standard'] as const;
    return types[index % 3];
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

  if (weightLossSubscriptions.length === 0) {
    return (
      <div className={`w-full py-8 text-center ${className}`}>
        <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-gray-400 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
        </svg>
        <h3 className="text-xl font-medium text-gray-700 mb-2">No Subscription Plans Available</h3>
        <p className="text-gray-500">
          We couldn't find any active weight loss subscription plans at this time. Please check back later.
        </p>
      </div>
    );
  }

  return (
    <div className={`w-full ${className}`}>
      {/* Subscription grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
        {weightLossSubscriptions.map((subscription, index) => (
          <SubscriptionCard 
            key={subscription._id}
            id={subscription._id}
            title={subscription.title}
            titleEs={subscription.titleEs}
            description={subscription.description}
            descriptionEs={subscription.descriptionEs}
            price={subscription.price}
            billingPeriod={subscription.billingPeriod}
            features={subscription.features || []}
            featuresEs={subscription.featuresEs || []}
            categories={subscription.categories}
            slug={subscription.slug}
            cardType={getCardType(index)}
          />
        ))}
      </div>
    </div>
  );
};

export default WeightLossSubscriptionGrid;