// src/app/(default)/subscriptions/components/SubscriptionImage.tsx
import Image from 'next/image';
import { motion } from 'framer-motion';
import { urlFor } from '@/sanity/lib/image';
import { Translations } from '@/types/subscriptionDetails';
import { globalPricing } from '@/utils/pricing';

interface SubscriptionImageProps {
  subscription: any;
  pricing: any;
  translations: Translations;
  selectedVariant: any;
  selectedBase: boolean;
  discountedPrice: number | null;
}

export const SubscriptionImage: React.FC<SubscriptionImageProps> = ({
  subscription,
  pricing,
  translations,
  selectedVariant,
  selectedBase,
  discountedPrice
}) => {
  const getImageUrl = (): string => {
    if (subscription.image) {
      return urlFor(subscription.image).width(1000).height(800).url();
    }
    if (subscription.featuredImage) {
      return urlFor(subscription.featuredImage).width(1000).height(800).url();
    }
    return '/images/subscription-placeholder.jpg';
  };

  const getDiscountPercentage = (compareAtPrice: number | undefined, price: number): number | null => {
    if (!compareAtPrice || compareAtPrice <= price) return null;
    return globalPricing.calculateDiscountPercentage(compareAtPrice, price);
  };

  const getLocalizedTitle = (): string => {
    return subscription.titleEs || subscription.title;
  };

  const getLocalizedVariantDescription = (variant: any): string => {
    return variant?.descriptionEs || variant?.description || '';
  };

  return (
    <motion.div>
      {/* Featured Badge */}
      {subscription.isFeatured && (
        <div className="mb-4">
          <span className="inline-block bg-[#fff1f2] text-[#e63946] px-4 py-1 rounded-full text-sm font-semibold">
            Featured Plan
          </span>
        </div>
      )}
      
      {/* Subscription Title */}
      <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
        {getLocalizedTitle()}
      </h1>
      
      {/* Price and Billing Period */}
      <div className="flex flex-col mb-6">
        <div className="flex items-baseline">
          <span className="text-3xl font-bold text-[#e63946]">
            {pricing.monthlyEquivalent}
          </span>
        </div>
        <div className="mt-1">
          <span className="text-sm text-gray-600">
            {pricing.totalPriceText}
          </span>
        </div>
        
        {/* Show discount if available */}
        {selectedVariant && !selectedBase && selectedVariant.compareAtPrice &&
          selectedVariant.compareAtPrice > selectedVariant.price && !discountedPrice && (
            <div className="mt-1 flex items-center">
              <span className="text-gray-500 line-through mr-2">
                {globalPricing.formatter.formatPrice(selectedVariant.compareAtPrice)}
              </span>
              <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                {translations.savePercent} {getDiscountPercentage(selectedVariant.compareAtPrice, selectedVariant.price)}%
              </span>
            </div>
          )
        }
        
        {/* Show base subscription discount if available */}
        {(selectedBase || !subscription.hasVariants) && subscription.compareAtPrice &&
          subscription.compareAtPrice > subscription.price && !discountedPrice && (
            <div className="mt-1 flex items-center">
              <span className="text-gray-500 line-through mr-2">
                {globalPricing.formatter.formatPrice(subscription.compareAtPrice)}
              </span>
              <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                {translations.savePercent} {getDiscountPercentage(subscription.compareAtPrice, subscription.price)}%
              </span>
            </div>
          )
        }
        
        {/* Variant-specific information */}
        {subscription.hasVariants && selectedVariant && !selectedBase && getLocalizedVariantDescription(selectedVariant) && (
          <div className="mt-2 text-sm">
            <p className="text-gray-600">{getLocalizedVariantDescription(selectedVariant)}</p>
          </div>
        )}
      </div>
      
      {/* Main Image */}
      <div className="relative w-full h-[450px] md:h-[550px] rounded-lg overflow-hidden mb-4">
        <Image
          src={getImageUrl()}
          alt={getLocalizedTitle()}
          fill
          style={{ objectFit: 'cover' }}
          className="rounded-lg"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 600px"
          priority
        />
      </div>

      {/* Image Disclaimer */}
      <p className="text-sm text-gray-500 italic mb-8 text-center">
        {translations.imageDisclaimer}
      </p>
    </motion.div>
  );
};