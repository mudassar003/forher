// src/app/(default)/subscriptions/[slug]/page.tsx
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import SubscriptionDetails from '../components/SubscriptionDetails';
import RelatedSubscriptions from '../components/RelatedSubscriptions';
import { getSubscriptionBySlug, getAllSubscriptionSlugs, getPlainTextDescription, getRelatedSubscriptions } from '@/lib/subscription-helpers';
import { urlFor } from '@/sanity/lib/image';

interface PageProps {
  params: {
    slug: string;
  };
}

// Generate metadata dynamically based on the subscription
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
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
export async function generateStaticParams() {
  const slugs = await getAllSubscriptionSlugs();
  
  return slugs.map((slug: string) => ({
    slug,
  }));
}

export default async function SubscriptionPage({ params }: PageProps) {
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