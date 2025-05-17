// src/app/(default)/subscriptions/components/SubscriptionGrid.tsx
'use client';

import { useEffect, useState } from 'react';
import SubscriptionCard from './SubscriptionCard';
import { SubscriptionsData, Subscription, SubscriptionCategory } from '@/types/subscription-page';
import useTranslations from '@/hooks/useTranslations';

interface SubscriptionGridProps extends SubscriptionsData {}

const SubscriptionGrid: React.FC<SubscriptionGridProps> = ({
  categories,
  subscriptionsByCategory,
  uncategorizedSubscriptions,
  featuredSubscriptions,
  allSubscriptions,
  error
}) => {
  const [loading, setLoading] = useState(false);
  const { t, currentLanguage } = useTranslations();

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

  // FALLBACK: If no categories were found, just show all subscriptions
  if (categories.length === 0 && allSubscriptions.length > 0) {
    return (
      <div className="container mx-auto px-4 py-12 relative">
        {/* Decorative elements */}
        <div className="absolute top-10 left-0 w-32 h-32 rounded-full bg-[#ffe6f0] opacity-30 blur-2xl"></div>
        <div className="absolute bottom-10 right-10 w-40 h-40 rounded-full bg-[#f9dde5] opacity-20 blur-2xl"></div>
        
        <h2 className="text-3xl font-bold mb-8 text-center relative z-10 text-[#e63946]">
          <span className="inline-block relative pb-2 after:content-[''] after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-[#e63946]">
            {currentLanguage === 'es' ? t('subscriptions.ourPlans') : t('subscriptions.ourPlans')}
          </span>
        </h2>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 relative z-10">
          {allSubscriptions.map((subscription, index) => (
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
  }

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

  if (allSubscriptions.length === 0) {
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
      {/* Featured Subscriptions Section - Always at the top */}
      {featuredSubscriptions.length > 0 && (
        <div className="mb-16 relative">
          {/* Decorative elements for featured section */}
          <div className="absolute -top-5 left-10 w-20 h-20 rounded-full bg-[#ffedf0] opacity-40 blur-xl"></div>
          <div className="absolute bottom-10 right-0 w-40 h-40 rounded-full bg-[#f0f7ff] opacity-30 blur-2xl"></div>
          
          <h2 className="text-3xl font-bold mb-8 text-center relative z-10 text-[#e63946]">
            <span className="inline-block relative pb-2 after:content-[''] after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-[#e63946]">
              {t('subscriptions.featuredPlans')}
            </span>
          </h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 relative z-10">
            {featuredSubscriptions.map((subscription, index) => (
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
      )}
      
      {/* Display subscriptions by category */}
      {categories.map((category, categoryIndex) => {
        const categorySubscriptions = subscriptionsByCategory[category._id] || [];
        
        // Only render category section if it has subscriptions
        if (categorySubscriptions.length === 0) return null;
        
        return (
          <div key={category._id} className="mb-16 relative">
            {/* Alternating decorative bubbles for each category section */}
            {categoryIndex % 2 === 0 ? (
              <>
                <div className="absolute top-10 right-0 w-32 h-32 rounded-full bg-[#ffe6f0] opacity-20 blur-2xl"></div>
                <div className="absolute bottom-0 left-10 w-40 h-40 rounded-full bg-[#f9dde5] opacity-10 blur-xl"></div>
              </>
            ) : (
              <>
                <div className="absolute top-0 left-1/4 w-36 h-36 rounded-full bg-[#f0f7ff] opacity-20 blur-2xl"></div>
                <div className="absolute bottom-10 right-1/4 w-24 h-24 rounded-full bg-[#ffeef2] opacity-30 blur-xl"></div>
              </>
            )}
            
            <div className="mb-8 relative z-10">
              <h2 className="text-2xl font-bold text-center text-[#e63946]">
                <span className="inline-block relative pb-2 after:content-[''] after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-[#e63946]">
                  {getLocalizedCategoryTitle(category)}
                </span>
              </h2>
              {getLocalizedCategoryDescription(category) && (
                <p className="mt-3 text-center text-gray-600 max-w-3xl mx-auto">
                  {getLocalizedCategoryDescription(category)}
                </p>
              )}
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 relative z-10">
              {categorySubscriptions.map((subscription, index) => (
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
      })}
      
      {/* Display uncategorized subscriptions if any */}
      {uncategorizedSubscriptions.length > 0 && (
        <div className="mb-16 relative">
          {/* Decorative elements for uncategorized section */}
          <div className="absolute top-0 right-1/3 w-32 h-32 rounded-full bg-[#ffedf0] opacity-30 blur-2xl"></div>
          <div className="absolute bottom-10 left-1/3 w-28 h-28 rounded-full bg-[#f0f7ff] opacity-20 blur-xl"></div>
          
          <h2 className="text-2xl font-bold mb-8 text-center relative z-10 text-[#e63946]">
            <span className="inline-block relative pb-2 after:content-[''] after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-[#e63946]">
              {t('subscriptions.otherPlans')}
            </span>
          </h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 relative z-10">
            {uncategorizedSubscriptions.map((subscription, index) => (
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
      )}
    </div>
  );
};

export default SubscriptionGrid;