// src/app/c/hl/results/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";

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

interface Recommendation {
  eligible: boolean;
  recommendedProductId: string | null;
  explanation: string;
  product?: Product;
}

export default function ResultsPage() {
  const router = useRouter();
  const [recommendation, setRecommendation] = useState<Recommendation | null>(null);
  const [allProducts, setAllProducts] = useState<Product[]>([
    // Mock data for demo purposes
    {
      _id: "product1",
      title: "Minoxidil 5% Solution",
      slug: { current: "minoxidil-5-solution" },
      price: 29.99,
      description: "Clinically proven topical solution to help regrow hair and prevent further hair loss.",
      productType: "OTC"
    },
    {
      _id: "product2",
      title: "Finasteride Tablets",
      slug: { current: "finasteride-tablets" },
      price: 49.99,
      description: "Prescription medication that blocks DHT production to prevent hair loss at the root cause.",
      productType: "prescription"
    }
  ]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [ineligibilityReason, setIneligibilityReason] = useState<string | null>(null);

  useEffect(() => {
    // Check if we have a stored ineligibility reason
    const storedIneligibilityReason = sessionStorage.getItem("ineligibilityReason");
    if (storedIneligibilityReason) {
      setIneligibilityReason(storedIneligibilityReason);
    }
    
    // Simulate API call for recommendation
    const simulateRecommendation = () => {
      setTimeout(() => {
        // Create a mock recommendation based on stored responses
        const mockRecommendation: Recommendation = {
          eligible: true,
          recommendedProductId: "product1",
          explanation: "Based on your pattern of hair loss and its duration, we recommend a topical solution to promote hair regrowth in the affected areas.",
          product: allProducts[0]
        };
        
        setRecommendation(mockRecommendation);
        setIsLoading(false);
      }, 1500);
    };
    
    simulateRecommendation();
  }, [allProducts]);

  // Function to clear recommendation and start over
  const startOver = () => {
    localStorage.removeItem('hairLossRecommendation');
    sessionStorage.removeItem('finalHairLossResponses');
    sessionStorage.removeItem('hairLossResponses');
    sessionStorage.removeItem('ineligibilityReason');
    router.push("/c/hl");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <div className="flex-grow flex flex-col items-center justify-center">
          <div className="w-16 h-16 border-4 border-gray-300 border-t-[#6366f1] rounded-full animate-spin"></div>
          <p className="mt-6 text-xl">Analyzing your responses...</p>
          <p className="mt-2 text-gray-500">We're preparing your personalized recommendation</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col">
        <div className="flex-grow flex flex-col items-center justify-center px-6">
          <div className="w-full max-w-2xl text-center">
            <h2 className="text-3xl font-semibold text-[#6366f1] mb-6">Oops! Something went wrong</h2>
            <p className="text-xl mb-8">{error}</p>
            <button 
              onClick={() => router.push("/c/hl/submit")}
              className="bg-black text-white text-lg font-medium px-6 py-3 rounded-full hover:bg-gray-900"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-grow container mx-auto px-4 py-8">
        <h1 className="text-4xl font-semibold text-[#6366f1] text-center mb-10">Your Personalized Recommendation</h1>
        
        {/* Recommendation Section */}
        <section className="mb-16">
          {/* Eligible with Product Recommendation */}
          {recommendation?.eligible && recommendation.product && (
            <div className="bg-white rounded-xl shadow-lg overflow-hidden max-w-4xl mx-auto">
              <div className="bg-gradient-to-r from-[#6366f1]/10 to-[#6366f1]/5 p-6 flex items-center">
                <div className="w-16 h-16 bg-[#6366f1] rounded-full flex items-center justify-center mr-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-2xl font-semibold text-gray-800">We found your perfect match!</h2>
                  <p className="text-gray-600">Based on your assessment, we recommend:</p>
                </div>
              </div>
              
              <div className="p-6">
                <div className="flex flex-col md:flex-row gap-8">
                  {/* Product Image (placeholder) */}
                  <div className="md:w-1/3">
                    <div className="h-64 w-full bg-gray-200 rounded-lg flex items-center justify-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-20 w-20 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                    
                    {recommendation.product.productType && (
                      <div className="mt-2 inline-block px-3 py-1 bg-gray-100 text-gray-600 text-sm rounded-full">
                        {recommendation.product.productType === 'OTC' ? 'Over-the-counter' : 'Prescription required'}
                      </div>
                    )}
                  </div>
                  
                  {/* Product Details */}
                  <div className="md:w-2/3">
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">{recommendation.product.title}</h3>
                    <div className="flex items-center mb-4">
                      <span className="text-xl font-bold text-black">${recommendation.product.price}</span>
                      <span className="ml-2 px-2 py-1 bg-[#6366f1] text-white text-xs rounded-full">Recommended</span>
                    </div>
                    <p className="text-gray-700 mb-6">{recommendation.product.description}</p>
                    
                    <div className="bg-gray-50 p-4 rounded-lg mb-6">
                      <h4 className="font-semibold mb-2">Why This Is Right For You:</h4>
                      <p>{recommendation.explanation}</p>
                    </div>
                    
                    <Link href={`/products/${recommendation.product.slug?.current}`} className="block w-full">
                      <button className="bg-black text-white text-lg font-medium px-6 py-3 rounded-full w-full hover:bg-gray-900">
                        Learn More About This Product
                      </button>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {/* Not Eligible */}
          {(!recommendation?.eligible || !recommendation?.product) && (
            <div className="bg-white rounded-xl shadow-lg overflow-hidden max-w-4xl mx-auto">
              <div className="bg-gradient-to-r from-amber-100 to-amber-50 p-6 flex items-center">
                <div className="w-16 h-16 bg-amber-400 rounded-full flex items-center justify-center mr-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-2xl font-semibold text-gray-800">Medical Guidance Recommended</h2>
                  <p className="text-gray-600">We care about your health and safety.</p>
                </div>
              </div>
              
              <div className="p-6">
                <div className="bg-gray-50 p-6 rounded-lg mb-8">
                  <p className="text-lg leading-relaxed">{recommendation?.explanation || "Based on your responses, we recommend consulting with a healthcare provider before pursuing hair loss medication. Your health is our priority."}</p>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-4">
                  <button 
                    onClick={startOver}
                    className="bg-black text-white text-lg font-medium px-6 py-3 rounded-full hover:bg-gray-900 flex-1"
                  >
                    Retake Assessment
                  </button>
                  <Link 
                    href="/consultation" 
                    className="bg-[#6366f1] text-white text-lg font-medium px-6 py-3 rounded-full text-center hover:bg-[#6366f1]/90 flex-1"
                  >
                    Book a Consultation
                  </Link>
                </div>
              </div>
                          );
                          
          };
       
                          
                  

      