// src/app/api/admin/price-comparison/route.ts
import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { client as sanityClient } from '@/sanity/lib/client';
import { groq } from 'next-sanity';

// Initialize Stripe with proper error handling
if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY environment variable is not defined');
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: undefined, // Use latest API version
});

// Strict TypeScript interfaces
interface SanityVariant {
  _key: string;
  title: string;
  titleEs?: string;
  price: number;
  billingPeriod: string;
  customBillingPeriodMonths?: number | null;
  stripePriceId?: string;
}

interface SanitySubscription {
  _id: string;
  title: string;
  price: number;
  billingPeriod: string;
  customBillingPeriodMonths?: number | null;
  stripePriceId?: string;
  hasVariants?: boolean;
  variants?: SanityVariant[];
}

interface StripePrice {
  id: string;
  unit_amount: number | null;
  currency: string;
  active: boolean;
}

export interface PriceComparisonRow {
  subscriptionId: string;
  subscriptionTitle: string;
  variantKey?: string;
  variantTitle?: string;
  sanityPrice: number;
  stripePrice?: number;
  stripePriceId?: string;
  status: 'OK' | 'DIFFERENT' | 'MISSING' | 'NOT_FOUND' | 'ERROR';
  statusMessage: string;
  needsAction: boolean;
  actionType?: 'sync' | 'create';
  error?: string;
}

export interface PriceComparisonResponse {
  success: boolean;
  rows: PriceComparisonRow[];
  error?: string;
}

// Helper function to get Stripe price safely
async function getStripePrice(priceId: string): Promise<StripePrice | null> {
  try {
    const price = await stripe.prices.retrieve(priceId);
    return {
      id: price.id,
      unit_amount: price.unit_amount,
      currency: price.currency,
      active: price.active,
    };
  } catch (error) {
    console.error(`Error fetching Stripe price ${priceId}:`, error);
    return null;
  }
}

// Helper function to create comparison row
function createComparisonRow(
  subscription: SanitySubscription,
  variant?: SanityVariant,
  stripePrice?: StripePrice | null,
  error?: string
): PriceComparisonRow {
  const isVariant = Boolean(variant);
  const sanityPrice = isVariant ? variant!.price : subscription.price;
  const stripePriceId = isVariant ? variant!.stripePriceId : subscription.stripePriceId;
  const title = isVariant ? variant!.title : 'Base Plan';

  // Determine status
  if (error) {
    return {
      subscriptionId: subscription._id,
      subscriptionTitle: subscription.title,
      variantKey: variant?._key,
      variantTitle: title,
      sanityPrice,
      stripePriceId,
      status: 'ERROR',
      statusMessage: `Error: ${error}`,
      needsAction: false,
      error,
    };
  }

  if (!stripePriceId) {
    return {
      subscriptionId: subscription._id,
      subscriptionTitle: subscription.title,
      variantKey: variant?._key,
      variantTitle: title,
      sanityPrice,
      status: 'MISSING',
      statusMessage: 'No Stripe Price ID in Sanity',
      needsAction: true,
      actionType: 'create',
    };
  }

  if (!stripePrice) {
    return {
      subscriptionId: subscription._id,
      subscriptionTitle: subscription.title,
      variantKey: variant?._key,
      variantTitle: title,
      sanityPrice,
      stripePriceId,
      status: 'NOT_FOUND',
      statusMessage: 'Stripe Price ID not found or deleted',
      needsAction: true,
      actionType: 'create',
    };
  }

  const stripePriceAmount = stripePrice.unit_amount ? stripePrice.unit_amount / 100 : 0;
  
  if (stripePriceAmount !== sanityPrice) {
    return {
      subscriptionId: subscription._id,
      subscriptionTitle: subscription.title,
      variantKey: variant?._key,
      variantTitle: title,
      sanityPrice,
      stripePrice: stripePriceAmount,
      stripePriceId,
      status: 'DIFFERENT',
      statusMessage: `Sanity: $${sanityPrice} | Stripe: $${stripePriceAmount}`,
      needsAction: true,
      actionType: 'sync',
    };
  }

  return {
    subscriptionId: subscription._id,
    subscriptionTitle: subscription.title,
    variantKey: variant?._key,
    variantTitle: title,
    sanityPrice,
    stripePrice: stripePriceAmount,
    stripePriceId,
    status: 'OK',
    statusMessage: `$${sanityPrice} - Prices match`,
    needsAction: false,
  };
}

export async function GET(): Promise<NextResponse<PriceComparisonResponse>> {
  try {
    console.log('Starting price comparison...');

    // Fetch all active subscriptions from Sanity
    const subscriptions = await sanityClient.fetch<SanitySubscription[]>(
      groq`*[_type == "subscription" && isActive == true && isDeleted != true] {
        _id,
        title,
        price,
        billingPeriod,
        customBillingPeriodMonths,
        stripePriceId,
        hasVariants,
        variants[]{
          _key,
          title,
          titleEs,
          price,
          billingPeriod,
          customBillingPeriodMonths,
          stripePriceId
        }
      }`
    );

    console.log(`Found ${subscriptions.length} subscriptions`);

    const rows: PriceComparisonRow[] = [];

    // Process each subscription
    for (const subscription of subscriptions) {
      try {
        if (subscription.hasVariants && subscription.variants && subscription.variants.length > 0) {
          // Process each variant
          for (const variant of subscription.variants) {
            let stripePrice: StripePrice | null = null;
            let error: string | undefined;

            if (variant.stripePriceId) {
              stripePrice = await getStripePrice(variant.stripePriceId);
              if (!stripePrice) {
                error = 'Price not found in Stripe';
              }
            }

            const row = createComparisonRow(subscription, variant, stripePrice, error);
            rows.push(row);
          }
        } else {
          // Process base subscription (no variants)
          let stripePrice: StripePrice | null = null;
          let error: string | undefined;

          if (subscription.stripePriceId) {
            stripePrice = await getStripePrice(subscription.stripePriceId);
            if (!stripePrice) {
              error = 'Price not found in Stripe';
            }
          }

          const row = createComparisonRow(subscription, undefined, stripePrice, error);
          rows.push(row);
        }
      } catch (subscriptionError) {
        console.error(`Error processing subscription ${subscription._id}:`, subscriptionError);
        const errorRow = createComparisonRow(
          subscription,
          undefined,
          undefined,
          subscriptionError instanceof Error ? subscriptionError.message : 'Unknown error'
        );
        rows.push(errorRow);
      }
    }

    console.log(`Generated ${rows.length} comparison rows`);

    return NextResponse.json({
      success: true,
      rows,
    });

  } catch (error) {
    console.error('Error in price comparison:', error);
    return NextResponse.json(
      {
        success: false,
        rows: [],
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      },
      { status: 500 }
    );
  }
}