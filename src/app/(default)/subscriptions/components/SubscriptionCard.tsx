// src/app/(default)/subscriptions/components/SubscriptionCard.tsx
'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useSubscriptionPurchase } from '@/hooks/useSubscriptionPurchase';
import { useAuthStore } from '@/store/authStore';
import { SubscriptionFeature, BlockContent, SubscriptionVariant } from '@/types/subscription-page';
import useTranslations from '@/hooks/useTranslations';
import Modal from '@/components/Modal';
import PortableText from '@/components/PortableText';
import { urlFor } from '@/sanity/lib/image';
import { SanityImageSource } from '@sanity/image-url/lib/types/types';
import { formatPriceWithBillingPeriod } from '@/utils/subscriptionHelpers';

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
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [isHovered, setIsHovered] = useState<boolean>(false);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [selectedVariant, setSelectedVariant] = useState<SubscriptionVariant | null>(null);
  
  const { user, isAuthenticated, checkSession } = useAuthStore();
  const { purchaseSubscription, isLoading, error } = useSubscriptionPurchase();
  const router = useRouter();
  const { t, currentLanguage } = useTranslations();
  
  // Initialize selected variant when component mounts
  useEffect(() => {
    if (hasVariants && variants && variants.length > 0) {
      // Find default variant or use first one
      const defaultVariant = variants.find(variant => variant.isDefault) || variants[0];
      setSelectedVariant(defaultVariant);
    }
  }, [hasVariants, variants]);
  
  // Check auth state when component mounts
  useEffect(() => {
    if (!isAuthenticated) {
      checkSession();
    }
  }, [isAuthenticated, checkSession]);

  // Handle variant selection - simplified since no dropdown
  const handleVariantSelect = useCallback((variant: SubscriptionVariant): void => {
    console.log('Selected variant:', variant);
    setSelectedVariant(variant);
  }, []);

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

  // Get localized variant title
  const getLocalizedVariantTitle = (variant: SubscriptionVariant): string => {
    if (currentLanguage === 'es' && variant.titleEs) {
      return variant.titleEs;
    }
    return variant.title;
  };

  // Get current price based on selected variant or base price
  const getCurrentPrice = (): number => {
    if (hasVariants && selectedVariant) {
      return selectedVariant.price;
    }
    return price;
  };

  // Get current billing period based on selected variant or base period
  const getCurrentBillingPeriod = (): string => {
    if (hasVariants && selectedVariant) {
      return selectedVariant.billingPeriod;
    }
    return billingPeriod;
  };

  // Get current custom billing period months
  const getCurrentCustomBillingPeriodMonths = (): number | null => {
    if (hasVariants && selectedVariant) {
      return selectedVariant.customBillingPeriodMonths || null;
    }
    return customBillingPeriodMonths || null;
  };

  // Format price with billing period
  const getFormattedPrice = (): string => {
    return formatPriceWithBillingPeriod(
      getCurrentPrice(),
      getCurrentBillingPeriod(),
      getCurrentCustomBillingPeriodMonths(),
      { 
        showMonthlyEquivalent: false,
        locale: currentLanguage
      }
    );
  };

  // Get monthly equivalent for display
  const getMonthlyEquivalent = (): string | null => {
    const currentBillingPeriod = getCurrentBillingPeriod();
    const currentPrice = getCurrentPrice();
    const customMonths = getCurrentCustomBillingPeriodMonths();
    
    if (currentBillingPeriod === 'monthly') {
      return null; // No need to show monthly equivalent for monthly plans
    }
    
    let monthlyPrice = currentPrice;
    
    switch (currentBillingPeriod) {
      case 'three_month':
        monthlyPrice = currentPrice / 3;
        break;
      case 'six_month':
        monthlyPrice = currentPrice / 6;
        break;
      case 'annually':
        monthlyPrice = currentPrice / 12;
        break;
      case 'other':
        if (customMonths && customMonths > 1) {
          monthlyPrice = currentPrice / customMonths;
        }
        break;
    }
    
    return formatPriceWithBillingPeriod(
      monthlyPrice,
      'monthly',
      null,
      { 
        showMonthlyEquivalent: false,
        locale: currentLanguage
      }
    );
  };

  // Handle the subscription purchase or redirect to login
  const handleSubscribe = async (): Promise<void> => {
    if (isProcessing || isLoading) return;
    
    // Store current path in sessionStorage
    const currentPath = window.location.pathname;
    sessionStorage.setItem('subscriptionReturnPath', currentPath);
    
    // If not authenticated, redirect to login with return URL
    if (!isAuthenticated) {
      // Save intended subscription ID to purchase after login
      sessionStorage.setItem('pendingSubscriptionId', id);
      
      // Save selected variant if applicable
      if (hasVariants && selectedVariant && selectedVariant._key) {
        sessionStorage.setItem('pendingVariantKey', selectedVariant._key);
      }
      
      const returnUrl = encodeURIComponent('/subscriptions');
      router.push(`/login?returnUrl=${returnUrl}`);
      return;
    }
    
    setIsProcessing(true);
    
    try {
      // Store appointment page as the return URL after successful purchase
      sessionStorage.setItem('loginReturnUrl', '/appointment');
      
      const result = await purchaseSubscription(
        id,
        hasVariants && selectedVariant ? selectedVariant._key : undefined
      );
      
      if (result.success && result.url) {
        // Redirect to Stripe checkout
        window.location.href = result.url;
      }
    } catch (err) {
      console.error('Failed to initiate subscription purchase:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  // Get localized subscription button text
  const getSubscribeButtonText = (): string => {
    if (isProcessing || isLoading) {
      return currentLanguage === 'es' ? 'Procesando...' : 'Processing...';
    }
    
    if (isAuthenticated) {
      return currentLanguage === 'es' ? 'Suscribirse Ahora' : 'Subscribe Now';
    }
    
    return currentLanguage === 'es' ? 'Iniciar Sesión para Suscribirse' : 'Sign In to Subscribe';
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

  // Determine border color based on card type for styling
  const getBorderColor = (): string => {
    switch (cardType) {
      case 'basic': return 'border-[#d81159]';
      case 'premium': return 'border-[#e63946]';
      case 'standard': return 'border-[#ff4d6d]';
      default: return 'border-gray-200';
    }
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
            
            {/* Featured Badge */}
            {cardType === 'premium' && (
              <div className="absolute top-3 right-3 bg-white text-[#e63946] text-xs font-bold px-3 py-1 rounded-full shadow-md z-10">
                {currentLanguage === 'es' ? 'Destacado' : 'Featured'}
              </div>
            )}
          </div>
          
          {/* Title and Price Below Image */}
          <div className={`p-4 border-b ${getBorderColor()}`}>
            <h3 className="text-xl font-bold text-gray-800">{getLocalizedTitle()}</h3>
            <div className="mt-1">
              <span className={`text-lg font-medium ${
                cardType === 'basic' ? 'text-[#d81159]' : 
                cardType === 'premium' ? 'text-[#e63946]' : 
                'text-[#ff4d6d]'
              }`}>
                {getFormattedPrice()}
              </span>
              
              {/* Show monthly price equivalent for non-monthly plans */}
              {getMonthlyEquivalent() && (
                <div className="text-sm text-gray-600 mt-1">
                  ({getMonthlyEquivalent()})
                </div>
              )}
            </div>
            
            {/* Show selected variant info if variants exist */}
            {hasVariants && selectedVariant && (
              <div className="text-xs text-gray-500 mt-1">
                {selectedVariant.dosageAmount} {selectedVariant.dosageUnit}
              </div>
            )}
          </div>
        </div>
        
        {/* Features and Actions */}
        <div className="p-5">
          {/* Features */}
          <div className="space-y-3 mb-6">
            {getLocalizedFeatures().filter(feature => feature && feature.featureText).map((feature, index) => (
              <div key={index} className="flex items-start gap-3">
                <div className={`flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-white text-xs ${
                  cardType === 'basic' ? 'bg-[#d81159]' : 
                  cardType === 'premium' ? 'bg-[#e63946]' : 
                  'bg-[#ff4d6d]'
                }`}>
                  ✓
                </div>
                <div className="text-gray-700 text-sm">{feature.featureText}</div>
              </div>
            ))}
          </div>
          
          <div className="space-y-3">
            {/* View Details Link */}
            {slug && slug.current && (
              <Link 
                href={`/subscriptions/${slug.current}`}
                className={`block w-full text-center py-2.5 px-4 border rounded-lg transition-colors ${
                  cardType === 'basic' ? 'border-[#d81159] text-[#d81159] hover:bg-[#d81159]/5' : 
                  cardType === 'premium' ? 'border-[#e63946] text-[#e63946] hover:bg-[#e63946]/5' : 
                  'border-[#ff4d6d] text-[#ff4d6d] hover:bg-[#ff4d6d]/5'
                }`}
              >
                {getViewDetailsText()}
              </Link>
            )}
            
            {/* Variant Selector - NEW DESIGN: Always visible radio buttons */}
            {hasVariants && variants && variants.length > 0 && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  {currentLanguage === 'es' ? 'Seleccionar opción:' : 'Select option:'}
                </label>
                <div className="space-y-2">
                  {variants.map((variant, index) => {
                    const isSelected = selectedVariant?._key === variant._key;
                    return (
                      <div
                        key={variant._key || `variant-${index}`}
                        onClick={() => handleVariantSelect(variant)}
                        className={`p-3 border-2 rounded-lg cursor-pointer transition-all duration-200 ${
                          isSelected 
                            ? `${cardType === 'basic' ? 'border-[#d81159] bg-[#d81159]/5' : 
                                cardType === 'premium' ? 'border-[#e63946] bg-[#e63946]/5' : 
                                'border-[#ff4d6d] bg-[#ff4d6d]/5'}` 
                            : 'border-gray-200 hover:border-gray-300 bg-white'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            {/* Radio button indicator */}
                            <div className={`w-4 h-4 rounded-full border-2 mr-3 flex items-center justify-center ${
                              isSelected 
                                ? `${cardType === 'basic' ? 'border-[#d81159]' : 
                                    cardType === 'premium' ? 'border-[#e63946]' : 
                                    'border-[#ff4d6d]'}` 
                                : 'border-gray-300'
                            }`}>
                              {isSelected && (
                                <div className={`w-2 h-2 rounded-full ${
                                  cardType === 'basic' ? 'bg-[#d81159]' : 
                                  cardType === 'premium' ? 'bg-[#e63946]' : 
                                  'bg-[#ff4d6d]'
                                }`}></div>
                              )}
                            </div>
                            
                            {/* Variant info */}
                            <div>
                              <div className="font-medium text-sm text-gray-900">
                                {getLocalizedVariantTitle(variant)}
                              </div>
                              <div className="text-xs text-gray-500">
                                {variant.dosageAmount} {variant.dosageUnit}
                              </div>
                            </div>
                          </div>
                          
                          {/* Price and badges */}
                          <div className="text-right">
                            <div className="font-semibold text-sm">
                              {formatPriceWithBillingPeriod(
                                variant.price,
                                variant.billingPeriod,
                                variant.customBillingPeriodMonths,
                                { showMonthlyEquivalent: false, locale: currentLanguage }
                              )}
                            </div>
                            {variant.isPopular && (
                              <div className={`text-xs font-medium mt-1 ${
                                cardType === 'basic' ? 'text-[#d81159]' : 
                                cardType === 'premium' ? 'text-[#e63946]' : 
                                'text-[#ff4d6d]'
                              }`}>
                                {currentLanguage === 'es' ? 'Popular' : 'Popular'}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
            
            {/* Subscribe Button */}
            <button
              onClick={handleSubscribe}
              disabled={isProcessing || isLoading || (hasVariants && !selectedVariant)}
              className={`w-full py-3 px-4 rounded-lg text-white font-medium transition-colors ${
                isProcessing || isLoading || (hasVariants && !selectedVariant)
                  ? 'bg-gray-400 cursor-not-allowed' 
                  : cardType === 'basic' ? 'bg-[#d81159] hover:bg-[#c00f50]' : 
                    cardType === 'premium' ? 'bg-gradient-to-r from-[#e63946] to-[#ff4d6d] hover:from-[#d52d3a] hover:to-[#ff3c60]' : 
                    'bg-[#ff4d6d] hover:bg-[#ff3c60]'
              }`}
            >
              {getSubscribeButtonText()}
            </button>
          </div>
          
          {error && (
            <p className="mt-2 text-xs text-red-600 text-center">
              {error}
            </p>
          )}
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
              {getMonthlyEquivalent() && (
                <p className="text-sm text-gray-600 mt-1">
                  ({getMonthlyEquivalent()})
                </p>
              )}
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