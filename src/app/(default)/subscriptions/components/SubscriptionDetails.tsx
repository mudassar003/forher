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
    standardPlan: currentLanguage === 'es' ? 'Plan Estándar' : 'Standard Plan',
    imageDisclaimer: currentLanguage === 'es' ? 'La imagen es ilustrativa. El producto enviado puede variar en apariencia.' : 'Product image for illustration. Actual product appearance may vary when shipped.',
    lowestPrice: currentLanguage === 'es' ? 'Precio Más Bajo' : 'Lowest Price',
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
  }), [currentLanguage]);

  // Get pricing information using custom hook - FIXED: Pass currentLanguage instead of translations object
  const pricing = useSubscriptionPricing(
    subscription,
    selectedVariant,
    selectedBase,
    discountedPrice,
    currentLanguage  // Pass language string instead of translations object
  );

  // Initialize variant selection
  useEffect(() => {
    if (subscription.hasVariants && subscription.variants && subscription.variants.length > 0) {
      const defaultVariant = subscription.variants.find(variant => variant.isDefault);
      
      if (defaultVariant) {
        setSelectedVariant(defaultVariant);
        setSelectedBase(false);
      } else {
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

  // Memoize helper functions to prevent recreating on every render
  const getLocalizedTitle = useCallback((): string => {
    if (currentLanguage === 'es' && subscription.titleEs && subscription.titleEs.trim() !== '') {
      return subscription.titleEs;
    }
    return subscription.title;
  }, [currentLanguage, subscription.titleEs, subscription.title]);

  const getLocalizedDescription = useCallback(() => {
    if (currentLanguage === 'es' && subscription.descriptionEs && subscription.descriptionEs.length > 0) {
      return subscription.descriptionEs;
    }
    return subscription.description;
  }, [currentLanguage, subscription.descriptionEs, subscription.description]);

  const getLocalizedFeatures = useCallback(() => {
    if (currentLanguage === 'es' && subscription.featuresEs && subscription.featuresEs.length > 0) {
      return subscription.featuresEs;
    }
    return subscription.features || [];
  }, [currentLanguage, subscription.featuresEs, subscription.features]);

  const getCurrentPrice = useCallback((): number => {
    if (selectedBase || !selectedVariant) {
      return subscription.price;
    }
    return selectedVariant.price;
  }, [selectedBase, selectedVariant, subscription.price]);

  const getCurrentVariantKey = useCallback((): string | undefined => {
    if (selectedBase) return undefined;
    return selectedVariant?._key;
  }, [selectedBase, selectedVariant]);

  const isSomethingSelected = useCallback((): boolean => {
    if (!subscription.hasVariants) return true;
    return selectedBase || selectedVariant !== null;
  }, [subscription.hasVariants, selectedBase, selectedVariant]);

  const getSubscribeButtonText = useCallback((): string => {
    if (isProcessing || isLoading) {
      return translations.processing;
    }
    return translations.buyNow;
  }, [isProcessing, isLoading, translations.processing, translations.buyNow]);

  // Event handlers - use useCallback to prevent recreating
  const handleVariantSelection = useCallback((variant: SubscriptionVariant | null, isBase: boolean = false): void => {
    if (isBase) {
      setSelectedBase(true);
      setSelectedVariant(null);
    } else {
      setSelectedBase(false);
      setSelectedVariant(variant);
    }
    
    // Reset coupon when selection changes
    if (appliedCouponCode) {
      setAppliedCouponCode('');
      setDiscountedPrice(null);
      setDiscountAmount(0);
    }
    
    // Clear any previous errors
    setPurchaseError('');
    clearError();
  }, [appliedCouponCode, clearError]);

  const handleCouponApplied = useCallback((code: string, newPrice: number, discount: number): void => {
    setAppliedCouponCode(code);
    setDiscountedPrice(newPrice);
    setDiscountAmount(discount);
    setPurchaseError('');
  }, []);

  const handleCouponRemoved = useCallback((): void => {
    setAppliedCouponCode('');
    setDiscountedPrice(null);
    setDiscountAmount(0);
    setPurchaseError('');
  }, []);

  const handleSubscribe = useCallback(async (): Promise<void> => {
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
    clearError, 
    isAuthenticated, 
    subscription._id, 
    subscription.hasVariants, 
    selectedVariant, 
    selectedBase, 
    appliedCouponCode, 
    purchaseSubscription
  ]);

  const handleErrorDismiss = useCallback((): void => {
    setPurchaseError('');
    clearError();
  }, [clearError]);

  // Animation variants - memoize to prevent recreating
  const containerVariants = useMemo(() => ({
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.1
      }
    }
  }), []);

  const itemVariants = useMemo(() => ({
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  }), []);

  return (
    <div className="bg-white min-h-screen">
      {/* Breadcrumb Navigation */}
      <SubscriptionBreadcrumb
        translations={translations}
        title={getLocalizedTitle()}
      />

      {/* Main Content */}
      <motion.div 
        className="container mx-auto px-4 py-8 md:py-12"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16">
            {/* Left Column - Image */}
            <motion.div variants={itemVariants}>
              <SubscriptionImage
                subscription={subscription}
                pricing={pricing}
                translations={translations}
                selectedVariant={selectedVariant}
                selectedBase={selectedBase}
                discountedPrice={discountedPrice}
              />
            </motion.div>
            
            {/* Right Column - Purchase Section */}
            <motion.div variants={itemVariants}>
              {/* Variant Selector */}
              <VariantSelector
                subscription={subscription}
                selectedVariant={selectedVariant}
                selectedBase={selectedBase}
                translations={translations}
                currentLanguage={currentLanguage}
                onVariantSelection={handleVariantSelection}
              />
              
              {/* Purchase Section */}
              <PurchaseSection
                subscription={subscription}
                selectedVariant={selectedVariant}
                selectedBase={selectedBase}
                appliedCouponCode={appliedCouponCode}
                discountedPrice={discountedPrice}
                purchaseError={purchaseError}
                error={error}
                translations={translations}
                isProcessing={isProcessing}
                isLoading={isLoading}
                isSomethingSelected={isSomethingSelected()}
                onCouponApplied={handleCouponApplied}
                onCouponRemoved={handleCouponRemoved}
                onSubscribe={handleSubscribe}
                onErrorDismiss={handleErrorDismiss}
                getCurrentPrice={getCurrentPrice}
                getCurrentVariantKey={getCurrentVariantKey}
                getSubscribeButtonText={getSubscribeButtonText}
              />
              
              {/* Features List */}
              <FeaturesList
                features={getLocalizedFeatures()}
                translations={translations}
              />

              {/* Description Section */}
              <DescriptionSection
                description={getLocalizedDescription()}
                translations={translations}
              />
            </motion.div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}