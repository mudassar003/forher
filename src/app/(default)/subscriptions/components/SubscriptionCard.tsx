// src/app/(default)/subscriptions/components/SubscriptionCard.tsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { SubscriptionFeature, BlockContent, SubscriptionVariant } from '@/types/subscription-page';
import useTranslations from '@/hooks/useTranslations';
import Modal from '@/components/Modal';
import PortableText from '@/components/PortableText';
import { urlFor } from '@/sanity/lib/image';
import { SanityImageSource } from '@sanity/image-url/lib/types/types';

interface SubscriptionCardProps {
  id: string;
  title: string;
  titleEs?: string;
  description?: BlockContent[]; 
  descriptionEs?: BlockContent[]; 
  price: number;
  billingPeriod: string;
  customBillingPeriodMonths?: number | null;
  hasVariants?: boolean;
  variants?: SubscriptionVariant[];
  features: SubscriptionFeature[];
  featuresEs?: SubscriptionFeature[];
  categories?: Array<{
    _id: string;
    title: string;
    titleEs?: string;
    slug?: {
      current: string;
    };
  }>;
  cardType?: 'basic' | 'standard' | 'premium';
  slug?: {
    current: string;
  };
  image?: SanityImageSource;
  featuredImage?: SanityImageSource;
}

const SubscriptionCard: React.FC<SubscriptionCardProps> = ({
  id,
  title,
  titleEs,
  description,
  descriptionEs,
  price,
  billingPeriod,
  customBillingPeriodMonths,
  hasVariants = false,
  variants = [],
  features = [],
  featuresEs = [],
  categories,
  cardType = 'basic',
  slug,
  image,
  featuredImage
}) => {
  const [isHovered, setIsHovered] = useState<boolean>(false);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  
  const { t, currentLanguage } = useTranslations();

  // Get the content based on current language
  const getLocalizedTitle = (): string => {
    if (currentLanguage === 'es' && titleEs) {
      return titleEs;
    }
    return title;
  };
  
  const getLocalizedDescription = (): BlockContent[] | undefined => {
    if (currentLanguage === 'es' && descriptionEs && descriptionEs.length > 0) {
      return descriptionEs;
    }
    return description;
  };
  
  const getLocalizedFeatures = (): SubscriptionFeature[] => {
    if (currentLanguage === 'es' && featuresEs && featuresEs.length > 0) {
      return featuresEs;
    }
    return features;
  };

  // Get the price and billing details to use (default variant or base subscription)
  const getPriceDetails = (): { price: number; billingPeriod: string; customBillingPeriodMonths?: number | null } => {
    // If has variants, look for default variant first
    if (hasVariants && variants && variants.length > 0) {
      const defaultVariant = variants.find(variant => variant.isDefault);
      if (defaultVariant) {
        return {
          price: defaultVariant.price,
          billingPeriod: defaultVariant.billingPeriod,
          customBillingPeriodMonths: defaultVariant.customBillingPeriodMonths
        };
      }
    }
    
    // Fall back to base subscription price
    return {
      price,
      billingPeriod,
      customBillingPeriodMonths
    };
  };

  // Format price - show monthly equivalent
  const getFormattedPrice = (): string => {
    const priceDetails = getPriceDetails();
    const subscriptionPrice = priceDetails.price;
    const period = priceDetails.billingPeriod;
    const customMonths = priceDetails.customBillingPeriodMonths;

    // Calculate monthly equivalent
    let monthlyPrice: number;
    switch (period) {
      case 'monthly':
        monthlyPrice = subscriptionPrice;
        break;
      case 'three_month':
        monthlyPrice = subscriptionPrice / 3;
        break;
      case 'six_month':
        monthlyPrice = subscriptionPrice / 6;
        break;
      case 'annually':
        monthlyPrice = subscriptionPrice / 12;
        break;
      case 'other':
        if (customMonths && customMonths > 1) {
          monthlyPrice = subscriptionPrice / customMonths;
        } else {
          monthlyPrice = subscriptionPrice;
        }
        break;
      default:
        monthlyPrice = subscriptionPrice;
    }

    const formattedPrice = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(monthlyPrice);

    const monthText = currentLanguage === 'es' ? '/mes' : '/month';
    return `${formattedPrice}${monthText}`;
  };

  // Check if description exists and has content
  const hasDescription = (): boolean => {
    const localizedDescription = getLocalizedDescription();
    
    if (!localizedDescription || !Array.isArray(localizedDescription) || localizedDescription.length === 0) {
      return false;
    }
    
    return localizedDescription.some(block => 
      block && block.children && Array.isArray(block.children) && 
      block.children.some(child => child && child.text && child.text.trim().length > 0)
    );
  };

  // Get view details text
  const getViewDetailsText = (): string => {
    return currentLanguage === 'es' ? 'Ver Detalles' : 'View Details';
  };

  // Get image URL or fallback
  const getImageUrl = (): string => {
    if (featuredImage) {
      return urlFor(featuredImage).width(600).height(450).url();
    }
    if (image) {
      return urlFor(image).width(600).height(450).url();
    }
    
    const fallbackImages: Record<string, string> = {
      'basic': '/images/subscription-basic.jpg',
      'standard': '/images/subscription-standard.jpg',
      'premium': '/images/subscription-premium.jpg'
    };
    
    return fallbackImages[cardType] || '/images/subscription-placeholder.jpg';
  };

  // All cards use same color - E63946
  const getBorderColor = (): string => {
    return 'border-[#e63946]';
  };

  return (
    <>
      <div 
        className={`bg-white rounded-xl shadow-md overflow-hidden transition-all duration-300 hover:shadow-xl border ${getBorderColor()} ${isHovered ? 'transform -translate-y-2' : ''}`}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Image */}
        <div className="w-full">
          <div className="relative h-72 w-full overflow-hidden">
            <Image
              src={getImageUrl()}
              alt={getLocalizedTitle()}
              fill
              className="object-cover hover:scale-105 transition-transform duration-500"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 33vw, 400px"
              style={{ objectPosition: 'center' }}
            />
            
            {/* No Featured Badge - removed for consistency */}
          </div>
          
          {/* Title and Price Below Image */}
          <div className={`p-4 border-b ${getBorderColor()}`}>
            <h3 className="text-xl font-bold text-gray-800">{getLocalizedTitle()}</h3>
            <div className="mt-1">
              <span className="text-lg font-medium text-[#e63946]">
                {getFormattedPrice()}
              </span>
            </div>
          </div>
        </div>
        
        {/* Features and Actions */}
        <div className="p-5">
          {/* Features */}
          <div className="space-y-3 mb-6">
            {getLocalizedFeatures().filter(feature => feature && feature.featureText).map((feature, index) => (
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
            {slug && slug.current && (
              <Link 
                href={`/subscriptions/${slug.current}`}
                className="block w-full text-center py-3 px-4 border-2 border-[#e63946] text-[#e63946] hover:bg-[#e63946] hover:text-white rounded-lg transition-colors font-medium"
              >
                {getViewDetailsText()}
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Description Modal */}
      {isModalOpen && (
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title={getLocalizedTitle()}
          className="max-w-2xl"
        >
          <div className="subscription-details">
            {/* Price information */}
            <div className="mb-4 pb-4 border-b border-gray-200">
              <p className="font-bold text-xl text-[#e63946]">
                {getFormattedPrice()}
              </p>
            </div>
            
            {/* Description content */}
            <div className="description-content text-gray-700">
              {hasDescription() ? (
                <PortableText value={getLocalizedDescription() || []} />
              ) : null}
            </div>
            
            {/* View Full Details button in modal if slug is available */}
            {slug && slug.current && (
              <div className="mt-6 text-center">
                <Link
                  href={`/subscriptions/${slug.current}`}
                  className="inline-block px-6 py-2 bg-[#e63946] text-white rounded-full hover:bg-[#d52d3a] transition-colors"
                >
                  {t('subscriptions.viewFullDetails')}
                </Link>
              </div>
            )}
          </div>
        </Modal>
      )}
    </>
  );
};

export default SubscriptionCard;