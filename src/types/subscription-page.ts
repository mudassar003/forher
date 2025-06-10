// src/types/subscription-page.ts
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

// Type for span children in Portable Text
export interface PortableTextSpan {
  _key?: string;
  _type: 'span';
  marks?: string[];
  text?: string;
}

// Type for mark definitions in Portable Text
export interface PortableTextMarkDef {
  _key: string;
  _type: string;
  href?: string;
}

// Type for the blocks in Portable Text
export interface BlockContent {
  _key: string;
  _type: string;
  style?: string;
  markDefs?: PortableTextMarkDef[];
  children?: PortableTextSpan[];
  listItem?: string;
  level?: number;
}

// FAQ Item interface for subscription-specific FAQs
export interface SubscriptionFAQItem {
  _key?: string;
  question: string;
  questionEs?: string;
  answer: string;
  answerEs?: string;
}

// Define all possible billing period types
export type BillingPeriod = 
  | 'monthly'
  | 'three_month'
  | 'six_month'
  | 'annually'
  | 'other';

// Interface for subscription variant with strict typing
export interface SubscriptionVariant {
  _key?: string;
  title: string;
  titleEs?: string;
  description?: string;
  descriptionEs?: string;
  dosageAmount: number;
  dosageUnit: string;
  price: number;
  compareAtPrice?: number;
  billingPeriod: BillingPeriod;
  customBillingPeriodMonths?: number | null;
  stripePriceId?: string;
  isDefault?: boolean;
  isPopular?: boolean;
}

// Main subscription interface with strict typing
export interface Subscription {
  _id: string;
  title: string;
  titleEs?: string;
  slug: {
    current: string;
  };
  description?: BlockContent[];
  descriptionEs?: BlockContent[];
  // FAQ section
  faqItems?: SubscriptionFAQItem[];
  // Base price (used when no variants)
  price: number;
  compareAtPrice?: number;
  billingPeriod: BillingPeriod;
  customBillingPeriodMonths?: number | null;
  // Variant support
  hasVariants?: boolean;
  variants?: SubscriptionVariant[];
  // Features
  features?: SubscriptionFeature[];
  featuresEs?: SubscriptionFeature[];
  // Images
  image?: SanityImageSource;
  featuredImage?: SanityImageSource;
  // Status flags
  isFeatured: boolean;
  isActive: boolean;
  // Relations
  categories?: SubscriptionCategory[];
  // Stripe integration
  stripePriceId?: string;
  stripeProductId?: string;
}

// Data structure for subscription pages
export interface SubscriptionsData {
  categories: SubscriptionCategory[];
  subscriptionsByCategory: Record<string, Subscription[]>;
  uncategorizedSubscriptions: Subscription[];
  featuredSubscriptions: Subscription[];
  allSubscriptions: Subscription[];
  error?: string;
}

// Purchase request interface
export interface SubscriptionPurchaseRequest {
  subscriptionId: string;
  userId: string;
  userEmail: string;
  variantKey?: string;
}

// Purchase response interface
export interface SubscriptionPurchaseResponse {
  success: boolean;
  sessionId?: string;
  url?: string;
  error?: string;
}