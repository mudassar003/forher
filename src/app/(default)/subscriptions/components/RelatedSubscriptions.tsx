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
  
  // Format currency - show only main price without monthly equivalent
  const formatPrice = (subscription: Partial<Subscription>): string => {
    if (subscription.price === undefined) return '';
    
    const formattedPrice = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(subscription.price);

    // Get billing period display
    let periodDisplay: string = '';
    switch (subscription.billingPeriod) {
      case 'monthly':
        periodDisplay = currentLanguage === 'es' ? '/mes' : '/month';
        break;
      case 'three_month':
        periodDisplay = currentLanguage === 'es' ? '/3 meses' : '/3 months';
        break;
      case 'six_month':
        periodDisplay = currentLanguage === 'es' ? '/6 meses' : '/6 months';
        break;
      case 'annually':
        periodDisplay = currentLanguage === 'es' ? '/año' : '/year';
        break;
      case 'other':
        if (subscription.customBillingPeriodMonths && subscription.customBillingPeriodMonths > 1) {
          periodDisplay = currentLanguage === 'es' ? `/${subscription.customBillingPeriodMonths} meses` : `/${subscription.customBillingPeriodMonths} months`;
        } else {
          periodDisplay = currentLanguage === 'es' ? '/mes' : '/month';
        }
        break;
      default:
        if (subscription.billingPeriod) {
          periodDisplay = `/${subscription.billingPeriod}`;
        }
    }

    return `${formattedPrice}${periodDisplay}`;
  };
  
  // Prepare image URL or fallback
  const getImageUrl = (subscription: Partial<Subscription>): string => {
    // First check for featuredImage for catalog display
    if (subscription.featuredImage) {
      return urlFor(subscription.featuredImage).width(600).height(400).url();
    }
    // Fall back to regular image
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
              className="bg-white rounded-xl shadow-md overflow-hidden transition-all duration-300 hover:shadow-xl border border-[#e63946] hover:transform hover:-translate-y-2"
              whileHover={{ y: -5 }}
              transition={{ duration: 0.3 }}
            >
              {/* Image */}
              <div className="w-full">
                <div className="relative h-72 w-full overflow-hidden">
                  <Image
                    src={getImageUrl(subscription)}
                    alt={getLocalizedTitle(subscription)}
                    fill
                    className="object-cover hover:scale-105 transition-transform duration-500"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 400px"
                    style={{ objectPosition: 'center' }}
                  />
                  
                  {/* No Featured Badge - removed for consistency */}
                </div>
                
                {/* Title and Price Below Image */}
                <div className="p-4 border-b border-[#e63946]">
                  <h3 className="text-xl font-bold text-gray-800">
                    {getLocalizedTitle(subscription)}
                  </h3>
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
                      {translations.viewPlan}
                    </Link>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default RelatedSubscriptions;