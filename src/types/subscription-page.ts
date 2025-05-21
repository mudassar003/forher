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

export interface Subscription {
  _id: string;
  title: string;
  titleEs?: string;
  slug: {
    current: string;
  };
  description?: BlockContent[]; // BlockContent array
  descriptionEs?: BlockContent[]; // BlockContent array
  price: number;
  billingPeriod: string;
  features?: SubscriptionFeature[];
  featuresEs?: SubscriptionFeature[];
  image?: SanityImageSource;
  featuredImage?: SanityImageSource; // New field for dedicated catalog images
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