// src/app/(default)/subscriptions/components/SubscriptionDetails.tsx
"use client";

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Subscription, SubscriptionVariant } from '@/types/subscription-page';
import PortableText from '@/components/PortableText';
import useTranslations from '@/hooks/useTranslations';
import { useSubscriptionPurchase } from '@/hooks/useSubscriptionPurchase';
import { useAuthStore } from '@/store/authStore';
import { urlFor } from '@/sanity/lib/image';
import CouponInput from '@/components/CouponInput';

interface SubscriptionDetailsProps {
  subscription: Subscription;
}

interface Translations {
  home: string;
  subscriptions: string;
  included: string;
  description: string;
  viewMoreDetails: string;
  relatedPlans: string;
  viewPlan: string;
  selectVariant: string;
  dosage: string;
  bestValue: string;
  mostPopular: string;
  savePercent: string;
  baseOption: string;
  standardPlan: string;
  imageDisclaimer: string;
  lowestPrice: string;
  // Add new translations for the missing strings
  totalPerMonth: string;
  totalFor3Months: string;
  totalFor6Months: string;
  totalFor1Year: string;
  total: string;
  month: string;
  monthPlan: string;
  originalPrice: string;
  discountedPrice: string;
  processing: string;
  buyNow: string;
  dismiss: string;
}

const SubscriptionDetails: React.FC<SubscriptionDetailsProps> = ({ subscription }) => {
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [selectedVariant, setSelectedVariant] = useState<SubscriptionVariant | null>(null);
  const [selectedBase, setSelectedBase] = useState<boolean>(false);
  const [appliedCouponCode, setAppliedCouponCode] = useState<string>('');
  const [discountedPrice, setDiscountedPrice] = useState<number | null>(null);
  const [discountAmount, setDiscountAmount] = useState<number>(0);
  const [purchaseError, setPurchaseError] = useState<string>('');

  const { t, currentLanguage } = useTranslations();
  const { purchaseSubscription, isLoading, error, clearError } = useSubscriptionPurchase();
  const { user, isAuthenticated, checkSession } = useAuthStore();

  // Find default variant or first variant when component mounts
  useEffect(() => {
    if (subscription.hasVariants && subscription.variants && subscription.variants.length > 0) {
      // First look for a default variant
      const defaultVariant = subscription.variants.find(variant => variant.isDefault);
      
      // If no default is marked, select the base subscription by default
      if (defaultVariant) {
        setSelectedVariant(defaultVariant);
        setSelectedBase(false);
      } else {
        // Select base subscription by default if no default variant
        setSelectedBase(true);
        setSelectedVariant(null);
      }
    }
  }, [subscription.hasVariants, subscription.variants]);

  // Check auth state when component mounts
  useEffect(() => {
    if (!isAuthenticated) {
      checkSession();
    }
  }, [isAuthenticated, checkSession]);

  // Clear purchase error when subscription purchase error changes
  useEffect(() => {
    if (error) {
      setPurchaseError(error);
    }
  }, [error]);

  // Coupon handlers
  const handleCouponApplied = (code: string, newPrice: number, discount: number): void => {
    setAppliedCouponCode(code);
    setDiscountedPrice(newPrice);
    setDiscountAmount(discount);
    setPurchaseError(''); // Clear any previous errors
  };

  const handleCouponRemoved = (): void => {
    setAppliedCouponCode('');
    setDiscountedPrice(null);
    setDiscountAmount(0);
    setPurchaseError(''); // Clear any previous errors
  };

  // Handle variant selection
  const handleVariantSelection = (variant: SubscriptionVariant | null, isBase: boolean = false): void => {
    if (isBase) {
      setSelectedBase(true);
      setSelectedVariant(null);
    } else {
      setSelectedBase(false);
      setSelectedVariant(variant);
    }
    
    // Reset coupon when selection changes
    if (appliedCouponCode) {
      handleCouponRemoved();
    }
    
    // Clear any previous errors
    setPurchaseError('');
    clearError();
  };

  // Custom translations - EXPANDED WITH NEW TRANSLATIONS
  const translations: Translations = {
    home: currentLanguage === 'es' ? 'Inicio' : 'Home',
    subscriptions: currentLanguage === 'es' ? 'Suscripciones' : 'Subscriptions',
    included: currentLanguage === 'es' ? 'Qué Incluye' : "What's Included",
    description: currentLanguage === 'es' ? 'Descripción' : 'Description',
    viewMoreDetails: currentLanguage === 'es' ? 'Ver Más Detalles' : 'View More Details',
    relatedPlans: currentLanguage === 'es' ? 'Planes Relacionados' : 'Related Plans',
    viewPlan: currentLanguage === 'es' ? 'Ver Plan' : 'View Plan',
    selectVariant: currentLanguage === 'es' ? 'Seleccione una opción' : 'Select an option',
    dosage: currentLanguage === 'es' ? 'Dosis' : 'Dosage',
    bestValue: currentLanguage === 'es' ? 'Mejor Valor' : 'Best Value',
    mostPopular: currentLanguage === 'es' ? 'Más Popular' : 'Most Popular',
    savePercent: currentLanguage === 'es' ? 'Ahorre' : 'Save',
    baseOption: currentLanguage === 'es' ? 'Opción Base' : 'Base Option',
    standardPlan: currentLanguage === 'es' ? 'Plan Estándar' : 'Standard Plan',
    imageDisclaimer: currentLanguage === 'es' ? 'La imagen es ilustrativa. El producto enviado puede variar en apariencia.' : 'Product image for illustration. Actual product appearance may vary when shipped.',
    lowestPrice: currentLanguage === 'es' ? 'Precio Más Bajo' : 'Lowest Price',
    // NEW TRANSLATIONS FOR THE MISSING STRINGS
    totalPerMonth: currentLanguage === 'es' ? 'total por mes' : 'total per month',
    totalFor3Months: currentLanguage === 'es' ? 'total por 3 meses' : 'total for 3 months',
    totalFor6Months: currentLanguage === 'es' ? 'total por 6 meses' : 'total for 6 months',
    totalFor1Year: currentLanguage === 'es' ? 'total por 1 año' : 'total for 1 year',
    total: currentLanguage === 'es' ? 'total' : 'total',
    month: currentLanguage === 'es' ? '/mes' : '/month',
    monthPlan: currentLanguage === 'es' ? 'Plan de 1 mes' : '1 Month Plan',
    originalPrice: currentLanguage === 'es' ? 'Precio original: ' : 'Original price: ',
    discountedPrice: currentLanguage === 'es' ? 'Precio con descuento: ' : 'Discounted price: ',
    processing: currentLanguage === 'es' ? 'Procesando...' : 'Processing...',
    buyNow: currentLanguage === 'es' ? 'Comprar Ahora' : 'Buy Now',
    dismiss: currentLanguage === 'es' ? 'Cerrar' : 'Dismiss'
  };

  // Get the content based on current language
  const getLocalizedTitle = (): string => {
    if (currentLanguage === 'es' && subscription.titleEs) {
      return subscription.titleEs;
    }
    return subscription.title;
  };

  const getLocalizedDescription = () => {
    if (currentLanguage === 'es' && subscription.descriptionEs && subscription.descriptionEs.length > 0) {
      return subscription.descriptionEs;
    }
    return subscription.description;
  };

  const getLocalizedFeatures = () => {
    if (currentLanguage === 'es' && subscription.featuresEs && subscription.featuresEs.length > 0) {
      return subscription.featuresEs;
    }
    return subscription.features || [];
  };

  // Get monthly equivalent price for display above image
  const getMonthlyEquivalentPrice = (): string => {
    let price: number;
    let billingPeriod: string;
    let customBillingPeriodMonths: number | null | undefined;

    // If variants are being used and one is selected, use that variant's price
    if (subscription.hasVariants && selectedVariant && !selectedBase) {
      price = selectedVariant.price;
      billingPeriod = selectedVariant.billingPeriod;
      customBillingPeriodMonths = selectedVariant.customBillingPeriodMonths;
    } else {
      // Otherwise fall back to the base subscription's price
      price = subscription.price;
      billingPeriod = subscription.billingPeriod;
      customBillingPeriodMonths = subscription.customBillingPeriodMonths;
    }
    
    // Use discounted price if coupon is applied
    if (discountedPrice !== null) {
      price = discountedPrice;
    }

    // Calculate monthly equivalent
    let monthlyPrice: number;
    switch (billingPeriod) {
      case 'monthly':
        monthlyPrice = price;
        break;
      case 'three_month':
        monthlyPrice = price / 3;
        break;
      case 'six_month':
        monthlyPrice = price / 6;
        break;
      case 'annually':
        monthlyPrice = price / 12;
        break;
      case 'other':
        if (customBillingPeriodMonths && customBillingPeriodMonths > 1) {
          monthlyPrice = price / customBillingPeriodMonths;
        } else {
          monthlyPrice = price;
        }
        break;
      default:
        monthlyPrice = price;
    }

    const formattedPrice = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(monthlyPrice);

    // USE TRANSLATED MONTH TEXT
    return `${formattedPrice}${translations.month}`;
  };

  // Get total price text for small font below monthly price - UPDATED WITH TRANSLATIONS
  const getTotalPriceText = (): string => {
    let price: number;
    let billingPeriod: string;
    let customBillingPeriodMonths: number | null | undefined;

    // If variants are being used and one is selected, use that variant's price
    if (subscription.hasVariants && selectedVariant && !selectedBase) {
      price = selectedVariant.price;
      billingPeriod = selectedVariant.billingPeriod;
      customBillingPeriodMonths = selectedVariant.customBillingPeriodMonths;
    } else {
      // Otherwise fall back to the base subscription's price
      price = subscription.price;
      billingPeriod = subscription.billingPeriod;
      customBillingPeriodMonths = subscription.customBillingPeriodMonths;
    }
    
    // Use discounted price if coupon is applied
    if (discountedPrice !== null) {
      price = discountedPrice;
    }

    const formattedPrice = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);

    // USE TRANSLATED BILLING PERIOD DISPLAY
    switch (billingPeriod) {
      case 'monthly':
        return `${formattedPrice} ${translations.totalPerMonth}`;
      case 'three_month':
        return `${formattedPrice} ${translations.totalFor3Months}`;
      case 'six_month':
        return `${formattedPrice} ${translations.totalFor6Months}`;
      case 'annually':
        return `${formattedPrice} ${translations.totalFor1Year}`;
      case 'other':
        if (customBillingPeriodMonths && customBillingPeriodMonths > 1) {
          // For custom periods, use a more generic approach
          const monthsText = currentLanguage === 'es' 
            ? `total por ${customBillingPeriodMonths} meses`
            : `total for ${customBillingPeriodMonths} months`;
          return `${formattedPrice} ${monthsText}`;
        } else {
          return `${formattedPrice} ${translations.totalPerMonth}`;
        }
      default:
        return `${formattedPrice} ${translations.total}`;
    }
  };

  // Get formatted price for variant selector
  const getFormattedPrice = (price: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  // Get monthly price display for variant selector - UPDATED WITH TRANSLATIONS
  const getMonthlyPriceDisplay = (
    price: number,
    billingPeriod: string,
    customBillingPeriodMonths?: number | null
  ): string => {
    // Calculate monthly equivalent
    let monthlyPrice: number;
    switch (billingPeriod) {
      case 'monthly':
        monthlyPrice = price;
        break;
      case 'three_month':
        monthlyPrice = price / 3;
        break;
      case 'six_month':
        monthlyPrice = price / 6;
        break;
      case 'annually':
        monthlyPrice = price / 12;
        break;
      case 'other':
        if (customBillingPeriodMonths && customBillingPeriodMonths > 1) {
          monthlyPrice = price / customBillingPeriodMonths;
        } else {
          monthlyPrice = price;
        }
        break;
      default:
        monthlyPrice = price;
    }

    // USE TRANSLATED MONTH TEXT
    return `${getFormattedPrice(monthlyPrice)}${translations.month}`;
  };

  // Get total price display for variant selector - UPDATED WITH TRANSLATIONS
  const getTotalPriceDisplay = (
    price: number,
    billingPeriod: string,
    customBillingPeriodMonths?: number | null
  ): string => {
    const formattedPrice = getFormattedPrice(price);
    
    // USE TRANSLATED TOTAL TEXT
    return `${formattedPrice} ${translations.total}`;
  };

  // Get localized variant title
  const getLocalizedVariantTitle = (variant: SubscriptionVariant): string => {
    if (currentLanguage === 'es' && variant.titleEs) {
      return variant.titleEs;
    }
    return variant.title;
  };

  // Get localized variant description
  const getLocalizedVariantDescription = (variant: SubscriptionVariant): string => {
    if (currentLanguage === 'es' && variant.descriptionEs) {
      return variant.descriptionEs;
    }
    return variant.description || '';
  };

  // Calculate discount percentage
  const getDiscountPercentage = (compareAtPrice: number | undefined, price: number): number | null => {
    if (!compareAtPrice || compareAtPrice <= price) return null;
    
    const discount = compareAtPrice - price;
    const percentage = Math.round((discount / compareAtPrice) * 100);
    return percentage;
  };

  // Get appropriate badge for variants
  const getVariantBadge = (variant: SubscriptionVariant): React.ReactNode | null => {
    // Check if this is the 3 month plan
    if (variant.billingPeriod === 'three_month') {
      return (
        <span className="inline-block bg-[#e63946] text-white text-xs px-2 py-0.5 rounded-full mt-1">
          {translations.mostPopular}
        </span>
      );
    }
    
    // Check if this variant was previously marked as popular and change to lowest price
    if (variant.isPopular) {
      return (
        <span className="inline-block bg-green-600 text-white text-xs px-2 py-0.5 rounded-full mt-1">
          {translations.lowestPrice}
        </span>
      );
    }
    
    return null;
  };

  // Handle the subscription purchase with improved error handling
  const handleSubscribe = async (): Promise<void> => {
    if (isProcessing || isLoading) return;
    
    // Clear previous errors
    setPurchaseError('');
    clearError();
    
    // Store current path in sessionStorage
    const currentPath = window.location.pathname;
    try {
      sessionStorage.setItem('subscriptionReturnPath', currentPath);
    } catch (storageError) {
      // Session storage not available, continue without storing
    }
    
    // If not authenticated, redirect to login with return URL
    if (!isAuthenticated) {
      try {
        // Save intended subscription ID to purchase after login
        sessionStorage.setItem('pendingSubscriptionId', subscription._id);
        
        // If a variant is selected, store that too
        if (subscription.hasVariants && selectedVariant && selectedVariant._key && !selectedBase) {
          sessionStorage.setItem('pendingVariantKey', selectedVariant._key);
        }
        
        // Store coupon code if applied
        if (appliedCouponCode) {
          sessionStorage.setItem('pendingCouponCode', appliedCouponCode);
        }
      } catch (storageError) {
        // Session storage not available, continue without storing
      }
      
      const returnUrl = encodeURIComponent(currentPath);
      window.location.href = `/login?returnUrl=${returnUrl}`;
      return;
    }
    
    setIsProcessing(true);
    
    try {
      // Store appointment page as the return URL after successful purchase
      try {
        sessionStorage.setItem('loginReturnUrl', '/appointment');
      } catch (storageError) {
        // Session storage not available, continue without storing
      }
      
      // Include coupon code in the subscription purchase
      // Only pass variant key if a variant is selected (not base)
      const result = await purchaseSubscription(
        subscription._id,
        selectedBase ? undefined : selectedVariant?._key,
        appliedCouponCode || undefined
      );
      
      if (result.success && result.url) {
        // Redirect to Stripe checkout
        window.location.href = result.url;
      } else if (result.error) {
        setPurchaseError(result.error);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred';
      setPurchaseError(errorMessage);
    } finally {
      setIsProcessing(false);
    }
  };

  // Get subscription button text based on state - UPDATED WITH TRANSLATIONS
  const getSubscribeButtonText = (): string => {
    if (isProcessing || isLoading) {
      return translations.processing;
    }
    
    // Always show "Buy Now" regardless of authentication status
    return translations.buyNow;
  };

  // Check if something is selected (base or variant)
  const isSomethingSelected = (): boolean => {
    if (!subscription.hasVariants) return true;
    return selectedBase || selectedVariant !== null;
  };

  // Get current price for coupon calculation
  const getCurrentPrice = (): number => {
    if (selectedBase || !selectedVariant) {
      return subscription.price;
    }
    return selectedVariant.price;
  };

  // Get current variant key for coupon calculation
  const getCurrentVariantKey = (): string | undefined => {
    if (selectedBase) return undefined;
    return selectedVariant?._key;
  };

  // Prepare image URL with proper fallbacks
  const getImageUrl = (): string => {
    // First check for the main image (preferred for detail page)
    if (subscription.image) {
      return urlFor(subscription.image).width(1000).height(800).url();
    }
    // Fall back to featured catalog image if no main image exists
    if (subscription.featuredImage) {
      return urlFor(subscription.featuredImage).width(1000).height(800).url();
    }
    return '/images/subscription-placeholder.jpg';
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <div className="bg-white min-h-screen">
      {/* Breadcrumb Navigation */}
      <div className="bg-gray-50 py-4">
        <div className="container mx-auto px-4">
          <nav className="flex text-sm">
            <Link href="/" className="text-gray-500 hover:text-gray-700">
              {translations.home}
            </Link>
            <span className="mx-2 text-gray-500">/</span>
            <Link href="/subscriptions" className="text-gray-500 hover:text-gray-700">
              {translations.subscriptions}
            </Link>
            <span className="mx-2 text-gray-500">/</span>
            <span className="text-gray-900 font-medium">{getLocalizedTitle()}</span>
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <motion.div 
        className="container mx-auto px-4 py-8 md:py-12"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16">
            {/* Left Column - Image only */}
            <motion.div variants={itemVariants}>
              {/* Featured Badge (if applicable) */}
              {subscription.isFeatured && (
                <div className="mb-4">
                  <span className="inline-block bg-[#fff1f2] text-[#e63946] px-4 py-1 rounded-full text-sm font-semibold">
                    {t('subscriptions.featuredPlan')}
                  </span>
                </div>
              )}
              
              {/* Subscription Title */}
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                {getLocalizedTitle()}
              </h1>
              
              {/* Price and Billing Period */}
              <div className="flex flex-col mb-6">
                <div className="flex items-baseline">
                  <span className="text-3xl font-bold text-[#e63946]">
                    {getMonthlyEquivalentPrice()}
                  </span>
                </div>
                <div className="mt-1">
                  <span className="text-sm text-gray-600">
                    {getTotalPriceText()}
                  </span>
                </div>
                
                {/* Show discount if available */}
                {selectedVariant && !selectedBase && selectedVariant.compareAtPrice &&
                  selectedVariant.compareAtPrice > selectedVariant.price && !discountedPrice && (
                    <div className="mt-1 flex items-center">
                      <span className="text-gray-500 line-through mr-2">
                        ${selectedVariant.compareAtPrice}
                      </span>
                      <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                        {translations.savePercent} {getDiscountPercentage(selectedVariant.compareAtPrice, selectedVariant.price)}%
                      </span>
                    </div>
                  )
                }
                
                {/* Show base subscription discount if available */}
                {(selectedBase || !subscription.hasVariants) && subscription.compareAtPrice &&
                  subscription.compareAtPrice > subscription.price && !discountedPrice && (
                    <div className="mt-1 flex items-center">
                      <span className="text-gray-500 line-through mr-2">
                        ${subscription.compareAtPrice}
                      </span>
                      <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                        {translations.savePercent} {getDiscountPercentage(subscription.compareAtPrice, subscription.price)}%
                      </span>
                    </div>
                  )
                }
                
                {/* Variant-specific information */}
                {subscription.hasVariants && selectedVariant && !selectedBase && getLocalizedVariantDescription(selectedVariant) && (
                  <div className="mt-2 text-sm">
                    <p className="text-gray-600">{getLocalizedVariantDescription(selectedVariant)}</p>
                  </div>
                )}
              </div>
              
              {/* Main Image - UPDATED FOR LARGER SIZE */}
              <div className="relative w-full h-[450px] md:h-[550px] rounded-lg overflow-hidden mb-4">
                <Image
                  src={getImageUrl()}
                  alt={getLocalizedTitle()}
                  fill
                  style={{ objectFit: 'cover' }}
                  className="rounded-lg"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 600px"
                  priority
                />
              </div>

              {/* Image Disclaimer */}
              <p className="text-sm text-gray-500 italic mb-8 text-center">
                {translations.imageDisclaimer}
              </p>
            </motion.div>
            
            {/* Right Column - Features and CTA */}
            <motion.div variants={itemVariants}>
              <div className="bg-gray-50 rounded-xl p-6 md:p-8 mb-8">
                {/* Variant Selector (if subscription has variants) */}
                {subscription.hasVariants && subscription.variants && subscription.variants.length > 0 && (
                  <div className="mb-8">
                    <h3 className="text-lg font-medium text-gray-900 mb-3">
                      {translations.selectVariant}
                    </h3>
                    <div className="space-y-3">
                      {/* Base Subscription Option - UPDATED WITH TRANSLATION */}
                      <div 
                        className={`border-2 rounded-lg p-4 cursor-pointer transition-all hover:border-[#e63946] 
                          ${selectedBase 
                            ? 'border-[#e63946] bg-[#fff8f8]' 
                            : 'border-gray-200'}`}
                        onClick={() => handleVariantSelection(null, true)}
                      >
                        <div className="flex justify-between">
                          <div>
                            <h4 className="font-medium text-gray-900">
                              {translations.monthPlan}
                            </h4>
                          </div>
                          <div className="text-right">
                              <div className="text-right">
                                <p className="font-semibold text-gray-900">
                                  {getMonthlyPriceDisplay(subscription.price, subscription.billingPeriod, subscription.customBillingPeriodMonths)}
                                </p>
                                <p className="text-xs text-gray-700">
                                  {getTotalPriceDisplay(subscription.price, subscription.billingPeriod, subscription.customBillingPeriodMonths)}
                                </p>
                              </div>
                            {subscription.compareAtPrice && subscription.compareAtPrice > subscription.price && (
                              <div className="mt-1">
                                <span className="text-xs text-gray-500 line-through">
                                  ${subscription.compareAtPrice}
                                </span>
                                <span className="text-xs text-green-600 ml-1">
                                  -{getDiscountPercentage(subscription.compareAtPrice, subscription.price)}%
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Variant Options */}
                      {subscription.variants.map((variant) => (
                        <div 
                          key={variant._key || variant.title}
                          className={`border-2 rounded-lg p-4 cursor-pointer transition-all hover:border-[#e63946] 
                            ${selectedVariant && selectedVariant._key === variant._key && !selectedBase
                              ? 'border-[#e63946] bg-[#fff8f8]' 
                              : 'border-gray-200'}`}
                          onClick={() => handleVariantSelection(variant, false)}
                        >
                          <div className="flex justify-between">
                            <div>
                              <h4 className="font-medium text-gray-900">{getLocalizedVariantTitle(variant)}</h4>
                              {getLocalizedVariantDescription(variant) && (
                                <p className="text-sm text-gray-900 mt-1">
                                  {getLocalizedVariantDescription(variant)}
                                </p>
                              )}
                            </div>
                            <div className="text-right">
                              <div className="text-right">
                                <p className="font-semibold text-gray-900">
                                  {getMonthlyPriceDisplay(variant.price, variant.billingPeriod, variant.customBillingPeriodMonths)}
                                </p>
                                <p className="text-xs text-gray-700">
                                  {getTotalPriceDisplay(variant.price, variant.billingPeriod, variant.customBillingPeriodMonths)}
                                </p>
                              </div>
                              {getVariantBadge(variant)}
                              {variant.compareAtPrice && variant.compareAtPrice > variant.price && (
                                <div className="mt-1">
                                  <span className="text-xs text-gray-500 line-through">
                                    ${variant.compareAtPrice}
                                  </span>
                                  <span className="text-xs text-green-600 ml-1">
                                    -{getDiscountPercentage(variant.compareAtPrice, variant.price)}%
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* Coupon Input - Moved above features */}
                <div className="mb-6">
                  <CouponInput
                    subscriptionId={subscription._id}
                    variantKey={getCurrentVariantKey()}
                    originalPrice={getCurrentPrice()}
                    onCouponApplied={handleCouponApplied}
                    onCouponRemoved={handleCouponRemoved}
                  />
                  
                  {/* Show original price if coupon is applied - UPDATED WITH TRANSLATIONS */}
                  {discountedPrice !== null && (
                    <div className="mt-4 text-center">
                      <p className="text-sm text-gray-500 line-through">
                        {translations.originalPrice}
                        ${getCurrentPrice()}
                      </p>
                      <p className="text-lg font-bold text-green-600">
                        {translations.discountedPrice}
                        ${discountedPrice}
                      </p>
                    </div>
                  )}
                </div>
                
                {/* Purchase CTA Button - Moved above features */}
                <div className="mb-8">
                  <button
                    onClick={handleSubscribe}
                    disabled={isProcessing || isLoading || !isSomethingSelected()}
                    className={`w-full py-4 px-6 rounded-full text-white font-bold text-lg transition-all ${
                      isProcessing || isLoading || !isSomethingSelected()
                        ? 'bg-gray-400 cursor-not-allowed' 
                        : 'bg-[#e63946] hover:bg-[#d52d3a] shadow-md hover:shadow-lg'
                    }`}
                  >
                    {getSubscribeButtonText()}
                  </button>
                  
                  {/* Enhanced Error Display - UPDATED WITH TRANSLATIONS */}
                  {(purchaseError || error) && (
                    <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                      <div className="flex items-center">
                        <svg className="w-5 h-5 text-red-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <p className="text-sm text-red-700">
                          {purchaseError || error}
                        </p>
                      </div>
                      <button
                        onClick={() => {
                          setPurchaseError('');
                          clearError();
                        }}
                        className="mt-2 text-xs text-red-600 hover:text-red-800 underline"
                      >
                        {translations.dismiss}
                      </button>
                    </div>
                  )}
                </div>
                
                {/* Features List with "What's Included" header */}
                <div className="space-y-4 pt-4 border-t border-gray-200">
                  <h3 className="text-lg font-medium text-gray-900 mb-3">
                    {translations.included}
                  </h3>
                  {getLocalizedFeatures().map((feature, index) => (
                    <div key={index} className="flex items-start">
                      <div className="flex-shrink-0 w-6 h-6 rounded-full bg-[#ffe6f0] flex items-center justify-center mt-0.5 mr-3">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="#e63946" className="w-4 h-4">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div className="text-gray-700">{feature.featureText}</div>
                    </div>
                  ))}
                </div>

                {/* Description Section - Moved below features */}
                {getLocalizedDescription() && (
                  <div className="mt-8 pt-8 border-t border-gray-200">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">
                      {translations.description}
                    </h3>
                    <div className="prose max-w-none">
                      <PortableText value={getLocalizedDescription() || []} className="text-gray-700" />
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default SubscriptionDetails;