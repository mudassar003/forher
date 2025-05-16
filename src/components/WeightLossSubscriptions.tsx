// src/components/WeightLossSubscriptions.tsx
'use client';

import { useEffect, useState } from 'react';
import { client } from '@/sanity/lib/client';
import { groq } from 'next-sanity';
import { Subscription, SubscriptionCategory } from '@/types/subscription-page';
import SpecializedSubscriptionGrid from './SpecializedSubscriptionGrid';
import useTranslations from '@/hooks/useTranslations';

interface WeightLossSubscriptionsProps {
  className?: string;
  title?: string;
}

const WeightLossSubscriptions: React.FC<WeightLossSubscriptionsProps> = ({
  className = '',
  title
}) => {
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [categories, setCategories] = useState<SubscriptionCategory[]>([]);
  const { t } = useTranslations();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch all subscriptions with translations
        const fetchedSubscriptions: Subscription[] = await client.fetch(
          groq`*[_type == "subscription" && isActive == true && isDeleted != true] {
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
            "categories": categories[]->{ 
              _id, 
              title, 
              titleEs,
              slug, 
              description, 
              descriptionEs,
              displayOrder 
            }
          }`
        );
        
        // Fetch all categories
        const fetchedCategories: SubscriptionCategory[] = await client.fetch(
          groq`*[_type == "subscriptionCategory"] | order(displayOrder asc) {
            _id,
            title,
            titleEs,
            slug,
            description,
            descriptionEs,
            displayOrder
          }`
        );
        
        setSubscriptions(fetchedSubscriptions);
        setCategories(fetchedCategories);
      } catch (err) {
        console.error("Error fetching subscription data:", err);
        setError(err instanceof Error ? err.message : 'Unknown error occurred');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  return (
    <div className={`relative py-12 ${className}`}>
      {/* Background decorative elements */}
      <div className="absolute top-1/2 left-0 w-72 h-72 rounded-full bg-[#f0f7ff] opacity-30 blur-3xl"></div>
      <div className="absolute bottom-1/4 right-0 w-80 h-80 rounded-full bg-[#ffeef2] opacity-40 blur-3xl"></div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <SpecializedSubscriptionGrid
          categorySlug="weight-loss"
          subscriptions={subscriptions}
          categories={categories}
          loading={loading}
          error={error}
          title={title || t('subscriptions.weightLossPlans')}
        />
      </div>
    </div>
  );
};

export default WeightLossSubscriptions;