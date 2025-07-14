// src/hooks/useSubscriptionPricing.ts
import { useState, useEffect, useMemo } from 'react';
import { SubscriptionVariant } from '@/types/subscription-page';
import { globalPricing } from '@/utils/pricing';
import { Translations } from '@/types/subscriptionDetails';

interface UsePricingReturn {
  effectivePrice: number;
  originalPrice: number;
  billingPeriod: string;
  customMonths?: number | null;
  monthlyEquivalent: string;
  totalPriceText: string;
  monthlyPrice: number;
  formattedMonthlyPrice: string;
  formattedTotalPrice: string;
}

export function useSubscriptionPricing(
  subscription: any,
  selectedVariant: SubscriptionVariant | null,
  selectedBase: boolean,
  discountedPrice: number | null,
  currentLanguage: string  // Change from translations object to just language string
): UsePricingReturn {
  const [pricing, setPricing] = useState<UsePricingReturn>({
    effectivePrice: 0,
    originalPrice: 0,
    billingPeriod: 'monthly',
    monthlyEquivalent: '$0/month',
    totalPriceText: '$0 total per month',
    monthlyPrice: 0,
    formattedMonthlyPrice: '$0',
    formattedTotalPrice: '$0'
  });

  // Memoize translations to prevent recreating on every render
  const translations = useMemo(() => ({
    month: currentLanguage === 'es' ? '/mes' : '/month',
    totalPerMonth: currentLanguage === 'es' ? 'total por mes' : 'total per month',
    totalFor3Months: currentLanguage === 'es' ? 'total por 3 meses' : 'total for 3 months',
    totalFor6Months: currentLanguage === 'es' ? 'total por 6 meses' : 'total for 6 months',
    totalFor1Year: currentLanguage === 'es' ? 'total por 1 año' : 'total for 1 year',
    total: currentLanguage === 'es' ? 'total' : 'total'
  }), [currentLanguage]);

  useEffect(() => {
    let price: number;
    let billingPeriod: string;
    let customBillingPeriodMonths: number | null | undefined;

    // Determine which pricing to use
    if (subscription.hasVariants && selectedVariant && !selectedBase) {
      price = selectedVariant.price;
      billingPeriod = selectedVariant.billingPeriod;
      customBillingPeriodMonths = selectedVariant.customBillingPeriodMonths;
    } else {
      price = subscription.price;
      billingPeriod = subscription.billingPeriod;
      customBillingPeriodMonths = subscription.customBillingPeriodMonths;
    }

    const originalPrice = price;
    const effectivePrice = discountedPrice !== null ? discountedPrice : price;

    // Calculate monthly equivalent using the pricing calculator
    const monthlyPrice = globalPricing.calculateMonthlyPrice(
      effectivePrice, 
      billingPeriod, 
      customBillingPeriodMonths
    );

    // Format prices with decimal support
    const formattedMonthlyPrice = globalPricing.formatter.formatPrice(monthlyPrice);
    const formattedTotalPrice = globalPricing.formatter.formatPrice(effectivePrice);

    // Build monthly equivalent display
    const monthlyEquivalent = `${formattedMonthlyPrice}${translations.month}`;

    // Build total price text with proper translations
    let totalPriceText: string;
    switch (billingPeriod) {
      case 'monthly':
        totalPriceText = `${formattedTotalPrice} ${translations.totalPerMonth}`;
        break;
      case 'three_month':
        totalPriceText = `${formattedTotalPrice} ${translations.totalFor3Months}`;
        break;
      case 'six_month':
        totalPriceText = `${formattedTotalPrice} ${translations.totalFor6Months}`;
        break;
      case 'annually':
        totalPriceText = `${formattedTotalPrice} ${translations.totalFor1Year}`;
        break;
      case 'other':
        if (customBillingPeriodMonths && customBillingPeriodMonths > 1) {
          const monthsText = currentLanguage === 'es' 
            ? `total por ${customBillingPeriodMonths} meses`
            : `total for ${customBillingPeriodMonths} months`;
          totalPriceText = `${formattedTotalPrice} ${monthsText}`;
        } else {
          totalPriceText = `${formattedTotalPrice} ${translations.totalPerMonth}`;
        }
        break;
      default:
        totalPriceText = `${formattedTotalPrice} ${translations.total}`;
    }

    setPricing({
      effectivePrice,
      originalPrice,
      billingPeriod,
      customMonths: customBillingPeriodMonths,
      monthlyEquivalent,
      totalPriceText,
      monthlyPrice,
      formattedMonthlyPrice,
      formattedTotalPrice
    });
  }, [subscription, selectedVariant, selectedBase, discountedPrice, translations, currentLanguage]);

  return pricing;
}