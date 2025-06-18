// src/app/(default)/subscriptions/[slug]/page.tsx
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import SubscriptionDetails from '../components/SubscriptionDetails';
import RelatedSubscriptions from '../components/RelatedSubscriptions';
import SubscriptionFAQ from '../components/SubscriptionFAQ';
import { getSubscriptionBySlug, getAllSubscriptionSlugs, getPlainTextDescription, getRelatedSubscriptions } from '@/lib/subscription-helpers';
import { urlFor } from '@/sanity/lib/image';

interface SubscriptionPageParams {
  slug: string;
}

interface SubscriptionPageProps {
  params: Promise<SubscriptionPageParams>;
}

export async function generateMetadata({ params }: SubscriptionPageProps): Promise<Metadata> {
  const { slug } = await params;
  
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

export async function generateStaticParams(): Promise<SubscriptionPageParams[]> {
  const slugs = await getAllSubscriptionSlugs();
  
  return slugs.map((slug) => ({
    slug,
  }));
}

export default async function SubscriptionPage({ params }: SubscriptionPageProps) {
  const { slug } = await params;
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
      
      {/* FAQ Section with dynamic content */}
      <div className="bg-gray-50 py-12">
        <SubscriptionFAQ
          subscriptionTitle={subscription.title}
          subscriptionTitleEs={subscription.titleEs}
          faqItems={subscription.faqItems || []}
        />
      </div>
      
      {/* Show related subscriptions if any */}
      {relatedSubscriptions.length > 0 && (
        <RelatedSubscriptions subscriptions={relatedSubscriptions} />
      )}
    </>
  );
}