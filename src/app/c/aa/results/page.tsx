// src/app/c/aa/results/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { urlFor } from '@/sanity/lib/image';
import { client } from '@/sanity/lib/client';
import HomeHeader from "@/components/HomeHeader";
import GlobalFooter from "@/components/GlobalFooter";
import { skinQuestions } from "../skin/data/questions";
import { 
  QuestionType, 
  SingleSelectQuestion, 
  MultiSelectQuestion 
} from "../skin/types";

interface Product {
  _id: string;
  title: string;
  slug: { current: string };
  price: number;
  description: string;
  mainImage?: any;
  productType?: string;
  administrationType?: string;
  suitableForSkinTypes?: string[];
  targetConcerns?: string[];
  ingredients?: string[];
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
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [ineligibilityReason, setIneligibilityReason] = useState<string | null>(null);
  const [skinType, setSkinType] = useState<string | null>(null);
  const [userResponses, setUserResponses] = useState<Record<string, any>>({});
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!isClient) return;

    // Check if we have a stored ineligibility reason
    const storedIneligibilityReason = sessionStorage.getItem("skinIneligibilityReason");
    if (storedIneligibilityReason) {
      setIneligibilityReason(storedIneligibilityReason);
    }
    
    // Get stored responses for displaying insights
    const storedResponses = sessionStorage.getItem("finalSkinResponses");
    if (storedResponses) {
      try {
        const parsedResponses = JSON.parse(storedResponses);
        setUserResponses(parsedResponses);
        
        // Set skin type if available
        if (parsedResponses['skin-type']) {
          setSkinType(parsedResponses['skin-type']);
        }
      } catch (error) {
        console.error("Error parsing stored responses:", error);
      }
    }
    
    // Check if we already have a recommendation in localStorage
    const savedRecommendation = localStorage.getItem('skinRecommendation');
    
    const fetchData = async () => {
      try {
        // Fetch all skin products regardless of recommendation
        const products: Product[] = await client.fetch(`
          *[_type == "product" && references(*[_type=="productCategory" && slug.current=="skin-care"]._id)] {
            _id, title, slug, price, description, mainImage, productType, administrationType,
            "suitableForSkinTypes": skinTypes[],
            "targetConcerns": concerns[],
            "ingredients": ingredients[]
          }
        `);
        
        setAllProducts(products || []);
        
        // If the user is ineligible, create a custom recommendation object
        if (storedIneligibilityReason) {
          const ineligibleRecommendation: Recommendation = {
            eligible: false,
            recommendedProductId: null,
            explanation: storedIneligibilityReason
          };
          
          setRecommendation(ineligibleRecommendation);
          setIsLoading(false);
          return;
        }
        
        // If we have a saved recommendation, use it
        if (savedRecommendation) {
          setRecommendation(JSON.parse(savedRecommendation));
          setIsLoading(false);
          return;
        }
        
        // Otherwise, get form responses and call the API
        const storedResponses = sessionStorage.getItem("finalSkinResponses");
        
        if (!storedResponses) {
          router.push("/c/aa");
          return;
        }
        
        const responses = JSON.parse(storedResponses);
        
        // Call the API to get recommendations
        const response = await fetch('/api/aa-recommendations', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ formResponses: responses }),
        });
        
        if (!response.ok) {
          throw new Error('Failed to get recommendation');
        }
        
        const data = await response.json();
        
        // Parse recommendation data
        let parsedRecommendation: Recommendation;
        
        // Check if the response is a string (explanation) or an object
        if (typeof data === 'string' || (data && !data.hasOwnProperty('eligible'))) {
          // If it's just text, create a structured object
          const explanation = typeof data === 'string' ? data : data.explanation || "Based on your responses, we cannot recommend our skin care products at this time.";
          
          parsedRecommendation = {
            eligible: false,
            recommendedProductId: null,
            explanation: explanation
          };
        } else {
          // Otherwise use the structured response
          parsedRecommendation = data as Recommendation;
          
          // If the recommendation has a product ID but not the product data,
          // find it in the products we fetched
          if (parsedRecommendation.eligible && 
              parsedRecommendation.recommendedProductId && 
              !parsedRecommendation.product) {
            const recommendedProduct = products.find((p: Product) => p._id === parsedRecommendation.recommendedProductId);
            if (recommendedProduct) {
              parsedRecommendation.product = recommendedProduct;
            }
          }
        }
        
        // Save the recommendation to localStorage for persistence
        localStorage.setItem('skinRecommendation', JSON.stringify(parsedRecommendation));
        
        setRecommendation(parsedRecommendation);
      } catch (error) {
        console.error("Error:", error);
        setError("We couldn't generate your recommendation. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, [router, isClient]);

  // Function to clear recommendation and start over
  const startOver = () => {
    localStorage.removeItem('skinRecommendation');
    sessionStorage.removeItem('finalSkinResponses');
    sessionStorage.removeItem('skinResponses');
    sessionStorage.removeItem('skinIneligibilityReason');
    router.push("/c/aa");
  };
  
  // Helper function to get readable label for user response
  const getResponseLabel = (questionId: string, value: any): string => {
    const question = skinQuestions.find(q => q.id === questionId);
    if (!question) return String(value);
    
    if (question.type === QuestionType.TextInput) {
      return String(value);
    }
    
    const questionWithOptions = question as SingleSelectQuestion | MultiSelectQuestion;
    
    if (Array.isArray(value)) {
      if (value.length === 0) return "None";
      return value.map(v => {
        const option = questionWithOptions.options.find(opt => opt.id === v);
        return option ? option.label : v;
      }).join(", ");
    } else {
      const option = questionWithOptions.options.find(opt => opt.id === value);
      return option ? option.label : String(value);
    }
  };
  
  // Get key insights from user responses for display
  const getUserInsights = () => {
    const insights: { icon: string; title: string; description: string }[] = [];
    
    // Skin type
    if (userResponses['skin-type']) {
      const skinTypeLabel = getResponseLabel('skin-type', userResponses['skin-type']);
      insights.push({
        icon: "✨",
        title: "Skin Type",
        description: `You have ${skinTypeLabel.toLowerCase()} skin.`
      });
    }
    
    // Top concern
    if (userResponses['skin-concerns'] && Array.isArray(userResponses['skin-concerns']) && userResponses['skin-concerns'].length > 0) {
      const topConcern = userResponses['skin-concerns'][0];
      const topConcernLabel = getResponseLabel('skin-concerns', [topConcern]);
      insights.push({
        icon: "🔍",
        title: "Primary Concern",
        description: `You're mainly concerned about ${topConcernLabel.toLowerCase()}.`
      });
    }
    
    // Routine consistency
    if (userResponses['skincare-frequency']) {
      const routineLabel = getResponseLabel('skincare-frequency', userResponses['skincare-frequency']);
      insights.push({
        icon: "🔄",
        title: "Routine Consistency",
        description: `You use skincare products ${routineLabel.toLowerCase()}.`
      });
    }
    
    // Sunscreen usage
    if (userResponses['sunscreen-usage']) {
      const sunscreenLabel = getResponseLabel('sunscreen-usage', userResponses['sunscreen-usage']);
      insights.push({
        icon: "☀️",
        title: "Sun Protection",
        description: `You use sunscreen ${sunscreenLabel.toLowerCase()}.`
      });
    }
    
    // Lifestyle factors
    const lifestyleFactors = [];
    if (userResponses['stress-levels'] === 'high') {
      lifestyleFactors.push("high stress");
    }
    if (userResponses['water-intake'] === 'less-than-1') {
      lifestyleFactors.push("low water intake");
    }
    if (userResponses['smoking-alcohol'] === 'both' || userResponses['smoking-alcohol'] === 'smoking-only') {
      lifestyleFactors.push("smoking");
    }
    
    if (lifestyleFactors.length > 0) {
      insights.push({
        icon: "💫",
        title: "Lifestyle Factors",
        description: `Your skin may be affected by ${lifestyleFactors.join(", ")}.`
      });
    }
    
    return insights;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <HomeHeader />
        <div className="flex-grow flex flex-col items-center justify-center">
          <div className="w-16 h-16 border-4 border-gray-300 border-t-[#fe92b5] rounded-full animate-spin"></div>
          <p className="mt-6 text-xl">Analyzing your responses...</p>
          <p className="mt-2 text-gray-500">We're preparing your personalized recommendation</p>
        </div>
        <GlobalFooter />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col">
        <HomeHeader />
        <div className="flex-grow flex flex-col items-center justify-center px-6">
          <div className="w-full max-w-2xl text-center">
            <h2 className="text-3xl font-semibold text-[#fe92b5] mb-6">Oops! Something went wrong</h2>
            <p className="text-xl mb-8">{error}</p>
            <button 
              onClick={() => router.push("/c/aa/submit")}
              className="bg-black text-white text-lg font-medium px-6 py-3 rounded-full hover:bg-gray-900"
            >
              Try Again
            </button>
          </div>
        </div>
        <GlobalFooter />
      </div>
    );
  }

  const insights = getUserInsights();

  return (
    <div className="min-h-screen flex flex-col">
      <HomeHeader />
      
      <main className="flex-grow container mx-auto px-4 py-8">
        <h1 className="text-4xl font-semibold text-[#fe92b5] text-center mb-6">Your Skincare Results</h1>
        <p className="text-center text-gray-600 max-w-2xl mx-auto mb-10">
          Based on your "Get Glowing Skin" assessment, we've analyzed your skin type, concerns, and lifestyle factors to create personalized recommendations.
        </p>
        
        {/* Skin Profile Insights */}
        {insights.length > 0 && (
          <section className="mb-12">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">Your Skin Profile</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {insights.map((insight, idx) => (
                <div key={idx} className="bg-white rounded-lg shadow p-4 flex">
                  <div className="w-12 h-12 rounded-full bg-[#fe92b5]/10 flex items-center justify-center text-2xl mr-4">
                    {insight.icon}
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-800">{insight.title}</h3>
                    <p className="text-gray-600 text-sm">{insight.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
        
        {/* Recommendation Section */}
        <section className="mb-16">
          {/* Eligible with Product Recommendation */}
          {recommendation?.eligible && recommendation.product && (
            <div className="bg-white rounded-xl shadow-lg overflow-hidden max-w-4xl mx-auto">
              <div className="bg-gradient-to-r from-[#fe92b5]/10 to-[#fe92b5]/5 p-6 flex items-center">
                <div className="w-16 h-16 bg-[#fe92b5] rounded-full flex items-center justify-center mr-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-2xl font-semibold text-gray-800">Your Perfect Match!</h2>
                  <p className="text-gray-600">Our top recommendation based on your skin assessment:</p>
                </div>
              </div>
              
              <div className="p-6">
                <div className="flex flex-col md:flex-row gap-8">
                  {/* Product Image */}
                  <div className="md:w-1/3">
                    {recommendation.product.mainImage ? (
                      <div className="relative h-64 w-full rounded-lg overflow-hidden">
                        <Image 
                          src={urlFor(recommendation.product.mainImage).url()} 
                          alt={recommendation.product.title} 
                          fill 
                          style={{objectFit: 'cover'}} 
                          className="transition-transform hover:scale-105"
                        />
                      </div>
                    ) : (
                      <div className="h-64 w-full bg-gray-200 rounded-lg flex items-center justify-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-20 w-20 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                    )}
                    
                    <div className="mt-3 space-y-2">
                      {recommendation.product.productType && (
                        <div className="inline-block px-3 py-1 bg-gray-100 text-gray-600 text-sm rounded-full">
                          {recommendation.product.productType === 'OTC' ? 'Over-the-counter' : 'Prescription required'}
                        </div>
                      )}
                      
                      {recommendation.product.administrationType && (
                        <div className="inline-block px-3 py-1 bg-gray-100 text-gray-600 text-sm rounded-full ml-2">
                          {recommendation.product.administrationType === 'oral' ? 'Oral medication' : 'Topical'}
                        </div>
                      )}
                      
                      {recommendation.product.suitableForSkinTypes && recommendation.product.suitableForSkinTypes.length > 0 && (
                        <div className="block">
                          <span className="text-sm text-gray-500">Ideal for: </span>
                          <span className="text-sm">
                            {recommendation.product.suitableForSkinTypes.join(', ')} skin
                          </span>
                        </div>
                      )}
                      
                      {recommendation.product.targetConcerns && recommendation.product.targetConcerns.length > 0 && (
                        <div className="block">
                          <span className="text-sm text-gray-500">Targets: </span>
                          <span className="text-sm">
                            {recommendation.product.targetConcerns.join(', ')}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* Product Details */}
                  <div className="md:w-2/3">
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">{recommendation.product.title}</h3>
                    <div className="flex items-center mb-4">
                      <span className="text-xl font-bold text-black">${recommendation.product.price}</span>
                      <span className="ml-2 px-2 py-1 bg-[#fe92b5] text-white text-xs rounded-full">Recommended</span>
                    </div>
                    <p className="text-gray-700 mb-6">{recommendation.product.description}</p>
                    
                    <div className="bg-gray-50 p-4 rounded-lg mb-6">
                      <h4 className="font-semibold mb-2">Why This Is Right For You:</h4>
                      <p>{recommendation.explanation}</p>
                    </div>
                    
                    {recommendation.product.ingredients && recommendation.product.ingredients.length > 0 && (
                      <div className="mb-6">
                        <h4 className="font-semibold mb-2">Key Ingredients:</h4>
                        <div className="flex flex-wrap gap-2">
                          {recommendation.product.ingredients.map((ingredient, idx) => (
                            <span key={idx} className="px-3 py-1 bg-blue-50 text-blue-700 text-xs rounded-full">
                              {ingredient}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    <div className="flex flex-col sm:flex-row gap-3">
                      <Link href={`/products/${recommendation.product.slug?.current}`} className="flex-1">
                        <button className="bg-black text-white text-lg font-medium px-6 py-3 rounded-full w-full hover:bg-gray-900">
                          Learn More
                        </button>
                      </Link>
                      <button 
                        onClick={startOver}
                        className="flex-1 border-2 border-black text-black text-lg font-medium px-6 py-3 rounded-full hover:bg-gray-100"
                      >
                        Retake Assessment
                      </button>
                    </div>
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
                  <p className="text-lg leading-relaxed">{recommendation?.explanation || "Based on your responses, we recommend consulting with a healthcare provider before pursuing skin treatments. Your health is our priority."}</p>
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
                    className="bg-[#fe92b5] text-white text-lg font-medium px-6 py-3 rounded-full text-center hover:bg-[#fe92b5]/90 flex-1"
                  >
                    Book a Consultation
                  </Link>
                </div>
              </div>
            </div>
          )}
        </section>
        
        {/* Care Tips Based on User Responses */}
        <section className="mb-16">
          <h2 className="text-3xl font-semibold text-gray-800 mb-6">Personalized Skincare Tips</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Tip 1: Based on skin type */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold mb-2">For Your {getResponseLabel('skin-type', userResponses['skin-type'] || 'Skin')} Skin</h3>
              <p className="text-gray-600">
                {userResponses['skin-type'] === 'oily' && 
                  "Use a gentle foaming cleanser twice daily. Look for non-comedogenic and oil-free products to prevent clogged pores."}
                {userResponses['skin-type'] === 'dry' && 
                  "Use a creamy, hydrating cleanser and apply moisturizer while your skin is still damp to lock in hydration."}
                {userResponses['skin-type'] === 'combination' && 
                  "Consider using different products on different areas of your face. Gentle foaming cleansers for oily areas and hydrating products for dry areas."}
                {userResponses['skin-type'] === 'sensitive' && 
                  "Patch test new products and use fragrance-free, gentle formulations with minimal ingredients to reduce the risk of irritation."}
                {userResponses['skin-type'] === 'normal' && 
                  "Maintain your balanced skin with a consistent routine of cleansing, moisturizing, and sun protection."}
                {!userResponses['skin-type'] && 
                  "Establish a consistent skincare routine with gentle cleansing, moisturizing, and sun protection."}
              </p>
            </div>
            
            {/* Tip 2: Based on lifestyle */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold mb-2">Lifestyle Adjustments</h3>
              <p className="text-gray-600">
                {userResponses['water-intake'] === 'less-than-1' && 
                  "Try increasing your water intake to at least 2 liters daily to improve skin hydration from within. "}
                {userResponses['stress-levels'] === 'high' && 
                  "High stress can trigger skin issues. Consider incorporating stress-reduction techniques like meditation or yoga. "}
                {(userResponses['smoking-alcohol'] === 'both' || 
                  userResponses['smoking-alcohol'] === 'smoking-only' || 
                  userResponses['smoking-alcohol'] === 'alcohol-only') && 
                  "Reducing smoking and alcohol can significantly improve your skin's appearance and health. "}
                {userResponses['diet'] === 'processed' && 
                  "Consider adding more fruits, vegetables, and omega-3 rich foods to your diet for better skin health."}
                {!(userResponses['water-intake'] === 'less-than-1' || 
                   userResponses['stress-levels'] === 'high' || 
                   userResponses['smoking-alcohol'] === 'both' || 
                   userResponses['smoking-alcohol'] === 'smoking-only' || 
                   userResponses['smoking-alcohol'] === 'alcohol-only' ||
                   userResponses['diet'] === 'processed') && 
                  "Maintain your healthy lifestyle choices which benefit your skin. Stay hydrated and manage stress for optimal skin health."}
              </p>
            </div>
            
            {/* Tip 3: Sun protection */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="w-12 h-12 rounded-full bg-yellow-100 flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold mb-2">Sun Protection</h3>
              <p className="text-gray-600">
                {userResponses['sunscreen-usage'] === 'rarely' && 
                  "Daily sunscreen is crucial even on cloudy days! UV damage is the #1 cause of premature skin aging. Apply SPF 30+ every morning."}
                {userResponses['sunscreen-usage'] === 'sometimes' && 
                  "Great that you use sunscreen sometimes, but daily application is best! Make it a habit every morning, even on cloudy days."}
                {userResponses['sunscreen-usage'] === 'daily' && 
                  "Excellent job using sunscreen daily! Remember to reapply every 2 hours when outdoors for extended periods."}
                {userResponses['sun-exposure'] === 'yes' && 
                  " Since you spend significant time outdoors, consider wearing protective clothing and seeking shade when possible, especially between 10am-4pm."}
                {!userResponses['sunscreen-usage'] && 
                  "Regardless of your skin type, daily sun protection with SPF 30+ is essential for preventing premature aging and reducing skin cancer risk."}
              </p>
            </div>
          </div>
        </section>
        
        {/* Browse Other Products Section */}
        <section>
          <h2 className="text-3xl font-semibold text-gray-800 mb-6">Explore Our Skincare Collection</h2>
          <p className="text-gray-600 max-w-3xl mb-8">Browse our selection of physician-formulated skin care treatments designed to help you achieve healthy, radiant skin.</p>
          
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
                    
                    {recommendation?.product && recommendation.product._id === product._id && (
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
                          <span className="text-xs text-gray-500">{product.administrationType === 'oral' ? 'Oral' : 'Topical'}</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
          
          <div className="text-center mt-10">
            <Link 
              href="/products" 
              className="inline-block bg-black text-white font-medium px-6 py-3 rounded-full hover:bg-gray-900"
            >
              View All Products
            </Link>
          </div>
        </section>
      </main>
      
      <GlobalFooter />
    </div>
  );
}