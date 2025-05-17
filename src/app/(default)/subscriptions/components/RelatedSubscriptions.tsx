// src/app/(default)/subscriptions/components/RelatedSubscriptions.tsx
"use client";

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Subscription } from '@/types/subscription-page';
import useTranslations from '@/hooks/useTranslations';
import { urlFor } from '@/sanity/lib/image';

interface RelatedSubscriptionsProps {
  subscriptions: Partial<Subscription>[];
}

const RelatedSubscriptions: React.FC<RelatedSubscriptionsProps> = ({ subscriptions }) => {
  const { t, currentLanguage } = useTranslations();
  
  // Custom translations
  const translations = {
    relatedPlans: currentLanguage === 'es' ? 'Planes Relacionados' : 'Related Subscription Plans',
    viewPlan: currentLanguage === 'es' ? 'Ver Plan' : 'View Plan',
    featured: currentLanguage === 'es' ? 'Destacado' : 'Featured'
  };
  
  if (!subscriptions || subscriptions.length === 0) {
    return null;
  }
  
  // Get localized title
  const getLocalizedTitle = (subscription: Partial<Subscription>): string => {
    if (currentLanguage === 'es' && subscription.titleEs) {
      return subscription.titleEs;
    }
    return subscription.title || '';
  };
  
  // Format currency
  const formatCurrency = (amount: number | undefined): string => {
    if (amount === undefined) return '';
    
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };
  
  // Determine proper billing period display
  const getBillingPeriodDisplay = (period: string | undefined): string => {
    if (!period) return '';
    
    if (currentLanguage === 'es') {
      switch (period.toLowerCase()) {
        case 'monthly': return '/mes';
        case 'quarterly': return '/trimestre';
        case 'annually': return '/año';
        default: return `/${period}`;
      }
    } else {
      switch (period.toLowerCase()) {
        case 'monthly': return '/month';
        case 'quarterly': return '/quarter';
        case 'annually': return '/year';
        default: return `/${period}`;
      }
    }
  };
  
  // Prepare image URL or fallback
  const getImageUrl = (subscription: Partial<Subscription>): string => {
    if (subscription.image) {
      return urlFor(subscription.image).width(600).height(400).url();
    }
    return '/images/subscription-placeholder.jpg';
  };
  
  return (
    <section className="py-12 bg-gray-50">
      <div className="container mx-auto px-4 max-w-6xl">
        <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-8 text-center">
          {translations.relatedPlans}
        </h2>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {subscriptions.map((subscription) => (
            <motion.div
              key={subscription._id}
              className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
              whileHover={{ y: -5 }}
              transition={{ duration: 0.3 }}
            >
              {/* Image if available */}
              <div className="relative h-48 w-full">
                <Image
                  src={getImageUrl(subscription)}
                  alt={getLocalizedTitle(subscription)}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 400px"
                />
                
                {/* Featured badge */}
                {subscription.isFeatured && (
                  <div className="absolute top-0 right-0 bg-[#e63946] text-white text-xs font-bold px-3 py-1 m-2 rounded-full">
                    {translations.featured}
                  </div>
                )}
              </div>
              
              <div className="p-5">
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  {getLocalizedTitle(subscription)}
                </h3>
                
                {/* Price */}
                {subscription.price !== undefined && (
                  <p className="text-[#e63946] font-bold text-lg mb-3">
                    {formatCurrency(subscription.price)}
                    <span className="text-sm text-gray-600 font-normal">
                      {getBillingPeriodDisplay(subscription.billingPeriod)}
                    </span>
                  </p>
                )}
                
                {/* Link to details */}
                {subscription.slug && subscription.slug.current && (
                  <Link
                    href={`/subscriptions/${subscription.slug.current}`}
                    className="inline-block w-full text-center bg-gray-800 hover:bg-[#e63946] text-white font-medium py-2 px-4 mt-2 rounded-md transition-colors"
                  >
                    {translations.viewPlan}
                  </Link>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default RelatedSubscriptions;