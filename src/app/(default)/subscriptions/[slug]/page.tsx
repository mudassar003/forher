// src/app/(default)/subscriptions/[slug]/page.tsx
// Temporarily disable TypeScript checking for this file
// @ts-nocheck
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import SubscriptionDetails from '../components/SubscriptionDetails';
import RelatedSubscriptions from '../components/RelatedSubscriptions';
import SubscriptionFAQ from '../components/SubscriptionFAQ';
import { getSubscriptionBySlug, getAllSubscriptionSlugs, getPlainTextDescription, getRelatedSubscriptions } from '@/lib/subscription-helpers';
import { urlFor } from '@/sanity/lib/image';

export async function generateMetadata({ params }) {
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

export async function generateStaticParams() {
  const slugs = await getAllSubscriptionSlugs();
  
  return slugs.map((slug) => ({
    slug,
  }));
}

export default async function SubscriptionPage({ params }) {
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
      
      {/* FAQ Section */}
      <div className="bg-gray-50 py-12">
        <SubscriptionFAQ
          title={`${subscription.title} FAQs`}
          titleEs={subscription.titleEs ? `Preguntas Frecuentes sobre ${subscription.titleEs}` : undefined}
        />
      </div>
      
      {/* Show related subscriptions if any */}
      {relatedSubscriptions.length > 0 && (
        <RelatedSubscriptions subscriptions={relatedSubscriptions} />
      )}
    </>
  );
}