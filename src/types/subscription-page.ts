// src/types/subscription-page.ts
import { SanityImageSource } from "@sanity/image-url/lib/types/types";

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
  displayOrder: number;
}

export interface Subscription {
  _id: string;
  title: string;
  slug: {
    current: string;
  };
  description?: string;
  price: number;
  billingPeriod: 'monthly' | 'quarterly' | 'annually';
  features: SubscriptionFeature[];
  image?: SanityImageSource;
  appointmentAccess: boolean;
  appointmentDiscountPercentage: number;
  isActive: boolean;
  isFeatured: boolean;
  categories?: SubscriptionCategory[];
}

export interface SubscriptionsData {
  categories: SubscriptionCategory[];
  subscriptionsByCategory: Record<string, Subscription[]>;
  uncategorizedSubscriptions: Subscription[];
  featuredSubscriptions: Subscription[];
  allSubscriptions: Subscription[];
  error?: string;
}