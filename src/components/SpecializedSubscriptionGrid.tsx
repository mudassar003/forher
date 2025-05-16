// src/components/SpecializedSubscriptionGrid.tsx
'use client';

import { useEffect, useState } from 'react';
import { Subscription, SubscriptionCategory } from '@/types/subscription-page';
import useTranslations from '@/hooks/useTranslations';
import SubscriptionCard from '@/app/(default)/subscriptions/components/SubscriptionCard';

interface SpecializedSubscriptionGridProps {
  categorySlug: string; // The slug of the category to filter by
  subscriptions: Subscription[]; // All subscriptions
  categories: SubscriptionCategory[]; // All categories
  loading?: boolean;
  error?: string | null;
  title?: string;
}

const SpecializedSubscriptionGrid: React.FC<SpecializedSubscriptionGridProps> = ({
  categorySlug,
  subscriptions,
  categories,
  loading = false,
  error = null,
  title
}) => {
  const [filteredSubscriptions, setFilteredSubscriptions] = useState<Subscription[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<SubscriptionCategory | null>(null);
  const { t, currentLanguage } = useTranslations();

  // Filter subscriptions based on the category slug
  useEffect(() => {
    // Find the category by slug
    const category = categories.find(cat => cat.slug.current === categorySlug);
    
    if (category) {
      setSelectedCategory(category);
      
      // Filter subscriptions that belong to this category
      const filtered = subscriptions.filter(subscription => 
        subscription.categories?.some(cat => cat._id === category._id)
      );
      
      setFilteredSubscriptions(filtered);
    } else {
      // If category not found, show an empty array
      setFilteredSubscriptions([]);
      setSelectedCategory(null);
    }
  }, [categorySlug, subscriptions, categories]);

  // Get localized category title
  const getLocalizedCategoryTitle = (category: SubscriptionCategory): string => {
    if (currentLanguage === 'es' && category.titleEs) {
      return category.titleEs;
    }
    return category.title;
  };

  // Get localized category description
  const getLocalizedCategoryDescription = (category: SubscriptionCategory): string | undefined => {
    if (currentLanguage === 'es' && category.descriptionEs) {
      return category.descriptionEs;
    }
    return category.description;
  };

  // Assign card type based on position in grid
  const getCardType = (index: number) => {
    const types = ['basic', 'premium', 'standard'] as const;
    return types[index % 3];
  };

  if (loading) {
    return (
      <div className="container mx-auto py-12 px-4 sm:px-6 lg:px-8 relative">
        <div className="absolute top-1/4 left-10 w-32 h-32 rounded-full bg-[#ffe6f0] opacity-20 blur-2xl"></div>
        <div className="absolute bottom-1/4 right-10 w-40 h-40 rounded-full bg-[#f0f7ff] opacity-10 blur-2xl"></div>
        
        <div className="text-center relative z-10">
          <div className="w-16 h-16 mx-auto mb-4 border-4 border-[#e63946] border-t-transparent rounded-full animate-spin"></div>
          <h2 className="text-lg text-gray-600">
            {t('subscriptions.loadingPlans')}
          </h2>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto py-12 px-4 sm:px-6 lg:px-8 relative">
        <div className="absolute top-1/3 left-1/4 w-32 h-32 rounded-full bg-[#ffe6f0] opacity-10 blur-2xl"></div>
        
        <div className="max-w-lg mx-auto p-6 bg-red-50 rounded-lg text-center relative z-10">
          <svg className="w-12 h-12 text-[#e63946] mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h2 className="text-lg font-medium text-red-800 mb-2">
            {t('subscriptions.somethingWrong')}
          </h2>
          <p className="text-red-600">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-[#e63946] text-white rounded-md hover:bg-[#d52d3a] transition-colors"
          >
            {t('subscriptions.tryAgain')}
          </button>
        </div>
      </div>
    );
  }

  if (filteredSubscriptions.length === 0) {
    return (
      <div className="container mx-auto py-12 px-4 sm:px-6 lg:px-8 relative">
        <div className="absolute top-1/4 right-1/4 w-40 h-40 rounded-full bg-[#f9dde5] opacity-20 blur-2xl"></div>
        
        <div className="text-center relative z-10">
          <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
          </svg>
          <h2 className="text-xl font-medium text-gray-800 mb-4">
            {t('subscriptions.noPlans')}
          </h2>
          <p className="text-gray-600">
            {t('subscriptions.checkBackLater')}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Category Header */}
      {selectedCategory && (
        <div className="mb-8 relative z-10">
          {/* Decorative elements */}
          <div className="absolute top-0 left-1/4 w-36 h-36 rounded-full bg-[#f0f7ff] opacity-20 blur-2xl"></div>
          <div className="absolute bottom-10 right-1/4 w-24 h-24 rounded-full bg-[#ffeef2] opacity-30 blur-xl"></div>
          
          <h2 className="text-2xl font-bold text-center text-[#e63946]">
            <span className="inline-block relative pb-2 after:content-[''] after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-[#e63946]">
              {title || getLocalizedCategoryTitle(selectedCategory)}
            </span>
          </h2>
          {getLocalizedCategoryDescription(selectedCategory) && (
            <p className="mt-3 text-center text-gray-600 max-w-3xl mx-auto">
              {getLocalizedCategoryDescription(selectedCategory)}
            </p>
          )}
        </div>
      )}
      
      {/* Subscription Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 relative z-10">
        {filteredSubscriptions.map((subscription, index) => (
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
            cardType={getCardType(index)}
          />
        ))}
      </div>
    </div>
  );
};

export default SpecializedSubscriptionGrid;