// src/app/c/wm/results/page.tsx
"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { groq } from 'next-sanity';
import { client } from '@/sanity/lib/client';
import { urlFor } from '@/sanity/lib/image';
import { Subscription } from '@/types/subscription-page';
import { useSubscriptionPurchase } from '@/hooks/useSubscriptionPurchase';
import { useAuthStore } from '@/store/authStore';
import WeightLossSubscriptionGrid from "../components/WeightLossSubscriptionGrid";
import { formatPriceWithBillingPeriod } from '@/utils/subscriptionHelpers';

// Define component properties
interface WeightLossResultsProps {}

// Interface for featured subscription with image
interface FeaturedSubscriptionWithImage {
  subscription: Subscription | null;
  imageUrl: string;
  isLoading: boolean;
  error: string | null;
}

export default function ResultsPage({}: WeightLossResultsProps) {
  // Animation states
  const [showContent, setShowContent] = useState<boolean>(false);
  const [showFeatures, setShowFeatures] = useState<boolean>(false);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const { purchaseSubscription, isLoading, error } = useSubscriptionPurchase();
  const { user, isAuthenticated, checkSession } = useAuthStore();
  
  const [featuredSubscription, setFeaturedSubscription] = useState<FeaturedSubscriptionWithImage>({
    subscription: null,
    imageUrl: '/images/weight-loss-product.jpg', // Default fallback image
    isLoading: true,
    error: null
  });
  
  // Fetch featured subscription
  useEffect(() => {
    const fetchFeaturedSubscription = async (): Promise<void> => {
      try {
        // Query for weight loss subscription that is marked as featured
        const result = await client.fetch(
          groq`*[
            _type == "subscription" && 
            references(*[_type == "subscriptionCategory" && slug.current == "weight-loss"]._id) && 
            isActive == true && 
            isDeleted != true
          ] | order(isFeatured desc) [0] {
            _id,
            title,
            titleEs,
            slug,
            description,
            descriptionEs,
            price,
            billingPeriod,
            customBillingPeriodMonths,
            features,
            featuresEs,
            image,
            featuredImage,
            isActive,
            isFeatured,
            stripePriceId
          }`
        );
        
        if (result) {
          // Cast the result to Subscription (not an array)
          const subscription = result as Subscription;
          
          // Generate image URL based on available images, with featuredImage as priority
          let imgUrl = '/images/weight-loss-product.jpg'; // Default fallback
          
          if (subscription.featuredImage) {
            imgUrl = urlFor(subscription.featuredImage)
              .width(500)  // Optimized width for 4:3 aspect ratio
              .height(375) // Optimized height for 4:3 aspect ratio
              .url();
          } else if (subscription.image) {
            imgUrl = urlFor(subscription.image)
              .width(500)  // Optimized width for 4:3 aspect ratio
              .height(375) // Optimized height for 4:3 aspect ratio
              .url();
          }
          
          setFeaturedSubscription({
            subscription,
            imageUrl: imgUrl,
            isLoading: false,
            error: null
          });
        } else {
          setFeaturedSubscription({
            subscription: null,
            imageUrl: '/images/weight-loss-product.jpg',
            isLoading: false,
            error: "No featured subscription found"
          });
        }
      } catch (err) {
        console.error("Error fetching featured subscription:", err);
        setFeaturedSubscription({
          subscription: null,
          imageUrl: '/images/weight-loss-product.jpg',
          isLoading: false,
          error: err instanceof Error ? err.message : "An unknown error occurred"
        });
      }
    };
    
    fetchFeaturedSubscription();
  }, []);
  
  // Check auth state when component mounts
  useEffect(() => {
    if (!isAuthenticated) {
      checkSession();
    }
  }, [isAuthenticated, checkSession]);
  
  // Sequential animations
  useEffect(() => {
    const contentTimer = setTimeout(() => {
      setShowContent(true);
    }, 300);
    
    const featuresTimer = setTimeout(() => {
      setShowFeatures(true);
    }, 1200);
    
    return () => {
      clearTimeout(contentTimer);
      clearTimeout(featuresTimer);
    };
  }, []);

  // Get formatted price with billing period
  const getFormattedPrice = (): React.ReactNode => {
    if (!featuredSubscription.subscription) return null;
    
    const subscription = featuredSubscription.subscription;
    const price = subscription.price;
    const billingPeriod = subscription.billingPeriod;
    const customBillingPeriodMonths = subscription.customBillingPeriodMonths;
    
    const fullPrice = formatPriceWithBillingPeriod(
      price, 
      billingPeriod, 
      customBillingPeriodMonths,
      { showMonthlyEquivalent: false }
    );
    
    // For non-monthly plans, also show the monthly equivalent
    if (billingPeriod !== 'monthly') {
      // Calculate price per month
      let monthsInPeriod: number;
      
      switch (billingPeriod) {
        case 'annually':
          monthsInPeriod = 12;
          break;
        case 'three_month':
          monthsInPeriod = 3;
          break;
        case 'six_month':
          monthsInPeriod = 6;
          break;
        case 'other':
          monthsInPeriod = customBillingPeriodMonths || 1;
          break;
        default:
          monthsInPeriod = 1;
      }
      
      const monthlyPrice = price / monthsInPeriod;
      
      // Format monthly price
      const formattedMonthlyPrice = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(monthlyPrice);
      
      return (
        <div>
          <span className="text-2xl font-bold">{fullPrice}</span>
          <span className="block text-sm text-gray-600 mt-1">
            ({formattedMonthlyPrice} per month)
          </span>
        </div>
      );
    }
    
    return <span className="text-2xl font-bold">{fullPrice}</span>;
  };
  
  // Handle subscription purchase button click
  const handleSubscribe = async (): Promise<void> => {
    if (!featuredSubscription.subscription || isProcessing || isLoading) return;
    
    // Store current path in sessionStorage
    const currentPath = window.location.pathname;
    sessionStorage.setItem('subscriptionReturnPath', currentPath);
    
    // If not authenticated, redirect to login with return URL
    if (!isAuthenticated) {
      // Save intended subscription ID to purchase after login
      sessionStorage.setItem('pendingSubscriptionId', featuredSubscription.subscription._id);
      const returnUrl = encodeURIComponent(currentPath);
      window.location.href = `/login?returnUrl=${returnUrl}`;
      return;
    }
    
    setIsProcessing(true);
    
    try {
      // Store appointment page as the return URL after successful purchase
      sessionStorage.setItem('loginReturnUrl', '/appointment');
      
      const result = await purchaseSubscription(featuredSubscription.subscription._id);
      
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
      return 'Processing...';
    }
    
    if (isAuthenticated) {
      return 'Subscribe Now';
    }
    
    return 'Sign In to Subscribe';
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Logo Only - No Link */}
      <div className="absolute top-6 left-6 z-10">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Image 
            src="/Logo.png" 
            alt="Logo" 
            width={100} 
            height={40} 
            className="h-10 w-auto"
          />
        </motion.div>
      </div>
      
      {/* Hero Section with Gradient Background */}
      <div className="relative min-h-[40vh] flex items-center justify-center bg-gradient-to-r from-[#ffe6f0] to-[#fff8f9] overflow-hidden">
        {/* Background decorative elements */}
        <div className="absolute top-20 left-[10%] w-32 h-32 rounded-full bg-[#ff92b5] opacity-10 blur-3xl"></div>
        <div className="absolute bottom-10 right-[15%] w-40 h-40 rounded-full bg-[#e63946] opacity-10 blur-3xl"></div>
        
        <div className="container mx-auto px-4 py-16 relative z-10">
          <motion.div 
            className="text-center max-w-3xl mx-auto"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center justify-center w-20 h-20 bg-white text-[#e63946] rounded-full mb-6 shadow-lg">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">Your Personalized Recommendation</h1>
            <div className="h-1 w-24 bg-[#e63946] mx-auto mb-6"></div>
            <p className="text-xl text-gray-700">
              Based on your assessment, we've found the perfect weight loss solution for you.
            </p>
          </motion.div>
        </div>
        
        {/* Wave separator */}
        <div className="absolute bottom-0 left-0 w-full">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 100" fill="#ffffff">
            <path d="M0,60 C240,100 480,0 720,30 C960,60 1200,100 1440,80 L1440,100 L0,100 Z"></path>
          </svg>
        </div>
      </div>
      
      {/* Main Content Section */}
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-6xl mx-auto">
          {/* Featured Product Section - Redesigned for better height balance */}
          <motion.div 
            className="bg-white rounded-xl shadow-xl overflow-hidden mb-16"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: showContent ? 1 : 0, y: showContent ? 0 : 20 }}
            transition={{ duration: 0.7 }}
          >
            {/* Use a card-style design with better proportions */}
            <div className="bg-gradient-to-r from-[#e63946] to-[#ff4d6d] p-6 text-white">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
                <h2 className="text-2xl font-bold">
                  {featuredSubscription.subscription?.title || "Weight Loss Subscription"}
                </h2>
                <span className="px-3 py-1 bg-white text-[#e63946] text-sm font-semibold rounded-full inline-block w-max">
                  Recommended
                </span>
              </div>
              <p className="opacity-80 mt-1">Personalized weight management program</p>
            </div>
            
            <div className="flex flex-col md:flex-row">
              {/* Left side - Image in a fixed ratio container */}
              <div className="md:w-2/5 p-4">
                <div className="aspect-[4/3] w-full relative rounded-lg overflow-hidden">
                  {featuredSubscription.isLoading ? (
                    <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
                      <div className="w-12 h-12 border-4 border-gray-300 border-t-[#fe92b5] rounded-full animate-spin"></div>
                    </div>
                  ) : (
                    <Image 
                      src={featuredSubscription.imageUrl}
                      alt={featuredSubscription.subscription?.title || "Weight Loss Product"}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, 400px"
                      priority
                    />
                  )}
                </div>
                
                {/* Price and billing details */}
                {featuredSubscription.subscription && (
                  <div className="mt-4 flex items-center justify-center">
                    <span className="text-[#e63946]">
                      {getFormattedPrice()}
                    </span>
                  </div>
                )}
              </div>
              
              {/* Right side - Features and CTA */}
              <div className="md:w-3/5 p-4 md:p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">
                  Program Features:
                </h3>
                
                {/* Features with smaller, more compact design */}
                <div className="space-y-3 mb-6">
                  {featuredSubscription.subscription && featuredSubscription.subscription.features && 
                   featuredSubscription.subscription.features.length > 0 ? (
                    // Render actual features from Sanity
                    featuredSubscription.subscription.features.map((feature, index) => (
                      <motion.div 
                        key={`feature-${index}`}
                        className="flex items-start gap-3"
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: showFeatures ? 1 : 0, x: showFeatures ? 0 : -10 }}
                        transition={{ duration: 0.4, delay: index * 0.1 }}
                      >
                        <div className="w-6 h-6 rounded-full bg-[#ffe6f0] flex items-center justify-center flex-shrink-0 mt-0.5">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-[#e63946]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                        <p className="text-gray-700">{feature.featureText}</p>
                      </motion.div>
                    ))
                  ) : (
                    // Fallback features in case none are available from Sanity
                    <>
                      <motion.div 
                        className="flex items-start gap-3"
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: showFeatures ? 1 : 0, x: showFeatures ? 0 : -10 }}
                        transition={{ duration: 0.4, delay: 0 }}
                      >
                        <div className="w-6 h-6 rounded-full bg-[#ffe6f0] flex items-center justify-center flex-shrink-0 mt-0.5">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-[#e63946]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                          </svg>
                        </div>
                        <div>
                          <p className="text-gray-700">Clinically proven results with 15-20% average weight loss</p>
                        </div>
                      </motion.div>
                      
                      <motion.div 
                        className="flex items-start gap-3"
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: showFeatures ? 1 : 0, x: showFeatures ? 0 : -10 }}
                        transition={{ duration: 0.4, delay: 0.1 }}
                      >
                        <div className="w-6 h-6 rounded-full bg-[#ffe6f0] flex items-center justify-center flex-shrink-0 mt-0.5">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-[#e63946]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                          </svg>
                        </div>
                        <div>
                          <p className="text-gray-700">Medical provider support with personalized treatment</p>
                        </div>
                      </motion.div>
                      
                      <motion.div 
                        className="flex items-start gap-3"
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: showFeatures ? 1 : 0, x: showFeatures ? 0 : -10 }}
                        transition={{ duration: 0.4, delay: 0.2 }}
                      >
                        <div className="w-6 h-6 rounded-full bg-[#ffe6f0] flex items-center justify-center flex-shrink-0 mt-0.5">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-[#e63946]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                        <div>
                          <p className="text-gray-700">Convenient home delivery with virtual check-ins</p>
                        </div>
                      </motion.div>
                    </>
                  )}
                </div>
                
                {/* CTA Section */}
                <div className="mt-4">
                  {/* View Details Link */}
                  {featuredSubscription.subscription?.slug && featuredSubscription.subscription.slug.current && (
                    <div className="mb-3">
                      <Link 
                        href={`/subscriptions/${featuredSubscription.subscription.slug.current}`}
                        className="block w-full text-center border border-[#e63946] text-[#e63946] font-medium py-2 px-4 rounded-full hover:bg-[#fff5f7] transition-colors"
                      >
                        View Plan Details
                      </Link>
                    </div>
                  )}

                  {/* Subscribe Button */}
                  {featuredSubscription.subscription && (
                    <button
                      onClick={handleSubscribe}
                      disabled={isProcessing || isLoading}
                      className={`w-full py-3 px-4 rounded-full text-white font-medium transition-colors ${
                        isProcessing || isLoading 
                          ? 'bg-gray-400 cursor-not-allowed' 
                          : 'bg-black hover:bg-gray-900 shadow-md hover:shadow-lg'
                      }`}
                    >
                      {getSubscribeButtonText()}
                    </button>
                  )}
                  
                  {error && (
                    <p className="mt-2 text-xs text-red-600 text-center">
                      {error}
                    </p>
                  )}
                  
                  <p className="text-center text-gray-500 text-xs mt-2">
                    30-day satisfaction guarantee • Cancel anytime
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
          
          {/* Weight Loss Subscription Grid */}
          <motion.div 
            className="mt-16 mb-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: showFeatures ? 1 : 0, y: showFeatures ? 0 : 20 }}
            transition={{ duration: 0.7, delay: 0.7 }}
          >
            <h2 className="text-2xl font-bold text-center text-gray-900 mb-8">
              Our Weight Loss Subscription Plans
            </h2>
            
            {/* Import and use the WeightLossSubscriptionGrid component */}
            <div className="bg-[#f9f9f9] rounded-xl p-8">
              <WeightLossSubscriptionGrid />
            </div>
          </motion.div>
          
          {/* Minimal Footer - No Button or CTA Text */}
          <div className="bg-gray-50 py-8 text-center mt-16">
            <div className="container mx-auto px-4">
              <p className="text-xs text-gray-400 mb-2">
                Results may vary. These statements have not been evaluated by the FDA.
              </p>
              <p className="text-xs text-gray-400">
                © {new Date().getFullYear()} All rights reserved.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}