// src/app/(default)/subscriptions/page.tsx
import { groq } from 'next-sanity';
import { client } from '@/sanity/lib/client';
import { Metadata } from 'next';
import SubscriptionGrid from './components/SubscriptionGrid';
import { SubscriptionsData, Subscription, SubscriptionCategory } from '@/types/subscription-page';

export const metadata: Metadata = {
  title: 'Subscription Plans',
  description: 'Choose a subscription plan that best fits your needs',
};

// A more robust function to fetch subscriptions and organize by category
async function getCategoriesWithSubscriptions(): Promise<SubscriptionsData> {
  try {
    // First fetch all subscriptions
    const subscriptions: Subscription[] = await client.fetch(
      groq`*[_type == "subscription" && isActive == true && isDeleted != true] {
        _id,
        title,
        slug,
        description,
        price,
        billingPeriod,
        features,
        image,
        isActive,
        isFeatured,
        "categories": categories[]->{ _id, title, slug, description, displayOrder }
      }`
    );
    
    // Fetch all categories to ensure we display them in correct order
    const categories: SubscriptionCategory[] = await client.fetch(
      groq`*[_type == "subscriptionCategory"] | order(displayOrder asc) {
        _id,
        title,
        slug,
        description,
        displayOrder
      }`
    );
    
    // Extract all featured subscriptions
    const featuredSubscriptions = subscriptions.filter(
      subscription => subscription.isFeatured
    );
    
    // Group subscriptions by category
    const subscriptionsByCategory: Record<string, Subscription[]> = {};
    categories.forEach(category => {
      subscriptionsByCategory[category._id] = [];
    });
    
    // Add subscriptions to their respective categories
    subscriptions.forEach(subscription => {
      if (subscription.categories && subscription.categories.length > 0) {
        subscription.categories.forEach(category => {
          if (category && subscriptionsByCategory[category._id]) {
            subscriptionsByCategory[category._id].push(subscription);
          }
        });
      }
    });
    
    // Handle uncategorized subscriptions
    const uncategorizedSubscriptions = subscriptions.filter(subscription => 
      !subscription.categories || subscription.categories.length === 0
    );
    
    return {
      categories,
      subscriptionsByCategory,
      uncategorizedSubscriptions,
      featuredSubscriptions,
      allSubscriptions: subscriptions,
    };
  } catch (error: unknown) {
    console.error("Error fetching subscription data:", error);
    // Return empty data rather than failing completely
    return {
      categories: [],
      subscriptionsByCategory: {},
      uncategorizedSubscriptions: [],
      featuredSubscriptions: [],
      allSubscriptions: [], 
      error: error instanceof Error ? error.message : String(error)
    };
  }
}

export default async function SubscriptionsPage() {
  const { 
    categories, 
    subscriptionsByCategory, 
    uncategorizedSubscriptions,
    featuredSubscriptions,
    allSubscriptions,
    error
  } = await getCategoriesWithSubscriptions();

  return (
    <div className="relative overflow-hidden">
      {/* Decorative Bubbles - Top Section */}
      <div className="absolute top-20 left-10 w-64 h-64 rounded-full bg-[#ffe6f0] opacity-20 blur-3xl"></div>
      <div className="absolute top-40 right-0 w-96 h-96 rounded-full bg-[#f9dde5] opacity-30 blur-3xl"></div>
      <div className="absolute -top-10 right-1/4 w-40 h-40 rounded-full bg-[#ffb3c1] opacity-10 blur-2xl"></div>
      
      {/* Enhanced header section with brand styling */}
      <div className="relative bg-gradient-to-r from-[#e63946] to-[#ff4d6d] py-16 sm:py-24 overflow-hidden">
        {/* Decorative elements for the header */}
        <div className="absolute top-1/2 left-1/4 w-32 h-32 rounded-full bg-white opacity-10 blur-xl"></div>
        <div className="absolute bottom-0 right-1/3 w-40 h-40 rounded-full bg-white opacity-5 blur-xl"></div>
        
        {/* Wave pattern background */}
        <div className="absolute inset-0 opacity-20">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320" className="w-full h-full">
            <path fill="#ffffff" fillOpacity="1" d="M0,192L48,176C96,160,192,128,288,138.7C384,149,480,203,576,208C672,213,768,171,864,149.3C960,128,1056,128,1152,144C1248,160,1344,192,1392,208L1440,224L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
          </svg>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center">
            <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl md:text-6xl">
              Subscription Plans
            </h1>
            <p className="mt-6 max-w-2xl mx-auto text-xl text-pink-100">
              Choose a subscription plan that best fits your needs and enjoy exclusive benefits
            </p>
          </div>
        </div>
      </div>

      {/* Main content with white background */}
      <div className="relative py-12 bg-white">
        {/* Middle section bubbles */}
        <div className="absolute top-1/2 left-0 w-72 h-72 rounded-full bg-[#f0f7ff] opacity-30 blur-3xl"></div>
        <div className="absolute bottom-1/4 right-0 w-80 h-80 rounded-full bg-[#ffeef2] opacity-40 blur-3xl"></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <SubscriptionGrid 
            categories={categories}
            subscriptionsByCategory={subscriptionsByCategory}
            uncategorizedSubscriptions={uncategorizedSubscriptions}
            featuredSubscriptions={featuredSubscriptions}
            allSubscriptions={allSubscriptions}
            error={error}
          />
        </div>
      </div>
      
      {/* Bottom bubbles */}
      <div className="absolute bottom-10 left-1/3 w-60 h-60 rounded-full bg-[#ffe6f0] opacity-30 blur-3xl"></div>
      <div className="absolute -bottom-20 right-1/4 w-48 h-48 rounded-full bg-[#f9dde5] opacity-20 blur-2xl"></div>
    </div>
  );
}