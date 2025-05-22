// src/lib/subscription-helpers.ts

import { groq } from 'next-sanity';
import { client } from '@/sanity/lib/client';
import { Subscription, SubscriptionCategory } from '@/types/subscription-page';

/**
 * Gets subscription by slug
 */
export async function getSubscriptionBySlug(slug: string): Promise<Subscription | null> {
  try {
    const subscription = await client.fetch(
      groq`*[_type == "subscription" && slug.current == $slug && isActive == true && isDeleted != true][0] {
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
        features[]{
          featureText,
          _key
        },
        featuresEs[]{
          featureText,
          _key
        },
        image,
        featuredImage,
        isActive,
        isFeatured,
        stripePriceId,
        stripeProductId,
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
    
    return subscription || null;
  } catch (error) {
    console.error("Error fetching subscription by slug:", error);
    return null;
  }
}

/**
 * Gets all subscription slugs for static generation
 */
export async function getAllSubscriptionSlugs(): Promise<string[]> {
  try {
    const slugs = await client.fetch(
      groq`*[_type == "subscription" && isActive == true && isDeleted != true].slug.current`
    );
    
    return slugs || [];
  } catch (error) {
    console.error("Error fetching subscription slugs:", error);
    return [];
  }
}

/**
 * Gets plain text description from block content
 */
export function getPlainTextDescription(
  blocks: any[] = [], 
  maxLength: number = 150
): string {
  if (!blocks || !Array.isArray(blocks) || blocks.length === 0) {
    return '';
  }
  
  try {
    // Extract text from blocks
    const text = blocks
      .map(block => {
        if (block._type !== 'block' || !block.children) {
          return '';
        }
        return block.children
          .map((child: any) => child.text)
          .join('');
      })
      .join(' ');
    
    // Trim and limit to maxLength
    return text.length > maxLength
      ? `${text.substring(0, maxLength)}...`
      : text;
  } catch (error) {
    console.error("Error extracting plain text from blocks:", error);
    return '';
  }
}

/**
 * Gets related subscriptions for a given subscription
 */
export async function getRelatedSubscriptions(subscription: Subscription): Promise<Subscription[]> {
  try {
    // Get categories from the current subscription
    const categoryIds = subscription.categories ? 
      subscription.categories.map(category => category._id) : [];
    
    if (categoryIds.length === 0) {
      return [];
    }
    
    // Fetch subscriptions from the same categories, excluding the current one
    const relatedSubscriptions = await client.fetch(
      groq`*[
        _type == "subscription" && 
        references($categoryIds) && 
        _id != $currentId && 
        isActive == true && 
        isDeleted != true
      ] | order(isFeatured desc) [0...3] {
        _id,
        title,
        titleEs,
        slug,
        description,
        descriptionEs,
        price,
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
        features[]{
          featureText,
          _key
        },
        featuresEs[]{
          featureText,
          _key
        },
        image,
        featuredImage,
        isActive,
        isFeatured,
        "categories": categories[]->{ 
          _id, 
          title, 
          titleEs,
          slug
        }
      }`,
      { 
        categoryIds: categoryIds,
        currentId: subscription._id
      }
    );
    
    return relatedSubscriptions;
  } catch (error) {
    console.error("Error fetching related subscriptions:", error);
    return [];
  }
}