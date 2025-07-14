// src/app/(default)/subscriptions/components/SubscriptionDetails.tsx
"use client";

import { useState, useEffect, useMemo, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Subscription, SubscriptionVariant } from '@/types/subscription-page';
import useTranslations from '@/hooks/useTranslations';
import { useSubscriptionPurchase } from '@/hooks/useSubscriptionPurchase';
import { useAuthStore } from '@/store/authStore';
import { useSubscriptionPricing } from '@/hooks/useSubscriptionPricing';
import { Translations } from '@/types/subscriptionDetails';

// Import sub-components
import { SubscriptionBreadcrumb } from './SubscriptionBreadcrumb';
import { VariantSelector } from './VariantSelector';
import { SubscriptionImage } from './SubscriptionImage';
import { PurchaseSection } from './PurchaseSection';
import { FeaturesList } from './FeaturesList';
import { DescriptionSection } from './DescriptionSection';

interface SubscriptionDetailsProps {
  subscription: Subscription;
}

export default function SubscriptionDetails({ subscription }: SubscriptionDetailsProps) {
  // State management
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [selectedVariant, setSelectedVariant] = useState<SubscriptionVariant | null>(null);
  const [selectedBase, setSelectedBase] = useState<boolean>(false);
  const [appliedCouponCode, setAppliedCouponCode] = useState<string>('');
  const [discountedPrice, setDiscountedPrice] = useState<number | null>(null);
  const [discountAmount, setDiscountAmount] = useState<number>(0);
  const [purchaseError, setPurchaseError] = useState<string>('');

  // Hooks
  const { t, currentLanguage } = useTranslations();
  const { purchaseSubscription, isLoading, error, clearError } = useSubscriptionPurchase();
  const { user, isAuthenticated, checkSession } = useAuthStore();

  // Memoize translations object to prevent recreating on every render
  const translations: Translations = useMemo(() => ({
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
    lowestPrice: currentLanguage === 'es' ? 'Precio Más Bajo' : 'Lowest Price',
    couponCode: currentLanguage === 'es' ? 'Código de Cupón' : 'Coupon Code',
    applyCoupon: currentLanguage === 'es' ? 'Aplicar Cupón' : 'Apply Coupon',
    removeCoupon: currentLanguage === 'es' ? 'Quitar Cupón' : 'Remove Coupon',
    couponApplied: currentLanguage === 'es' ? 'Cupón Aplicado' : 'Coupon Applied',
    total: currentLanguage === 'es' ? 'total' : 'total',
    month: currentLanguage === 'es' ? '/mes' : '/month',
    monthPlan: currentLanguage === 'es' ? 'Plan de 1 mes' : '1 Month Plan',
    originalPrice: currentLanguage === 'es' ? 'Precio original: ' : 'Original price: ',
    discountedPrice: currentLanguage === 'es' ? 'Precio con descuento: ' : 'Discounted price: ',
    processing: currentLanguage === 'es' ? 'Procesando...' : 'Processing...',
    buyNow: currentLanguage === 'es' ? 'Comprar Ahora' : 'Buy Now',
    dismiss: currentLanguage === 'es' ? 'Cerrar' : 'Dismiss'
  }), [currentLanguage]);

  // Get pricing information using custom hook
  const pricing = useSubscriptionPricing(
    subscription,
    selectedVariant,
    selectedBase,
    discountedPrice,
    currentLanguage
  );

  // Initialize variant selection with proper default logic
  useEffect(() => {
    if (subscription.hasVariants && subscription.variants && subscription.variants.length > 0) {
      // First, check for a variant with isDefault flag
      const defaultVariant = subscription.variants.find(variant => variant.isDefault);
      
      if (defaultVariant) {
        setSelectedVariant(defaultVariant);
        setSelectedBase(false);
      } else {
        // If no default variant, find the one with the lowest monthly display price
        let lowestMonthlyPrice = Infinity;
        let bestVariant = subscription.variants[0];
        
        // Compare all variants including base subscription
        const baseMonthlyPrice = subscription.monthlyDisplayPrice || 
          (subscription.price / (subscription.billingPeriod === 'annually' ? 12 : 
                                 subscription.billingPeriod === 'three_month' ? 3 : 
                                 subscription.billingPeriod === 'six_month' ? 6 : 1));
        
        if (baseMonthlyPrice < lowestMonthlyPrice) {
          lowestMonthlyPrice = baseMonthlyPrice;
          setSelectedBase(true);
          setSelectedVariant(null);
        } else {
          setSelectedBase(false);
        }
        
        // Check variants
        for (const variant of subscription.variants) {
          const monthlyPrice = variant.monthlyDisplayPrice || 
            (variant.price / (variant.billingPeriod === 'annually' ? 12 : 
                              variant.billingPeriod === 'three_month' ? 3 : 
                              variant.billingPeriod === 'six_month' ? 6 : 1));
          
          if (monthlyPrice < lowestMonthlyPrice) {
            lowestMonthlyPrice = monthlyPrice;
            bestVariant = variant;
            setSelectedBase(false);
          }
        }
        
        if (!selectedBase) {
          setSelectedVariant(bestVariant);
        }
      }
    } else {
      // No variants, use base subscription
      setSelectedBase(true);
      setSelectedVariant(null);
    }
  }, [subscription.hasVariants, subscription.variants, subscription.monthlyDisplayPrice, subscription.price, subscription.billingPeriod]);

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

  // Memoize helper functions to prevent recreating on every render
  const getLocalizedTitle = useCallback((): string => {
    if (currentLanguage === 'es' && subscription.titleEs && subscription.titleEs.trim() !== '') {
      return subscription.titleEs;
    }
    return subscription.title;
  }, [currentLanguage, subscription.title, subscription.titleEs]);

  const getLocalizedFeatures = useCallback(() => {
    if (currentLanguage === 'es' && subscription.featuresEs && subscription.featuresEs.length > 0) {
      return subscription.featuresEs;
    }
    return subscription.features || [];
  }, [currentLanguage, subscription.features, subscription.featuresEs]);

  const getLocalizedDescription = useCallback(() => {
    if (currentLanguage === 'es' && subscription.descriptionEs && subscription.descriptionEs.length > 0) {
      return subscription.descriptionEs;
    }
    return subscription.description || [];
  }, [currentLanguage, subscription.description, subscription.descriptionEs]);

  const getDiscountPercentage = useCallback((compareAtPrice: number, currentPrice: number): number => {
    if (compareAtPrice <= currentPrice) return 0;
    return Math.round(((compareAtPrice - currentPrice) / compareAtPrice) * 100);
  }, []);

  const handleVariantSelection = useCallback((variant: SubscriptionVariant | null, isBase: boolean = false) => {
    if (isBase) {
      setSelectedBase(true);
      setSelectedVariant(null);
    } else {
      setSelectedBase(false);
      setSelectedVariant(variant);
    }
    
    // Clear any applied coupons when switching variants
    setAppliedCouponCode('');
    setDiscountedPrice(null);
    setDiscountAmount(0);
    setPurchaseError('');
  }, []);

  const handlePurchase = useCallback(async () => {
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
  }, [
    isProcessing,
    isLoading,
    isAuthenticated,
    subscription._id,
    selectedVariant,
    selectedBase,
    appliedCouponCode,
    purchaseSubscription,
    clearError
  ]);

  // Helper functions for PurchaseSection
  const getCurrentPrice = useCallback((): number => {
    return pricing.effectivePrice;
  }, [pricing.effectivePrice]);

  const getCurrentVariantKey = useCallback((): string | undefined => {
    return selectedVariant?._key;
  }, [selectedVariant]);

  const getSubscribeButtonText = useCallback((): string => {
    if (isProcessing || isLoading) {
      return translations.processing;
    }
    return translations.buyNow;
  }, [isProcessing, isLoading, translations.processing, translations.buyNow]);

  const isSomethingSelected = selectedVariant !== null || selectedBase;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8"
    >
      {/* Breadcrumb */}
      <SubscriptionBreadcrumb 
        subscriptionTitle={getLocalizedTitle()}
        translations={translations}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
        {/* Left Column - Image and Basic Info */}
        <div className="space-y-6">
          <SubscriptionImage 
            subscription={subscription}
            selectedVariant={selectedVariant}
            selectedBase={selectedBase}
            pricing={pricing}
            translations={translations}
            currentLanguage={currentLanguage}
            getLocalizedTitle={getLocalizedTitle}
            getDiscountPercentage={getDiscountPercentage}
            discountedPrice={discountedPrice}
          />

          <DescriptionSection 
            subscription={subscription}
            getLocalizedDescription={getLocalizedDescription}
            translations={translations}
          />
        </div>

        {/* Right Column - Variants and Purchase */}
        <div className="space-y-6">
          <VariantSelector 
            subscription={subscription}
            selectedVariant={selectedVariant}
            selectedBase={selectedBase}
            translations={translations}
            currentLanguage={currentLanguage}
            onVariantSelection={handleVariantSelection}
          />

          <PurchaseSection 
            subscription={subscription}
            selectedVariant={selectedVariant}
            selectedBase={selectedBase}
            pricing={pricing}
            translations={translations}
            currentLanguage={currentLanguage}
            isProcessing={isProcessing}
            isLoading={isLoading}
            purchaseError={purchaseError}
            appliedCouponCode={appliedCouponCode}
            discountedPrice={discountedPrice}
            discountAmount={discountAmount}
            isSomethingSelected={isSomethingSelected}
            onSubscribe={handlePurchase}
            getCurrentPrice={getCurrentPrice}
            getCurrentVariantKey={getCurrentVariantKey}
            getSubscribeButtonText={getSubscribeButtonText}
            onCouponApplied={(code, discountedPrice, discountAmount) => {
              setAppliedCouponCode(code);
              setDiscountedPrice(discountedPrice);
              setDiscountAmount(discountAmount);
            }}
            onCouponRemoved={() => {
              setAppliedCouponCode('');
              setDiscountedPrice(null);
              setDiscountAmount(0);
            }}
            onErrorDismiss={() => {
              setPurchaseError('');
              clearError();
            }}
          />

          <FeaturesList 
            features={getLocalizedFeatures()}
            translations={translations}
          />
        </div>
      </div>
    </motion.div>
  );
}