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
  
  return (
    <section className="py-12 bg-gray-50">
      <div className="container mx-auto px-4 max-w-6xl">
        <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-8 text-center">
          {currentLanguage === 'es' ? 'Planes Relacionados' : 'Related Subscription Plans'}
        </h2>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
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