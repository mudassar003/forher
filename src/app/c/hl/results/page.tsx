//src/app/c/hl/results/page.tsx
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
import HairLossSubscriptionGrid from "../components/HairLossSubscriptionGrid";
import { formatPriceWithBillingPeriod } from '@/utils/subscriptionHelpers';

// Define component properties
interface HairLossResultsProps {}

// Interface for featured subscription with image
interface FeaturedSubscriptionWithImage {
  subscription: Subscription | null;
  imageUrl: string;
  isLoading: boolean;
  error: string | null;
}

export default function HairLossResultsPage({}: HairLossResultsProps) {
  // Animation states
  const [showContent, setShowContent] = useState<boolean>(false);
  const [showFeatures, setShowFeatures] = useState<boolean>(false);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const { purchaseSubscription, isLoading, error } = useSubscriptionPurchase();
  const { user, isAuthenticated, checkSession } = useAuthStore();
  
  const [featuredSubscription, setFeaturedSubscription] = useState<FeaturedSubscriptionWithImage>({
    subscription: null,
    imageUrl: '/images/hair-loss-product.jpg', // Default fallback image
    isLoading: true,
    error: null
  });
  
  // Fetch featured subscription
  useEffect(() => {
    const fetchFeaturedSubscription = async (): Promise<void> => {
      try {
        // Query for hair care subscription that is marked as featured
        const result = await client.fetch(
          groq`*[
            _type == "subscription" && 
            references(*[_type == "subscriptionCategory" && slug.current == "hair-care"]._id) && 
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
          let imgUrl = '/images/hair-loss-product.jpg'; // Default fallback
          
          if (subscription.featuredImage) {
            imgUrl = urlFor(subscription.featuredImage)
              .width(600)  // Increased width for larger image
              .height(450) // Increased height for larger image
              .url();
          } else if (subscription.image) {
            imgUrl = urlFor(subscription.image)
              .width(600)  // Increased width for larger image
              .height(450) // Increased height for larger image
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
            imageUrl: '/images/hair-loss-product.jpg',
            isLoading: false,
            error: "No featured subscription found"
          });
        }
      } catch (err) {
        console.error("Error fetching featured subscription:", err);
        setFeaturedSubscription({
          subscription: null,
          imageUrl: '/images/hair-loss-product.jpg',
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
  const handlePurchase = async (): Promise<void> => {
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
  const getPurchaseButtonText = (): string => {
    if (isProcessing || isLoading) {
      return 'Processing...';
    }
    
    if (isAuthenticated) {
      return 'Purchase Now';
    }
    
    return 'Sign In to Purchase';
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
            <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">Your Personalized Hair Loss Recommendation</h1>
            <div className="h-1 w-24 bg-[#e63946] mx-auto mb-6"></div>
            <p className="text-xl text-gray-700">
              Based on your assessment, we've found the perfect hair loss solution for you.
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
          {/* Note from Lilys Section - NEW ADDITION */}
          <motion.div
            className="bg-white rounded-xl shadow-lg p-6 mb-10 border-l-4 border-[#fe92b5]"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: showContent ? 1 : 0, y: showContent ? 0 : 20 }}
            transition={{ duration: 0.7 }}
          >
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 rounded-full bg-[#ffe6f0] flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-[#e63946]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-black mb-2">Why We Chose This For You</h3>
                <p className="text-black">
                  Based on your responses, we've selected a hair loss treatment program that's tailored to your specific needs. 
                  At Lilys, we believe that personalized care leads to better results. This recommendation takes into account 
                  your hair loss pattern, duration, medical history, and personal preferences to provide you with the most effective solution.
                </p>
              </div>
            </div>
          </motion.div>

          {/* Conditional rendering based on whether we have a featured subscription */}
          {featuredSubscription.subscription ? (
            // Featured Product Section - Redesigned for better height balance
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
                    {featuredSubscription.subscription.title}
                  </h2>
                  <span className="px-3 py-1 bg-white text-[#e63946] text-sm font-semibold rounded-full inline-block w-max">
                    Recommended
                  </span>
                </div>
                <p className="opacity-80 mt-1">Personalized hair restoration program</p>
              </div>
              
              <div className="flex flex-col md:flex-row">
                {/* Left side - Image in a fixed ratio container with larger dimensions */}
                <div className="md:w-1/2 p-4">
                  <div className="aspect-[4/3] w-full relative rounded-lg overflow-hidden shadow-md">
                    {featuredSubscription.isLoading ? (
                      <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
                        <div className="w-12 h-12 border-4 border-gray-300 border-t-[#fe92b5] rounded-full animate-spin"></div>
                      </div>
                    ) : (
                      <Image 
                        src={featuredSubscription.imageUrl}
                        alt={featuredSubscription.subscription.title}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 100vw, 600px"
                        priority
                      />
                    )}
                  </div>
                  
                  {/* Price and billing details */}
                  <div className="mt-6 flex items-center justify-center">
                    <span className="text-[#e63946]">
                      {getFormattedPrice()}
                    </span>
                  </div>
                </div>
                
                {/* Right side - Features first, then CTA */}
                <div className="md:w-1/2 p-4 md:p-6">
                  {/* Features Section */}
                  <div className="mb-8">
                    <h3 className="text-xl font-semibold text-black mb-4">
                      Treatment Features:
                    </h3>
                    
                    {/* Features with smaller, more compact design */}
                    <div className="space-y-3">
                      {featuredSubscription.subscription.features && 
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
                            <p className="text-black">{feature.featureText}</p>
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
                              <p className="text-black">Clinically proven hair regrowth with FDA-approved treatments</p>
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
                              <p className="text-black">Expert dermatologist consultation and personalized treatment plan</p>
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
                              <p className="text-black">Convenient home delivery with progress tracking</p>
                            </div>
                          </motion.div>
                        </>
                      )}
                    </div>
                  </div>
                  
                  {/* CTA Section - MOVED BELOW FEATURES */}
                  <div>
                    {/* View Details Link */}
                    {featuredSubscription.subscription.slug && featuredSubscription.subscription.slug.current && (
                      <div className="mb-4">
                        <Link 
                          href={`/subscriptions/${featuredSubscription.subscription.slug.current}`}
                          className="block w-full text-center border border-[#e63946] text-[#e63946] font-medium py-3 px-4 rounded-full hover:bg-[#fff5f7] transition-colors"
                        >
                          View Plan Details
                        </Link>
                      </div>
                    )}

                    {/* Purchase Button - Changed from Subscribe to Purchase */}
                    <button
                      onClick={handlePurchase}
                      disabled={isProcessing || isLoading}
                      className={`w-full py-4 px-6 rounded-full text-white font-semibold text-lg transition-colors ${
                        isProcessing || isLoading 
                          ? 'bg-gray-400 cursor-not-allowed' 
                          : 'bg-black hover:bg-gray-900 shadow-md hover:shadow-lg'
                      }`}
                    >
                      {getPurchaseButtonText()}
                    </button>
                    
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
          ) : (
            // No Featured Product Available Section
            <motion.div 
              className="bg-white rounded-xl shadow-xl overflow-hidden mb-16"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: showContent ? 1 : 0, y: showContent ? 0 : 20 }}
              transition={{ duration: 0.7 }}
            >
              <div className="bg-gradient-to-r from-[#e63946] to-[#ff4d6d] p-6 text-white">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
                  <h2 className="text-2xl font-bold">Hair Loss Treatment Subscription</h2>
                  <span className="px-3 py-1 bg-white text-[#e63946] text-sm font-semibold rounded-full inline-block w-max">
                    Coming Soon
                  </span>
                </div>
                <p className="opacity-80 mt-1">Personalized hair restoration program</p>
              </div>
              
              <div className="p-8 text-center">
                <div className="mb-6">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-20 w-20 text-gray-400 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                  <h3 className="text-2xl font-bold text-black mb-4">Hair Loss Plans Coming Soon</h3>
                  <p className="text-lg text-gray-700 mb-8 max-w-2xl mx-auto">
                    Thank you for completing our comprehensive hair loss assessment. Your responses are valuable and help us develop 
                    personalized treatment solutions. We're currently working on bringing you targeted hair loss subscription plans 
                    that will address your specific needs and concerns.
                  </p>
                </div>
                
                {/* Features List */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 max-w-4xl mx-auto">
                  <motion.div 
                    className="flex items-start gap-3 text-left"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: showFeatures ? 1 : 0, x: showFeatures ? 0 : -10 }}
                    transition={{ duration: 0.4, delay: 0 }}
                  >
                    <div className="w-6 h-6 rounded-full bg-[#ffe6f0] flex items-center justify-center flex-shrink-0 mt-0.5">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-[#e63946]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-black font-medium">Personalized Hair Loss Treatment</p>
                      <p className="text-gray-600 text-sm">Tailored solutions based on your assessment</p>
                    </div>
                  </motion.div>
                  
                  <motion.div 
                    className="flex items-start gap-3 text-left"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: showFeatures ? 1 : 0, x: showFeatures ? 0 : -10 }}
                    transition={{ duration: 0.4, delay: 0.1 }}
                  >
                    <div className="w-6 h-6 rounded-full bg-[#ffe6f0] flex items-center justify-center flex-shrink-0 mt-0.5">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-[#e63946]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-black font-medium">Expert Dermatologist Support</p>
                      <p className="text-gray-600 text-sm">Professional guidance and monitoring</p>
                    </div>
                  </motion.div>
                  
                  <motion.div 
                    className="flex items-start gap-3 text-left"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: showFeatures ? 1 : 0, x: showFeatures ? 0 : -10 }}
                    transition={{ duration: 0.4, delay: 0.2 }}
                  >
                    <div className="w-6 h-6 rounded-full bg-[#ffe6f0] flex items-center justify-center flex-shrink-0 mt-0.5">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-[#e63946]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-black font-medium">Convenient Home Delivery</p>
                      <p className="text-gray-600 text-sm">Treatments delivered to your door</p>
                    </div>
                  </motion.div>
                  
                  <motion.div 
                    className="flex items-start gap-3 text-left"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: showFeatures ? 1 : 0, x: showFeatures ? 0 : -10 }}
                    transition={{ duration: 0.4, delay: 0.3 }}
                  >
                    <div className="w-6 h-6 rounded-full bg-[#ffe6f0] flex items-center justify-center flex-shrink-0 mt-0.5">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-[#e63946]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-black font-medium">Progress Tracking & Support</p>
                      <p className="text-gray-600 text-sm">Monitor your hair growth journey</p>
                    </div>
                  </motion.div>
                </div>
                
                {/* CTA Button */}
                <Link href="/subscriptions">
                  <motion.button 
                    className="w-full max-w-md mx-auto bg-black text-white font-semibold py-4 px-8 rounded-full text-lg hover:bg-gray-900 transition-colors shadow-md hover:shadow-lg"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Browse All Subscriptions
                  </motion.button>
                </Link>
                
                <p className="text-center text-gray-500 text-sm mt-4">
                  Be the first to know when our hair loss plans launch
                </p>
              </div>
            </motion.div>
          )}
          
          {/* Hair Loss Subscription Grid */}
          <motion.div 
            className="mt-16 mb-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: showFeatures ? 1 : 0, y: showFeatures ? 0 : 20 }}
            transition={{ duration: 0.7, delay: 0.7 }}
          >
            <h2 className="text-2xl font-bold text-center text-black mb-8">
              Our Hair Loss Subscription Plans
            </h2>
            
            {/* Import and use the HairLossSubscriptionGrid component */}
            <div className="bg-[#f9f9f9] rounded-xl p-8">
              <HairLossSubscriptionGrid />
            </div>
          </motion.div>
          
          {/* Minimal Footer - No Button or CTA Text */}
          <div className="bg-gray-50 py-8 text-center mt-16">
            <div className="container mx-auto px-4">
              <p className="text-xs text-gray-400 mb-2">
                Results may vary. These statements have not been evaluated by the FDA.
              </p>
              <p className="text-xs text-gray-400">
                © {new Date().getFullYear()} Lilys. All rights reserved.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}