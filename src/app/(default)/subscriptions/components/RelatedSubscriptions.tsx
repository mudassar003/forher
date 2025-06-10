// src/app/(default)/subscriptions/components/RelatedSubscriptions.tsx
"use client";

import React from 'react';
import { Subscription } from '@/types/subscription-page';
import useTranslations from '@/hooks/useTranslations';
import SubscriptionCard from './SubscriptionCard';

interface RelatedSubscriptionsProps {
  subscriptions: Subscription[];
}

const RelatedSubscriptions: React.FC<RelatedSubscriptionsProps> = ({ subscriptions }) => {
  const { currentLanguage } = useTranslations();
  
  if (!subscriptions || subscriptions.length === 0) {
    return null;
  }
  
  // Get card type based on position in grid
  const getCardType = (index: number): 'basic' | 'standard' | 'premium' => {
    const types: ('basic' | 'standard' | 'premium')[] = ['basic', 'premium', 'standard'];
    return types[index % 3];
  };

  // Get grid classes based on number of items to center them
  const getGridClasses = (): string => {
    const count = subscriptions.length;
    
    if (count === 1) {
      return 'grid grid-cols-1 max-w-sm mx-auto';
    } else if (count === 2) {
      return 'grid grid-cols-1 sm:grid-cols-2 max-w-2xl mx-auto gap-6';
    } else if (count === 3) {
      return 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 max-w-5xl mx-auto gap-6';
    } else {
      // For 4+ items, use responsive grid that centers content
      return 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 max-w-7xl mx-auto gap-6';
    }
  };
  
  return (
    <section className="py-12 bg-gray-50">
      <div className="container mx-auto px-4">
        <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-8 text-center">
          {currentLanguage === 'es' ? 'Planes Relacionados' : 'Related Subscription Plans'}
        </h2>
        
        <div className={getGridClasses()}>
          {subscriptions.map((subscription, index) => (
            <SubscriptionCard
              key={subscription._id || `related-${index}`}
              id={subscription._id || ''}
              title={subscription.title || ''}
              titleEs={subscription.titleEs}
              description={subscription.description}
              descriptionEs={subscription.descriptionEs}
              price={subscription.price || 0}
              billingPeriod={subscription.billingPeriod || 'monthly'}
              customBillingPeriodMonths={subscription.customBillingPeriodMonths}
              hasVariants={subscription.hasVariants || false}
              variants={subscription.variants || []}
              features={subscription.features || []}
              featuresEs={subscription.featuresEs || []}
              categories={subscription.categories}
              slug={subscription.slug}
              cardType={getCardType(index)}
              image={subscription.image}
              featuredImage={subscription.featuredImage}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default RelatedSubscriptions;