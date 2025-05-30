// src/app/c/b/results/page.tsx
"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { groq } from 'next-sanity';
import { client } from '@/sanity/lib/client';
import { urlFor } from '@/sanity/lib/image';
import { useAuthStore } from '@/store/authStore';
import { useSubscriptionPurchase } from '@/hooks/useSubscriptionPurchase';

// Static product interface for the hardcoded recommendation
interface StaticProduct {
  _id: string;
  title: string;
  slug: { current: string };
  price: number;
  description: string;
  mainImage: string;
  productType: string;
  administrationType: string;
}

// Interface for birth control products from Sanity
interface Product {
  _id: string;
  title: string;
  slug: { current: string };
  price: number;
  description: string;
  mainImage?: any;
  productType?: string;
  administrationType?: string;
}

// Static recommendation interface
interface StaticRecommendation {
  eligible: boolean;
  recommendedProductId: string | null;
  explanation: string;
  product: StaticProduct;
}

export default function ResultsPage() {
  // Animation states
  const [showContent, setShowContent] = useState<boolean>(false);
  const [showFeatures, setShowFeatures] = useState<boolean>(false);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const { purchaseSubscription, isLoading, error } = useSubscriptionPurchase();
  const { user, isAuthenticated, checkSession } = useAuthStore();
  
  // State for products from Sanity
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState<boolean>(true);
  const [productError, setProductError] = useState<string | null>(null);

  // Static hardcoded recommendation (replaces API call)
  const staticRecommendation: StaticRecommendation = {
    eligible: true,
    recommendedProductId: "static-bc-product-1",
    explanation: "Based on your assessment, we recommend a comprehensive birth control solution that aligns with your preferences and lifestyle. This option provides reliable contraception with the convenience and support you're looking for.",
    product: {
      _id: "static-bc-product-1",
      title: "Birth Control Plan",
      slug: { current: "birth-control-plan" },
      price: 89,
      description: "A comprehensive birth control solution designed to meet your reproductive health needs with convenience and reliability.",
      mainImage: "/images/birth-control-product.jpg", // Default fallback image
      productType: "Prescription",
      administrationType: "Oral"
    }
  };

  // Check auth state when component mounts
  useEffect(() => {
    if (!isAuthenticated) {
      checkSession();
    }
  }, [isAuthenticated, checkSession]);

  // Fetch birth control products from Sanity
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setIsLoadingProducts(true);
        
        // Fetch birth control products from Sanity
        const products: Product[] = await client.fetch(`
          *[_type == "product" && references(*[_type=="productCategory" && slug.current=="sexual-health-and-birth-control"]._id)] {
            _id, title, slug, price, description, mainImage, productType, administrationType
          }
        `);
        
        setAllProducts(products || []);
      } catch (err) {
        console.error("Error fetching products:", err);
        setProductError("Unable to load additional products");
      } finally {
        setIsLoadingProducts(false);
      }
    };
    
    fetchProducts();
  }, []);

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

  // Handle subscription purchase button click
  const handlePurchase = async (): Promise<void> => {
    if (isProcessing || isLoading) return;
    
    // Store current path in sessionStorage
    const currentPath = window.location.pathname;
    sessionStorage.setItem('subscriptionReturnPath', currentPath);
    
    // If not authenticated, redirect to login with return URL
    if (!isAuthenticated) {
      // Save intended product ID to purchase after login
      sessionStorage.setItem('pendingProductId', staticRecommendation.product._id);
      const returnUrl = encodeURIComponent(currentPath);
      window.location.href = `/login?returnUrl=${returnUrl}`;
      return;
    }
    
    setIsProcessing(true);
    
    try {
      // For now, just redirect to a general product page or subscription page
      // Since this is a static recommendation, we'll redirect to the subscription page
      window.location.href = '/subscriptions';
    } catch (err) {
      console.error('Failed to initiate purchase:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  // Get purchase button text based on state
  const getPurchaseButtonText = (): string => {
    if (isProcessing || isLoading) {
      return 'Processing...';
    }
    
    if (isAuthenticated) {
      return 'Explore Options';
    }
    
    return 'Sign In to Continue';
  };

  // Function to clear stored responses and start over
  const startOver = () => {
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem('finalBCResponses');
      sessionStorage.removeItem('birthControlResponses');
      sessionStorage.removeItem('ineligibilityReason');
      
      // Clear any cookies
      try {
        document.cookie = "bc-form-storage=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
      } catch (error) {
        console.log("No cookies to clear");
      }
    }
    
    // Redirect to the start of the survey
    window.location.href = "/c/b";
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
            <div className="inline-flex items-center justify-center w-20 h-20 bg-white text-[#fe92b5] rounded-full mb-6 shadow-lg">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">Your Birth Control Recommendation</h1>
            <div className="h-1 w-24 bg-[#fe92b5] mx-auto mb-6"></div>
            <p className="text-xl text-gray-700">
              Based on your assessment, we've found the perfect birth control solution for you.
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
          {/* Note from Lilys Section */}
          <motion.div
            className="bg-white rounded-xl shadow-lg p-6 mb-10 border-l-4 border-[#fe92b5]"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: showContent ? 1 : 0, y: showContent ? 0 : 20 }}
            transition={{ duration: 0.7 }}
          >
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 rounded-full bg-[#ffe6f0] flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-[#fe92b5]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-black mb-2">Why We Chose This For You</h3>
                <p className="text-black">
                  At Lilys, we believe that personalized care leads to better outcomes. This recommendation takes into account 
                  your health profile, reproductive goals, and personal preferences to provide you with the most suitable birth control solution.
                </p>
              </div>
            </div>
          </motion.div>

          {/* Recommended Product Section */}
          <motion.div 
            className="bg-white rounded-xl shadow-xl overflow-hidden mb-16"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: showContent ? 1 : 0, y: showContent ? 0 : 20 }}
            transition={{ duration: 0.7 }}
          >
            <div className="bg-gradient-to-r from-[#fe92b5] to-[#ff92b5] p-6 text-white">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
                <h2 className="text-2xl font-bold">{staticRecommendation.product.title}</h2>
                <span className="px-3 py-1 bg-white text-[#fe92b5] text-sm font-semibold rounded-full inline-block w-max">
                  Recommended
                </span>
              </div>
              <p className="opacity-80 mt-1">Personalized birth control solution</p>
            </div>
            
            <div className="flex flex-col md:flex-row">
              {/* Left side - Image */}
              <div className="md:w-1/2 p-4">
                <div className="aspect-[4/3] w-full relative rounded-lg overflow-hidden shadow-md">
                  <Image 
                    src={staticRecommendation.product.mainImage}
                    alt={staticRecommendation.product.title}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 600px"
                    priority
                  />
                </div>
                
                {/* Price and details */}
                <div className="mt-6 flex items-center justify-center">
                  <span className="text-[#fe92b5] text-2xl font-bold">
                    ${staticRecommendation.product.price}/month
                  </span>
                </div>
                
                {/* Product type badges */}
                <div className="mt-4 flex justify-center gap-2">
                  <span className="px-3 py-1 bg-gray-100 text-gray-600 text-sm rounded-full">
                    {staticRecommendation.product.productType}
                  </span>
                  <span className="px-3 py-1 bg-gray-100 text-gray-600 text-sm rounded-full">
                    {staticRecommendation.product.administrationType}
                  </span>
                </div>
              </div>
              
              {/* Right side - Features and CTA */}
              <div className="md:w-1/2 p-4 md:p-6">
                {/* Explanation */}
                <div className="mb-8">
                  <h3 className="text-xl font-semibold text-black mb-4">
                    Why This Is Right For You:
                  </h3>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-black">{staticRecommendation.explanation}</p>
                  </div>
                </div>
                
                {/* Features */}
                <div className="mb-8">
                  <h4 className="text-lg font-semibold text-black mb-4">What's Included:</h4>
                  
                  <div className="space-y-3">
                    <motion.div 
                      className="flex items-start gap-3"
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: showFeatures ? 1 : 0, x: showFeatures ? 0 : -10 }}
                      transition={{ duration: 0.4, delay: 0 }}
                    >
                      <div className="w-6 h-6 rounded-full bg-[#ffe6f0] flex items-center justify-center flex-shrink-0 mt-0.5">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-[#fe92b5]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <p className="text-black">Personalized birth control consultation</p>
                    </motion.div>
                    
                    <motion.div 
                      className="flex items-start gap-3"
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: showFeatures ? 1 : 0, x: showFeatures ? 0 : -10 }}
                      transition={{ duration: 0.4, delay: 0.1 }}
                    >
                      <div className="w-6 h-6 rounded-full bg-[#ffe6f0] flex items-center justify-center flex-shrink-0 mt-0.5">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-[#fe92b5]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <p className="text-black">Medical provider support and guidance</p>
                    </motion.div>
                    
                    <motion.div 
                      className="flex items-start gap-3"
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: showFeatures ? 1 : 0, x: showFeatures ? 0 : -10 }}
                      transition={{ duration: 0.4, delay: 0.2 }}
                    >
                      <div className="w-6 h-6 rounded-full bg-[#ffe6f0] flex items-center justify-center flex-shrink-0 mt-0.5">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-[#fe92b5]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <p className="text-black">Convenient home delivery service</p>
                    </motion.div>
                    
                    <motion.div 
                      className="flex items-start gap-3"
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: showFeatures ? 1 : 0, x: showFeatures ? 0 : -10 }}
                      transition={{ duration: 0.4, delay: 0.3 }}
                    >
                      <div className="w-6 h-6 rounded-full bg-[#ffe6f0] flex items-center justify-center flex-shrink-0 mt-0.5">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-[#fe92b5]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <p className="text-black">Ongoing health monitoring and support</p>
                    </motion.div>
                  </div>
                </div>
                
                {/* CTA Section */}
                <div className="space-y-4">
                  {/* Primary CTA Button */}
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
                  
                  {/* Retake Assessment Button */}
                  <button 
                    onClick={startOver}
                    className="w-full text-center border border-[#fe92b5] text-[#fe92b5] font-medium py-3 px-4 rounded-full hover:bg-[#fff5f7] transition-colors"
                  >
                    Retake Assessment
                  </button>
                  
                  {error && (
                    <p className="mt-2 text-xs text-red-600 text-center">
                      {error}
                    </p>
                  )}
                  
                  <p className="text-center text-gray-500 text-xs mt-2">
                    Personalized care • FDA-approved options
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
          
          {/* Browse Other Products Section */}
          <motion.div 
            className="mt-16 mb-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: showFeatures ? 1 : 0, y: showFeatures ? 0 : 20 }}
            transition={{ duration: 0.7, delay: 0.7 }}
          >
            <h2 className="text-2xl font-bold text-center text-black mb-8">
              Sexual Health & Birth Control Products
            </h2>
            <p className="text-gray-600 max-w-3xl mx-auto text-center mb-8">
              Browse our selection of sexual health and birth control options designed to match your lifestyle and preferences.
            </p>
            
            {isLoadingProducts ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 border-4 border-gray-300 border-t-[#fe92b5] rounded-full animate-spin mx-auto"></div>
                <p className="mt-4 text-gray-600">Loading products...</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {allProducts.slice(0, 8).map((product: Product) => (
                  <Link 
                    href={`/products/${product.slug?.current}`} 
                    key={product._id} 
                    className="group"
                  >
                    <div className="bg-white rounded-lg shadow-md overflow-hidden transition-transform hover:shadow-lg hover:-translate-y-1 h-full flex flex-col">
                      {/* Product Image */}
                      <div className="relative h-48 w-full bg-gray-100">
                        {product.mainImage ? (
                          <Image 
                            src={urlFor(product.mainImage).url()} 
                            alt={product.title} 
                            fill 
                            style={{objectFit: 'cover'}} 
                            className="transition-transform group-hover:scale-105"
                          />
                        ) : (
                          <div className="h-full w-full flex items-center justify-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                          </div>
                        )}
                        
                        {/* Recommended Badge for the static recommendation */}
                        {product._id === staticRecommendation.product._id && (
                          <div className="absolute top-2 right-2 bg-[#fe92b5] text-white text-xs py-1 px-2 rounded-full">
                            Recommended
                          </div>
                        )}
                      </div>
                      
                      {/* Product Details */}
                      <div className="p-4 flex-grow flex flex-col">
                        <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">{product.title}</h3>
                        <p className="text-gray-600 text-sm mb-4 line-clamp-3 flex-grow">{product.description}</p>
                        <div className="flex justify-between items-center">
                          <span className="font-bold text-gray-900">${product.price}</span>
                          <div className="flex flex-col items-end">
                            {product.productType && (
                              <span className="text-xs text-gray-500">{product.productType === 'OTC' ? 'Over-the-counter' : 'Prescription'}</span>
                            )}
                            {product.administrationType && (
                              <span className="text-xs text-gray-500">{product.administrationType}</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
            
            <div className="text-center mt-10">
              <Link 
                href="/products" 
                className="inline-block bg-black text-white font-medium px-6 py-3 rounded-full hover:bg-gray-900"
              >
                View All Products
              </Link>
            </div>
          </motion.div>
          
          {/* Minimal Footer */}
          <div className="bg-gray-50 py-8 text-center mt-16">
            <div className="container mx-auto px-4">
              <p className="text-xs text-gray-400 mb-2">
                Results may vary. Please consult with a healthcare provider for personalized medical advice.
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