// src/app/c/wm/results/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import HomeHeader from "@/components/HomeHeader";
import GlobalFooter from "@/components/GlobalFooter";
import { client } from '@/sanity/lib/client';
import SubscriptionCard from "@/app/(default)/subscriptions/components/SubscriptionCard";
import { Subscription, SubscriptionCategory } from "@/types/subscription-page";

// Static product data
const staticProduct = {
  _id: "static-product-id",
  title: "Compounded Semaglutide – Physician-Formulated Weight Loss Solution",
  slug: { current: "compounded-semaglutide" },
  price: 0,
  description: "Semaglutide is a GLP-1 receptor agonist that helps regulate appetite and blood sugar levels.",
  productType: "prescription",
  administrationType: "injectable"
};

export default function ResultsPage() {
  const router = useRouter();
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [categories, setCategories] = useState<SubscriptionCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch subscription data
  useEffect(() => {
    const fetchSubscriptions = async () => {
      try {
        setIsLoading(true);
        
        // Fetch subscriptions related to weight loss from Sanity CMS
        const fetchedSubscriptions: Subscription[] = await client.fetch(`
          *[_type == "subscription" && isActive == true && references(*[_type=="subscriptionCategory" && slug.current=="weight-management"]._id)] {
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
            isFeatured,
            "categories": categories[]->{ 
              _id, 
              title, 
              titleEs,
              slug, 
              description, 
              descriptionEs,
              displayOrder 
            }
          }
        `);
        
        // Fetch subscription categories
        const fetchedCategories: SubscriptionCategory[] = await client.fetch(`
          *[_type == "subscriptionCategory" && slug.current == "weight-management"] | order(displayOrder asc) {
            _id,
            title,
            titleEs,
            slug,
            description,
            descriptionEs,
            displayOrder
          }
        `);
        
        setSubscriptions(fetchedSubscriptions || []);
        setCategories(fetchedCategories || []);
      } catch (error) {
        console.error("Error fetching subscription data:", error);
        // Fallback to static data if the fetch fails
        setSubscriptions(getFallbackSubscriptions());
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchSubscriptions();
  }, []);

  // Fallback subscription data if fetch fails
  const getFallbackSubscriptions = (): Subscription[] => {
    return [
      {
        _id: "subscription-1",
        title: "Weight Management Basic",
        slug: { current: "weight-management-basic" },
        price: 29.99,
        billingPeriod: "monthly",
        description: [],
        features: [
          { featureText: "Weekly check-ins" },
          { featureText: "Basic nutritional guidance" },
          { featureText: "Access to recipes" }
        ],
        isFeatured: false,
        isActive: true
      },
      {
        _id: "subscription-2",
        title: "Weight Management Premium",
        slug: { current: "weight-management-premium" },
        price: 49.99,
        billingPeriod: "monthly",
        description: [],
        features: [
          { featureText: "Personalized meal planning" },
          { featureText: "1-on-1 consultations" },
          { featureText: "24/7 coach support" },
          { featureText: "Prescription medication options" }
        ],
        isFeatured: true,
        isActive: true
      },
      {
        _id: "subscription-3",
        title: "Weight Management Annual",
        slug: { current: "weight-management-annual" },
        price: 299.99,
        billingPeriod: "annually",
        description: [],
        features: [
          { featureText: "Everything in Premium" },
          { featureText: "2 months free" },
          { featureText: "Quarterly progress review" },
          { featureText: "Custom exercise plan" }
        ],
        isFeatured: false,
        isActive: true
      }
    ];
  };

  // Assign card type based on position
  const getCardType = (index: number) => {
    const types = ['basic', 'premium', 'standard'] as const;
    return types[index % 3];
  };

  // Function to start over
  const startOver = () => {
    router.push("/c/wm");
  };

  return (
    <div className="min-h-screen flex flex-col">
      <HomeHeader />
      
      <main className="flex-grow container mx-auto px-4 py-8">
        <h1 className="text-4xl font-semibold text-[#fe92b5] text-center mb-10">Your Personalized Recommendation</h1>
        
        {/* Recommendation Section - STATIC */}
        <section className="mb-16">
          <div className="bg-white rounded-xl shadow-lg overflow-hidden max-w-4xl mx-auto">
            <div className="bg-gradient-to-r from-[#fe92b5]/10 to-[#fe92b5]/5 p-6 flex items-center">
              <div className="w-16 h-16 bg-[#fe92b5] rounded-full flex items-center justify-center mr-4">
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
                {/* Product Image */}
                <div className="md:w-1/3">
                  <div className="h-64 w-full bg-gray-200 rounded-lg flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-20 w-20 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  
                  <div className="mt-2 inline-block px-3 py-1 bg-gray-100 text-gray-600 text-sm rounded-full">
                    Prescription required
                  </div>
                  
                  <div className="mt-2 ml-2 inline-block px-3 py-1 bg-gray-100 text-gray-600 text-sm rounded-full">
                    Injectable
                  </div>
                </div>
                
                {/* Product Details */}
                <div className="md:w-2/3">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">{staticProduct.title}</h3>
                  <div className="flex items-center mb-4">
                    <span className="text-xl font-bold text-black">${staticProduct.price}</span>
                    <span className="ml-2 px-2 py-1 bg-[#fe92b5] text-white text-xs rounded-full">Recommended</span>
                  </div>
                  <p className="text-gray-700 mb-6">{staticProduct.description}</p>
                  
                  <div className="bg-gray-50 p-4 rounded-lg mb-6">
                    <h4 className="font-semibold mb-2">Why This Is Right For You:</h4>
                    <p>
                      Thank you for sharing your responses with us. Based on your current 
                      weight of 70 kg, height of 78 inches, and your diagnosis of Type 2 
                      Diabetes, we believe that Compounded Semaglutide – Physician-
                      Formulated Weight Loss Solution could be an excellent fit for you. 
                      Semaglutide has been shown to be effective not only in facilitating 
                      weight loss but also in improving glycemic control for individuals with 
                      Type 2 Diabetes. By enhancing insulin sensitivity and regulating 
                      appetite, it can help you achieve sustainable and healthy weight loss.
                    </p>
                  </div>
                  
                  <Link href={`/products/${staticProduct.slug.current}`} className="block w-full">
                    <button className="bg-black text-white text-lg font-medium px-6 py-3 rounded-full w-full hover:bg-gray-900">
                      Learn More About This Product
                    </button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
        
        {/* Subscription Packages Section */}
        <section className="mb-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-[#e63946] mb-4">Enhance Your Results with a Subscription Plan</h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Our subscription plans provide ongoing support, monitoring, and exclusive benefits 
              to help you maximize your weight loss journey and maintain results.
            </p>
          </div>

          {isLoading ? (
            <div className="flex justify-center items-center py-12">
              <div className="w-16 h-16 border-4 border-gray-300 border-t-[#fe92b5] rounded-full animate-spin"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {subscriptions.map((subscription, index) => (
                <SubscriptionCard
                  key={subscription._id}
                  id={subscription._id}
                  title={subscription.title}
                  titleEs={subscription.titleEs}
                  description={subscription.description}
                  descriptionEs={subscription.descriptionEs}
                  price={subscription.price}
                  billingPeriod={subscription.billingPeriod}
                  features={subscription.features || []}
                  featuresEs={subscription.featuresEs || []}
                  categories={subscription.categories}
                  cardType={getCardType(index)}
                />
              ))}
            </div>
          )}

          <div className="text-center mt-12">
            <Link href="/subscriptions" className="inline-block bg-black text-white font-medium px-8 py-3 rounded-full hover:bg-gray-900">
              View All Subscription Plans
            </Link>
          </div>
        </section>
      </main>
      
      <GlobalFooter />
    </div>
  );
}