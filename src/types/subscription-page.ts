// src/types/subscription-page.ts
import { SanityImageSource } from '@sanity/image-url/lib/types/types';

export interface SubscriptionFeature {
  featureText: string;
}

export interface SubscriptionCategory {
  _id: string;
  title: string;
  slug: {
    current: string;
  };
  description?: string;
  displayOrder?: number;
}

export interface Subscription {
  _id: string;
  title: string;
  slug: {
    current: string;
  };
  description?: string;
  price: number;
  billingPeriod: string;
  features?: SubscriptionFeature[];
  image?: SanityImageSource;
  isFeatured: boolean;
  isActive: boolean;
  categories?: SubscriptionCategory[];
  stripePriceId?: string;
  stripeProductId?: string;
}

export interface SubscriptionsData {
  categories: SubscriptionCategory[];
  subscriptionsByCategory: Record<string, Subscription[]>;
  uncategorizedSubscriptions: Subscription[];
  featuredSubscriptions: Subscription[];
  allSubscriptions: Subscription[];
  error?: string;
}