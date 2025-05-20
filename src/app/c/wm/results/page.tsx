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
            features,
            featuresEs,
            image,
            isActive,
            isFeatured,
            stripePriceId
          }`
        );
        
        if (result) {
          // Cast the result to Subscription (not an array)
          const subscription = result as Subscription;
          
          // Generate image URL if available
          const imageUrl = subscription.image 
            ? urlFor(subscription.image).width(800).height(600).url()
            : '/images/weight-loss-product.jpg';
          
          setFeaturedSubscription({
            subscription,
            imageUrl,
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
  const getBillingPeriodDisplay = (period: string): string => {
    switch (period.toLowerCase()) {
      case 'monthly':
        return '/month';
      case 'quarterly':
        return '/quarter';
      case 'annually':
        return '/year';
      default:
        return `/${period}`;
    }
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
          {/* Featured Product Section with Large Image on Left, Features on Right */}
          <motion.div 
            className="bg-white rounded-xl shadow-xl overflow-hidden mb-16"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: showContent ? 1 : 0, y: showContent ? 0 : 20 }}
            transition={{ duration: 0.7 }}
          >
            <div className="flex flex-col lg:flex-row">
              {/* Left Side - Product Image and Basic Info */}
              <div className="w-full lg:w-1/2 relative">
                {/* Product Image */}
                <div className="relative w-full h-[300px] lg:h-full min-h-[400px]">
                  {featuredSubscription.isLoading ? (
                    <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
                      <div className="w-16 h-16 border-4 border-gray-300 border-t-[#fe92b5] rounded-full animate-spin"></div>
                    </div>
                  ) : (
                    <Image 
                      src={featuredSubscription.imageUrl}
                      alt={featuredSubscription.subscription?.title || "Weight Loss Product"}
                      fill
                      style={{ objectFit: 'cover' }}
                      priority
                      sizes="(max-width: 1024px) 100vw, 50vw"
                    />
                  )}
                </div>
                
                {/* Product Details Overlay */}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-6 text-white">
                  <h2 className="text-2xl font-bold mb-2">
                    {featuredSubscription.subscription?.title || "Weight Loss Subscription"}
                  </h2>
                  
                  {featuredSubscription.subscription && (
                    <div className="flex items-center">
                      <span className="text-xl font-bold">
                        {formatCurrency(featuredSubscription.subscription.price)}
                      </span>
                      <span className="ml-1 opacity-90">
                        {getBillingPeriodDisplay(featuredSubscription.subscription.billingPeriod)}
                      </span>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Right Side - Features */}
              <div className="w-full lg:w-1/2 p-6 lg:p-10 flex flex-col">
                <h2 className="text-3xl font-bold text-gray-900 mb-6">
                  Start Your Weight Loss Journey Today
                </h2>
                
                <p className="text-gray-700 mb-8">
                  Our clinically-backed weight management program combines medical expertise with ongoing support to help you achieve sustainable results. Members typically experience significant weight loss within the first 3 months.
                </p>
                
                {/* Features Cards */}
                <div className="space-y-4 mb-auto">
                  <motion.div 
                    className="bg-[#f9f9f9] rounded-xl p-5 flex items-start gap-4"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: showFeatures ? 1 : 0, y: showFeatures ? 0 : 10 }}
                    transition={{ duration: 0.5, delay: 0 }}
                  >
                    <div className="w-12 h-12 rounded-full bg-[#ffe6f0] flex items-center justify-center flex-shrink-0">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-[#e63946]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">Clinically Proven Results</h3>
                      <p className="text-gray-600">Members experience an average of 15-20% weight loss over 6 months when following our program.</p>
                    </div>
                  </motion.div>
                  
                  <motion.div 
                    className="bg-[#f9f9f9] rounded-xl p-5 flex items-start gap-4"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: showFeatures ? 1 : 0, y: showFeatures ? 0 : 10 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                  >
                    <div className="w-12 h-12 rounded-full bg-[#ffe6f0] flex items-center justify-center flex-shrink-0">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-[#e63946]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">Medical Provider Support</h3>
                      <p className="text-gray-600">Ongoing access to licensed medical professionals who monitor your progress and adjust your treatment.</p>
                    </div>
                  </motion.div>
                  
                  <motion.div 
                    className="bg-[#f9f9f9] rounded-xl p-5 flex items-start gap-4"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: showFeatures ? 1 : 0, y: showFeatures ? 0 : 10 }}
                    transition={{ duration: 0.5, delay: 0.4 }}
                  >
                    <div className="w-12 h-12 rounded-full bg-[#ffe6f0] flex items-center justify-center flex-shrink-0">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-[#e63946]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">Convenient & Discreet</h3>
                      <p className="text-gray-600">Home delivery of your medication and virtual check-ins - no in-person visits required.</p>
                    </div>
                  </motion.div>
                  
                  <motion.div 
                    className="bg-[#f9f9f9] rounded-xl p-5 flex items-start gap-4"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: showFeatures ? 1 : 0, y: showFeatures ? 0 : 10 }}
                    transition={{ duration: 0.5, delay: 0.6 }}
                  >
                    <div className="w-12 h-12 rounded-full bg-[#ffe6f0] flex items-center justify-center flex-shrink-0">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-[#e63946]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">30-Day Guarantee</h3>
                      <p className="text-gray-600">If you're not satisfied with our program in the first 30 days, we'll issue a full refund.</p>
                    </div>
                  </motion.div>
                </div>
                
                {/* CTA Button */}
                <div className="mt-8">
                  {featuredSubscription.subscription && (
                    <button
                      onClick={handleSubscribe}
                      disabled={isProcessing || isLoading}
                      className={`w-full py-4 px-6 rounded-full text-white font-bold text-lg transition-all ${
                        isProcessing || isLoading 
                          ? 'bg-gray-400 cursor-not-allowed' 
                          : 'bg-black hover:bg-gray-900 shadow-md hover:shadow-lg'
                      }`}
                    >
                      {getSubscribeButtonText()}
                    </button>
                  )}
                  
                  {error && (
                    <p className="mt-2 text-sm text-red-600 text-center">
                      {error}
                    </p>
                  )}
                  
                  <p className="text-center text-gray-500 text-sm mt-4">
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