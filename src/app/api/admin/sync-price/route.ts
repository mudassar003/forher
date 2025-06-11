// src/app/api/admin/sync-price/route.ts
import { NextRequest, NextResponse } from 'next/server';
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
  stripeProductId?: string;
  hasVariants?: boolean;
  variants?: SanityVariant[];
}

interface SyncPriceRequest {
  subscriptionId: string;
  variantKey?: string;
  action: 'sync' | 'create';
}

interface SyncPriceResponse {
  success: boolean;
  message: string;
  newPriceId?: string;
  error?: string;
}

// Helper function to convert Sanity billing period to Stripe interval configuration
function getStripeIntervalConfig(
  billingPeriod: string,
  customBillingPeriodMonths?: number | null
): { interval: Stripe.PriceCreateParams.Recurring.Interval; intervalCount: number } {
  let interval: Stripe.PriceCreateParams.Recurring.Interval = 'month';
  let intervalCount = 1;

  switch (billingPeriod) {
    case 'monthly':
      interval = 'month';
      intervalCount = 1;
      break;
    case 'three_month':
      interval = 'month';
      intervalCount = 3;
      break;
    case 'six_month':
      interval = 'month';
      intervalCount = 6;
      break;
    case 'annually':
      interval = 'year';
      intervalCount = 1;
      break;
    case 'other':
      interval = 'month';
      intervalCount = customBillingPeriodMonths || 1;

      // Stripe limits: month (max 12), year (max 3)
      if (intervalCount > 12) {
        if (intervalCount % 12 === 0) {
          interval = 'year';
          intervalCount = intervalCount / 12;
        } else {
          console.warn(`Billing period of ${intervalCount} months exceeds Stripe's limit. Capping at 12 months.`);
          intervalCount = 12;
        }
      }
      break;
    default:
      interval = 'month';
      intervalCount = 1;
  }

  return { interval, intervalCount };
}

export async function POST(req: NextRequest): Promise<NextResponse<SyncPriceResponse>> {
  try {
    const requestBody: SyncPriceRequest = await req.json();
    const { subscriptionId, variantKey, action } = requestBody;

    // Validate required fields
    if (!subscriptionId || !action) {
      return NextResponse.json(
        {
          success: false,
          message: 'Missing required fields: subscriptionId and action',
        },
        { status: 400 }
      );
    }

    if (!['sync', 'create'].includes(action)) {
      return NextResponse.json(
        {
          success: false,
          message: 'Invalid action. Must be "sync" or "create"',
        },
        { status: 400 }
      );
    }

    console.log(`Syncing price for subscription ${subscriptionId}, variant ${variantKey || 'base'}, action: ${action}`);

    // Fetch subscription from Sanity
    const subscription = await sanityClient.fetch<SanitySubscription>(
      groq`*[_type == "subscription" && _id == $id][0] {
        _id,
        title,
        price,
        billingPeriod,
        customBillingPeriodMonths,
        stripePriceId,
        stripeProductId,
        hasVariants,
        variants[]{
          _key,
          title,
          price,
          billingPeriod,
          customBillingPeriodMonths,
          stripePriceId
        }
      }`,
      { id: subscriptionId }
    );

    if (!subscription) {
      return NextResponse.json(
        {
          success: false,
          message: 'Subscription not found',
        },
        { status: 404 }
      );
    }

    // Determine if we're working with variant or base subscription
    const variant = variantKey 
      ? subscription.variants?.find(v => v._key === variantKey)
      : undefined;

    if (variantKey && !variant) {
      return NextResponse.json(
        {
          success: false,
          message: 'Variant not found',
        },
        { status: 404 }
      );
    }

    const targetPrice = variant ? variant.price : subscription.price;
    const targetBillingPeriod = variant ? variant.billingPeriod : subscription.billingPeriod;
    const targetCustomMonths = variant ? variant.customBillingPeriodMonths : subscription.customBillingPeriodMonths;
    const currentPriceId = variant ? variant.stripePriceId : subscription.stripePriceId;

    // Validate target price
    if (typeof targetPrice !== 'number' || targetPrice <= 0) {
      return NextResponse.json(
        {
          success: false,
          message: 'Invalid price value in Sanity',
        },
        { status: 400 }
      );
    }

    // Get or create Stripe product
    let stripeProductId = subscription.stripeProductId;
    if (!stripeProductId) {
      console.log('Creating new Stripe product...');
      const product = await stripe.products.create({
        name: subscription.title,
        description: `${subscription.title} subscription`,
        metadata: {
          sanityId: subscription._id,
        },
      });
      stripeProductId = product.id;

      // Update Sanity with product ID
      await sanityClient.patch(subscription._id).set({ stripeProductId }).commit();
      console.log(`Created new product: ${stripeProductId}`);
    }

    // Archive old price if it exists and action is sync
    if (action === 'sync' && currentPriceId) {
      try {
        await stripe.prices.update(currentPriceId, { active: false });
        console.log(`Archived old price: ${currentPriceId}`);
      } catch (archiveError) {
        console.warn(`Failed to archive old price ${currentPriceId}:`, archiveError);
        // Continue anyway - old price might already be archived or deleted
      }
    }

    // Create new Stripe price
    const { interval, intervalCount } = getStripeIntervalConfig(targetBillingPeriod, targetCustomMonths);

    console.log('Creating new Stripe price with:', {
      price: targetPrice,
      interval,
      intervalCount,
      product: stripeProductId,
    });

    const newPrice = await stripe.prices.create({
      product: stripeProductId,
      unit_amount: Math.round(targetPrice * 100), // Convert to cents
      currency: 'usd',
      recurring: {
        interval,
        interval_count: intervalCount,
      },
      metadata: {
        sanityId: subscription._id,
        variantKey: variantKey || '',
        billingPeriod: targetBillingPeriod,
        customBillingPeriodMonths: targetCustomMonths?.toString() || '',
      },
    });

    console.log(`Created new price: ${newPrice.id}`);

    // Update Sanity with new price ID
    if (variantKey) {
      // Update specific variant
      await sanityClient
        .patch(subscription._id)
        .setIfMissing({ variants: [] })
        .set({ [`variants[_key=="${variantKey}"].stripePriceId`]: newPrice.id })
        .commit();
      console.log(`Updated variant ${variantKey} with new price ID`);
    } else {
      // Update base subscription
      await sanityClient.patch(subscription._id).set({ stripePriceId: newPrice.id }).commit();
      console.log('Updated base subscription with new price ID');
    }

    const actionText = action === 'sync' ? 'synced' : 'created';
    const targetText = variantKey ? `variant "${variant!.title}"` : 'base subscription';

    return NextResponse.json({
      success: true,
      message: `Successfully ${actionText} price for ${targetText}: $${targetPrice}`,
      newPriceId: newPrice.id,
    });

  } catch (error) {
    console.error('Error syncing price:', error);
    
    // Handle specific Stripe errors
    if (error instanceof Stripe.errors.StripeError) {
      return NextResponse.json(
        {
          success: false,
          message: 'Stripe API error',
          error: error.message,
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        message: 'Failed to sync price',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}