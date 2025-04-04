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
    <div>
      {/* Header section with brand styling */}
      <div style={{ background: "#F7F7F7" }}>
        <div className="max-w-7xl mx-auto px-4 py-16 sm:py-24 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 
              className="text-3xl font-extrabold tracking-tight sm:text-4xl md:text-5xl"
              style={{ color: "#e63946" }} // Brand red color
            >
              Subscription Plans
            </h1>
            <p className="mt-6 max-w-2xl mx-auto text-xl text-gray-700">
              Choose a subscription plan that best fits your needs and enjoy exclusive benefits
            </p>
          </div>
        </div>
      </div>

      {/* Main content with white background */}
      <div className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
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
    </div>
  );
}