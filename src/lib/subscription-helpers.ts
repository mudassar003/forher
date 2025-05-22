// src/lib/subscription-helpers.ts
import { groq } from 'next-sanity';
import { client } from '@/sanity/lib/client';
import { Subscription } from '@/types/subscription-page';

/**
 * Fetch a subscription by its slug WITH VARIANTS
 * @param slug The subscription slug
 * @returns The subscription or null if not found
 */
export async function getSubscriptionBySlug(slug: string): Promise<Subscription | null> {
  try {
    const subscription = await client.fetch(
      groq`*[_type == "subscription" && slug.current == $slug && isActive == true && isDeleted != true][0]{
        _id,
        title,
        titleEs,
        slug,
        description,
        descriptionEs,
        price,
        compareAtPrice,
        billingPeriod,
        customBillingPeriodMonths,
        hasVariants,
        variants[]{
          _key,
          title,
          titleEs,
          description,
          descriptionEs,
          dosageAmount,
          dosageUnit,
          price,
          compareAtPrice,
          billingPeriod,
          customBillingPeriodMonths,
          stripePriceId,
          isDefault,
          isPopular
        },
        features,
        featuresEs,
        image,
        featuredImage,
        stripePriceId,
        stripeProductId,
        isActive,
        isFeatured,
        "categories": categories[]->{ 
          _id, 
          title, 
          titleEs,
          slug, 
          description, 
          descriptionEs
        }
      }`,
      { slug }
    );
    
    console.log('Fetched subscription by slug:', {
      slug,
      hasVariants: subscription?.hasVariants,
      variantCount: subscription?.variants?.length || 0
    });
    
    return subscription || null;
  } catch (error) {
    console.error(`Error fetching subscription with slug "${slug}":`, error);
    return null;
  }
}

/**
 * Get all active subscription slugs for static path generation
 * @returns Array of subscription slugs
 */
export async function getAllSubscriptionSlugs(): Promise<string[]> {
  try {
    const subscriptions = await client.fetch(
      groq`*[_type == "subscription" && isActive == true && isDeleted != true] {
        "slug": slug.current
      }`
    );
    
    return subscriptions.map((subscription: { slug: string }) => subscription.slug);
  } catch (error) {
    console.error('Error fetching subscription slugs:', error);
    return [];
  }
}

/**
 * Get related subscriptions from the same category as the provided subscription
 * @param subscription The subscription to find related ones for
 * @param limit Maximum number of related subscriptions to return
 * @returns Array of related subscriptions
 */
export async function getRelatedSubscriptions(subscription: Subscription, limit: number = 3): Promise<Subscription[]> {
  try {
    // If subscription has no categories, return empty array
    if (!subscription.categories || subscription.categories.length === 0) {
      return [];
    }
    
    // Get the first category ID
    const categoryId = subscription.categories[0]._id;
    
    // Fetch related subscriptions from the same category WITH VARIANTS
    const related = await client.fetch(
      groq`*[_type == "subscription" && 
            references($categoryId) && 
            _id != $subscriptionId && 
            isActive == true && 
            isDeleted != true
      ] | order(isFeatured desc) [0...$limit] {
        _id,
        title,
        titleEs,
        slug,
        price,
        compareAtPrice,
        billingPeriod,
        customBillingPeriodMonths,
        hasVariants,
        variants[]{
          _key,
          title,
          titleEs,
          price,
          billingPeriod,
          customBillingPeriodMonths,
          isDefault,
          isPopular
        },
        image,
        featuredImage,
        isFeatured
      }`,
      { 
        categoryId, 
        subscriptionId: subscription._id,
        limit: limit - 1 // Minus 1 to account for 0-based indexing in limit range
      }
    );
    
    return related || [];
  } catch (error) {
    console.error('Error fetching related subscriptions:', error);
    return [];
  }
}

/**
 * Extract a plain text description from block content (for meta descriptions, etc.)
 * @param description The block content description
 * @param maxLength Maximum length of the extracted text
 * @returns Plain text description
 */
export function getPlainTextDescription(description?: any[], maxLength: number = 160): string {
  if (!description || !Array.isArray(description)) {
    return '';
  }
  
  // Extract text from the blocks
  const text = description
    .flatMap(block => (block.children || [])
      .map((child: any) => child.text || '')
      .join(' ')
    )
    .join(' ')
    .trim();
    
  // Limit the length and add ellipsis if needed
  if (text.length <= maxLength) {
    return text;
  }
  
  return text.slice(0, maxLength).trim() + '...';
}