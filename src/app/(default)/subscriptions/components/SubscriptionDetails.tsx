// src/app/(default)/subscriptions/components/SubscriptionDetails.tsx
"use client";

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Subscription } from '@/types/subscription-page';
import PortableText from '@/components/PortableText';
import useTranslations from '@/hooks/useTranslations';
import { useSubscriptionPurchase } from '@/hooks/useSubscriptionPurchase';
import { useAuthStore } from '@/store/authStore';
import { urlFor } from '@/sanity/lib/image';

interface SubscriptionDetailsProps {
  subscription: Subscription;
}

const SubscriptionDetails: React.FC<SubscriptionDetailsProps> = ({ subscription }) => {
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const { t, currentLanguage } = useTranslations();
  const { purchaseSubscription, isLoading, error } = useSubscriptionPurchase();
  const { user, isAuthenticated, checkSession } = useAuthStore();
  
  // Custom translations
  const translations = {
    home: currentLanguage === 'es' ? 'Inicio' : 'Home',
    subscriptions: currentLanguage === 'es' ? 'Suscripciones' : 'Subscriptions',
    included: currentLanguage === 'es' ? 'Qué Incluye' : "What's Included",
    viewMoreDetails: currentLanguage === 'es' ? 'Ver Más Detalles' : 'View More Details',
    relatedPlans: currentLanguage === 'es' ? 'Planes Relacionados' : 'Related Plans',
    viewPlan: currentLanguage === 'es' ? 'Ver Plan' : 'View Plan',
    cancelAnytime: currentLanguage === 'es' ? 'Garantía de 30 días • Cancele en cualquier momento' : '30-day guarantee • Cancel anytime'
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

  // Format currency
  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Determine proper billing period display
  const getBillingPeriodDisplay = (): string => {
    if (currentLanguage === 'es') {
      switch (subscription.billingPeriod.toLowerCase()) {
        case 'monthly':
          return '/mes';
        case 'quarterly':
          return '/trimestre';
        case 'annually':
          return '/año';
        default:
          return `/${subscription.billingPeriod}`;
      }
    } else {
      switch (subscription.billingPeriod.toLowerCase()) {
        case 'monthly':
          return '/month';
        case 'quarterly':
          return '/quarter';
        case 'annually':
          return '/year';
        default:
          return `/${subscription.billingPeriod}`;
      }
    }
  };

  // Handle the subscription purchase
  const handleSubscribe = async (): Promise<void> => {
    if (isProcessing || isLoading) return;
    
    // Store current path in sessionStorage
    const currentPath = window.location.pathname;
    sessionStorage.setItem('subscriptionReturnPath', currentPath);
    
    // If not authenticated, redirect to login with return URL
    if (!isAuthenticated) {
      // Save intended subscription ID to purchase after login
      sessionStorage.setItem('pendingSubscriptionId', subscription._id);
      const returnUrl = encodeURIComponent(currentPath);
      window.location.href = `/login?returnUrl=${returnUrl}`;
      return;
    }
    
    setIsProcessing(true);
    
    try {
      // Store appointment page as the return URL after successful purchase
      sessionStorage.setItem('loginReturnUrl', '/appointment');
      
      const result = await purchaseSubscription(subscription._id);
      
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

  // Get subscription button text based on state
  const getSubscribeButtonText = (): string => {
    if (isProcessing || isLoading) {
      return currentLanguage === 'es' ? 'Procesando...' : 'Processing...';
    }
    
    if (isAuthenticated) {
      return currentLanguage === 'es' ? 'Suscribirse Ahora' : 'Subscribe Now';
    }
    
    return currentLanguage === 'es' ? 'Iniciar Sesión para Suscribirse' : 'Sign In to Subscribe';
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

  // Prepare image URL if it exists
  const imageUrl = subscription.image 
    ? urlFor(subscription.image).width(800).height(600).url()
    : '/images/subscription-placeholder.jpg';

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
            {/* Left Column - Image and Details */}
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
              <div className="flex items-center mb-6">
                <span className="text-3xl font-bold text-[#e63946]">
                  {formatCurrency(subscription.price)}
                </span>
                <span className="text-gray-600 ml-2">
                  {getBillingPeriodDisplay()}
                </span>
              </div>
              
              {/* Main Image */}
              <div className="relative w-full h-[300px] md:h-[400px] rounded-lg overflow-hidden mb-8">
                <Image
                  src={imageUrl}
                  alt={getLocalizedTitle()}
                  fill
                  style={{ objectFit: 'cover' }}
                  className="rounded-lg"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 600px"
                  priority
                />
              </div>
              
              {/* Description */}
              <div className="prose max-w-none mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  {t('subscriptions.description')}
                </h2>
                {getLocalizedDescription() && (
                  <PortableText value={getLocalizedDescription() || []} className="text-gray-700" />
                )}
              </div>
            </motion.div>
            
            {/* Right Column - Features and CTA */}
            <motion.div variants={itemVariants}>
              <div className="bg-gray-50 rounded-xl p-6 md:p-8 mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  {t('subscriptions.included')}
                </h2>
                
                {/* Features List */}
                <div className="space-y-4 mb-8">
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
                
                {/* Subscription CTA */}
                <div className="border-t border-gray-200 pt-6">
                  <button
                    onClick={handleSubscribe}
                    disabled={isProcessing || isLoading}
                    className={`w-full py-4 px-6 rounded-full text-white font-bold text-lg transition-all ${
                      isProcessing || isLoading 
                        ? 'bg-gray-400 cursor-not-allowed' 
                        : 'bg-[#e63946] hover:bg-[#d52d3a] shadow-md hover:shadow-lg'
                    }`}
                  >
                    {getSubscribeButtonText()}
                  </button>
                  
                  {error && (
                    <p className="mt-2 text-sm text-red-600 text-center">
                      {error}
                    </p>
                  )}
                  
                  <p className="text-center text-sm text-gray-600 mt-4">
                    {t('subscriptions.cancelAnytime')}
                  </p>
                </div>
              </div>
              
              {/* Categories */}
              {subscription.categories && subscription.categories.length > 0 && (
                <div className="bg-gray-50 rounded-xl p-6 md:p-8">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    {t('subscriptions.categories')}
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {subscription.categories.map((category) => (
                      <Link
                        key={category._id}
                        href={`/subscriptions?category=${category.slug.current}`}
                        className="inline-block px-4 py-2 bg-white border border-gray-200 rounded-full text-sm text-gray-700 hover:border-[#e63946] hover:text-[#e63946] transition-colors"
                      >
                        {currentLanguage === 'es' && category.titleEs ? category.titleEs : category.title}
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </motion.div>
      
      {/* Related Subscriptions - can be implemented later if needed */}
    </div>
  );
};

export default SubscriptionDetails;