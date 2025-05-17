// src/app/(default)/subscriptions/[slug]/page.tsx
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import SubscriptionDetails from '../components/SubscriptionDetails';
import RelatedSubscriptions from '../components/RelatedSubscriptions';
import { getSubscriptionBySlug, getAllSubscriptionSlugs, getPlainTextDescription, getRelatedSubscriptions } from '@/lib/subscription-helpers';
import { urlFor } from '@/sanity/lib/image';

// Define params type compatible with Next.js 15.2.4
type PageParams = {
  slug: string;
}

// Define props type that matches Next.js 15.2.4 expectations
type Props = {
  params: PageParams;
  searchParams: Record<string, string | string[] | undefined>;
}

// Generate metadata dynamically based on the subscription
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = params;
  
  // Fetch the subscription data for metadata
  const subscription = await getSubscriptionBySlug(slug);
  
  if (!subscription) {
    return {
      title: 'Subscription Not Found',
      description: 'The requested subscription could not be found.'
    };
  }
  
  return {
    title: `${subscription.title} | Subscription Plan`,
    description: getPlainTextDescription(subscription.description),
    openGraph: subscription.image ? {
      images: [urlFor(subscription.image).width(1200).height(630).url()],
      title: subscription.title,
      description: getPlainTextDescription(subscription.description, 200),
      type: 'website',
    } : undefined
  };
}

// Generate static params for common subscriptions
export async function generateStaticParams(): Promise<PageParams[]> {
  const slugs = await getAllSubscriptionSlugs();
  
  return slugs.map((slug: string) => ({
    slug,
  }));
}

// Page component with fixed Props type
export default async function SubscriptionPage({ params }: Props) {
  const { slug } = params;
  const subscription = await getSubscriptionBySlug(slug);
  
  // If subscription not found, show 404
  if (!subscription) {
    notFound();
  }
  
  // Fetch related subscriptions
  const relatedSubscriptions = await getRelatedSubscriptions(subscription);
  
  return (
    <>
      <SubscriptionDetails subscription={subscription} />
      
      {/* Show related subscriptions if any */}
      {relatedSubscriptions.length > 0 && (
        <RelatedSubscriptions subscriptions={relatedSubscriptions} />
      )}
    </>
  );
}