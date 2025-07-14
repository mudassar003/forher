// src/hooks/useSubscriptionPricing.ts
import { useState, useEffect, useMemo } from 'react';
import { SubscriptionVariant } from '@/types/subscription-page';
import { globalPricing } from '@/utils/pricing';

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
  currentLanguage: string
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
    let monthlyDisplayPrice: number | null | undefined;

    // Determine which pricing to use
    if (subscription.hasVariants && selectedVariant && !selectedBase) {
      price = selectedVariant.price;
      billingPeriod = selectedVariant.billingPeriod;
      customBillingPeriodMonths = selectedVariant.customBillingPeriodMonths;
      monthlyDisplayPrice = selectedVariant.monthlyDisplayPrice;
    } else {
      price = subscription.price;
      billingPeriod = subscription.billingPeriod;
      customBillingPeriodMonths = subscription.customBillingPeriodMonths;
      monthlyDisplayPrice = subscription.monthlyDisplayPrice;
    }

    const originalPrice = price;
    const effectivePrice = discountedPrice !== null ? discountedPrice : price;

    // Use monthlyDisplayPrice if available, otherwise calculate
    const monthlyPrice = monthlyDisplayPrice || globalPricing.calculateMonthlyPrice(
      effectivePrice, 
      billingPeriod, 
      customBillingPeriodMonths
    );

    // Format the monthly equivalent
    const formattedMonthlyPrice = globalPricing.formatter.formatPrice(monthlyPrice);
    const monthlyEquivalent = `${formattedMonthlyPrice}${translations.month}`;

    // Format the total price
    const formattedTotalPrice = globalPricing.formatter.formatPrice(effectivePrice);

    // Build total price text based on billing period
    let totalPriceText = '';
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
        const months = customBillingPeriodMonths || 1;
        const customText = currentLanguage === 'es' 
          ? `${formattedTotalPrice} total por ${months} ${months === 1 ? 'mes' : 'meses'}`
          : `${formattedTotalPrice} total for ${months} ${months === 1 ? 'month' : 'months'}`;
        totalPriceText = customText;
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
  }, [subscription, selectedVariant, selectedBase, discountedPrice, translations]);

  return pricing;
}