//src/types/subscription-page.ts
import { SanityImageSource } from '@sanity/image-url/lib/types/types';

export interface SubscriptionFeature {
  featureText: string;
}

export interface SubscriptionCategory {
  _id: string;
  title: string;
  titleEs?: string;
  slug: {
    current: string;
  };
  description?: string;
  descriptionEs?: string;
  displayOrder?: number;
}

// Type for the blocks in Portable Text
export interface BlockContent {
  _key: string;
  _type: string;
  style?: string;
  markDefs?: Array<{
    _key: string;
    _type: string;
    href?: string;
  }>;
  children?: Array<{
    _key: string;
    _type: string;
    marks?: string[];
    text?: string;
  }>;
  listItem?: string;
  level?: number;
}

export interface Subscription {
  _id: string;
  title: string;
  titleEs?: string;
  slug: {
    current: string;
  };
  description?: BlockContent[]; // Updated to BlockContent array
  descriptionEs?: BlockContent[]; // Updated to BlockContent array
  price: number;
  billingPeriod: string;
  features?: SubscriptionFeature[];
  featuresEs?: SubscriptionFeature[];
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