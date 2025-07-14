// src/utils/pricing.ts
// Enterprise-level pricing utilities with decimal support

export interface PriceFormatOptions {
  currency?: string;
  locale?: string;
  showDecimals?: boolean;
  forceDecimals?: boolean;
  minimumFractionDigits?: number;
  maximumFractionDigits?: number;
}

export interface BillingPeriodConfig {
  months: number;
  displayKey: string;
  sortOrder: number;
}

// Billing period configurations for enterprise scaling
export const BILLING_PERIODS: Record<string, BillingPeriodConfig> = {
  monthly: { months: 1, displayKey: 'monthly', sortOrder: 1 },
  three_month: { months: 3, displayKey: 'quarterly', sortOrder: 2 },
  six_month: { months: 6, displayKey: 'semiAnnual', sortOrder: 3 },
  annually: { months: 12, displayKey: 'annual', sortOrder: 4 },
  other: { months: 1, displayKey: 'custom', sortOrder: 5 }
};

/**
 * Enterprise-grade price formatter with decimal control
 * Handles both display prices (with decimals) and internal calculations
 */
export class PriceFormatter {
  private defaultOptions: Required<PriceFormatOptions> = {
    currency: 'USD',
    locale: 'en-US',
    showDecimals: true,
    forceDecimals: false,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2
  };

  constructor(private options: PriceFormatOptions = {}) {
    this.defaultOptions = { ...this.defaultOptions, ...options };
  }

  /**
   * Smart price formatting - shows decimals when meaningful
   * For advertising: always show .99 prices
   * For calculations: maintain precision
   */
  formatPrice(price: number, options?: PriceFormatOptions): string {
    const opts = { ...this.defaultOptions, ...options };
    
    // Check if price has meaningful decimals
    const hasDecimals = price % 1 !== 0;
    const shouldShowDecimals = opts.showDecimals && (hasDecimals || opts.forceDecimals);
    
    // For advertising prices ending in .99, always show decimals
    const isAdvertisingPrice = this.isAdvertisingPrice(price);
    
    return new Intl.NumberFormat(opts.locale, {
      style: 'currency',
      currency: opts.currency,
      minimumFractionDigits: shouldShowDecimals || isAdvertisingPrice ? 2 : 0,
      maximumFractionDigits: opts.maximumFractionDigits,
    }).format(price);
  }

  /**
   * Check if price is likely an advertising price (ends in .99, .95, etc.)
   */
  private isAdvertisingPrice(price: number): boolean {
    const decimal = price % 1;
    const roundedDecimal = Math.round(decimal * 100);
    return roundedDecimal === 99 || roundedDecimal === 95 || roundedDecimal === 97;
  }

  /**
   * Format price with period display
   */
  formatPriceWithPeriod(
    price: number, 
    billingPeriod: string, 
    customMonths?: number | null,
    locale: string = 'en'
  ): string {
    const formattedPrice = this.formatPrice(price);
    const periodDisplay = this.getPeriodDisplay(billingPeriod, customMonths, locale);
    return `${formattedPrice}${periodDisplay}`;
  }

  /**
   * Get period display string
   */
  private getPeriodDisplay(
    billingPeriod: string, 
    customMonths?: number | null, 
    locale: string = 'en'
  ): string {
    const isSpanish = locale === 'es';
    
    switch (billingPeriod.toLowerCase()) {
      case 'monthly':
        return isSpanish ? '/mes' : '/month';
      case 'three_month':
        return isSpanish ? '/3 meses' : '/3 months';
      case 'six_month':
        return isSpanish ? '/6 meses' : '/6 months';
      case 'annually':
        return isSpanish ? '/año' : '/year';
      case 'other':
        const months = customMonths || 1;
        return isSpanish 
          ? `/${months} ${months === 1 ? 'mes' : 'meses'}`
          : `/${months} ${months === 1 ? 'month' : 'months'}`;
      default:
        return isSpanish ? '/mes' : '/month';
    }
  }
}

/**
 * Enterprise pricing calculator with advanced features
 */
export class PricingCalculator {
  private formatter: PriceFormatter;

  constructor(options?: PriceFormatOptions) {
    this.formatter = new PriceFormatter(options);
  }

  /**
   * Calculate monthly equivalent price
   */
  calculateMonthlyPrice(
    totalPrice: number, 
    billingPeriod: string, 
    customMonths?: number | null
  ): number {
    const config = BILLING_PERIODS[billingPeriod];
    const months = billingPeriod === 'other' ? (customMonths || 1) : config?.months || 1;
    
    return totalPrice / months;
  }

  /**
   * Calculate the best pricing display (lowest per month)
   * Used for subscription cards and comparison
   */
  getBestPricing(variants: Array<{
    price: number;
    billingPeriod: string;
    customBillingPeriodMonths?: number | null;
    title: string;
  }>): {
    lowestMonthlyPrice: number;
    bestVariant: any;
    formattedMonthlyPrice: string;
    originalPrice: number;
    savingsPercentage?: number;
  } {
    let lowestMonthlyPrice = Infinity;
    let bestVariant = null;
    let originalPrice = 0;

    // Find the variant with the lowest monthly price
    for (const variant of variants) {
      const monthlyPrice = this.calculateMonthlyPrice(
        variant.price, 
        variant.billingPeriod, 
        variant.customBillingPeriodMonths
      );

      if (monthlyPrice < lowestMonthlyPrice) {
        lowestMonthlyPrice = monthlyPrice;
        bestVariant = variant;
        originalPrice = variant.price;
      }
    }

    // Calculate savings percentage if applicable
    let savingsPercentage: number | undefined;
    if (variants.length > 1) {
      const monthlyVariant = variants.find(v => v.billingPeriod === 'monthly');
      if (monthlyVariant && bestVariant && bestVariant.billingPeriod !== 'monthly') {
        const monthlyPrice = monthlyVariant.price;
        const savings = monthlyPrice - lowestMonthlyPrice;
        savingsPercentage = Math.round((savings / monthlyPrice) * 100);
      }
    }

    return {
      lowestMonthlyPrice,
      bestVariant,
      formattedMonthlyPrice: this.formatter.formatPrice(lowestMonthlyPrice),
      originalPrice,
      savingsPercentage
    };
  }

  /**
   * Format pricing for subscription cards
   */
  formatCardPricing(
    price: number,
    billingPeriod: string,
    customMonths?: number | null,
    showMonthlyEquivalent: boolean = true
  ): {
    mainPrice: string;
    subtitle: string;
    monthlyEquivalent?: string;
  } {
    const monthlyPrice = this.calculateMonthlyPrice(price, billingPeriod, customMonths);
    const mainPrice = this.formatter.formatPrice(monthlyPrice);
    
    let subtitle = '';
    const formattedTotal = this.formatter.formatPrice(price);
    
    switch (billingPeriod) {
      case 'monthly':
        subtitle = 'per month';
        break;
      case 'three_month':
        subtitle = `${formattedTotal} every 3 months`;
        break;
      case 'six_month':
        subtitle = `${formattedTotal} every 6 months`;
        break;
      case 'annually':
        subtitle = `${formattedTotal} per year`;
        break;
      case 'other':
        const months = customMonths || 1;
        subtitle = `${formattedTotal} every ${months} month${months > 1 ? 's' : ''}`;
        break;
    }

    const result = {
      mainPrice,
      subtitle
    };

    if (showMonthlyEquivalent && billingPeriod !== 'monthly') {
      (result as any).monthlyEquivalent = `${mainPrice}/month`;
    }

    return result;
  }

  /**
   * Calculate discount percentage
   */
  calculateDiscountPercentage(originalPrice: number, discountedPrice: number): number {
    if (originalPrice <= discountedPrice) return 0;
    return Math.round(((originalPrice - discountedPrice) / originalPrice) * 100);
  }

  /**
   * Apply coupon discount
   */
  applyCouponDiscount(
    price: number,
    discountType: 'percentage' | 'fixed',
    discountValue: number
  ): {
    discountedPrice: number;
    discountAmount: number;
    savingsPercentage: number;
  } {
    let discountAmount: number;
    
    if (discountType === 'percentage') {
      discountAmount = (price * discountValue) / 100;
    } else {
      discountAmount = discountValue;
    }
    
    const discountedPrice = Math.max(0, price - discountAmount);
    const actualDiscount = price - discountedPrice;
    const savingsPercentage = price > 0 ? Math.round((actualDiscount / price) * 100) : 0;
    
    return {
      discountedPrice,
      discountAmount: actualDiscount,
      savingsPercentage
    };
  }
}

/**
 * Global pricing instance for consistent formatting across the app
 * Configure this based on your business requirements
 */
export const globalPricing = new PricingCalculator({
  currency: 'USD',
  locale: 'en-US',
  showDecimals: true, // Set to true for advertising prices
  forceDecimals: false // Set to true to always show .00
});

/**
 * Utility functions for common pricing operations
 */
export const PricingUtils = {
  /**
   * Sort variants by monthly price (ascending)
   */
  sortVariantsByMonthlyPrice(variants: Array<{
    price: number;
    billingPeriod: string;
    customBillingPeriodMonths?: number | null;
  }>): typeof variants {
    return variants.sort((a, b) => {
      const monthlyA = globalPricing.calculateMonthlyPrice(
        a.price, 
        a.billingPeriod, 
        a.customBillingPeriodMonths
      );
      const monthlyB = globalPricing.calculateMonthlyPrice(
        b.price, 
        b.billingPeriod, 
        b.customBillingPeriodMonths
      );
      return monthlyA - monthlyB;
    });
  },

  /**
   * Get the most economical variant (best monthly price)
   */
  getMostEconomicalVariant(variants: Array<{
    price: number;
    billingPeriod: string;
    customBillingPeriodMonths?: number | null;
  }>): typeof variants[0] | null {
    if (variants.length === 0) return null;
    
    const sorted = this.sortVariantsByMonthlyPrice(variants);
    return sorted[0];
  },

  /**
   * Check if a price is considered "premium" (for UI styling)
   */
  isPremiumPrice(monthlyPrice: number): boolean {
    return monthlyPrice >= 100; // Adjust threshold as needed
  },

  /**
   * Format price range for multiple variants
   */
  formatPriceRange(variants: Array<{
    price: number;
    billingPeriod: string;
    customBillingPeriodMonths?: number | null;
  }>): string {
    if (variants.length === 0) return '';
    if (variants.length === 1) {
      const monthly = globalPricing.calculateMonthlyPrice(
        variants[0].price, 
        variants[0].billingPeriod, 
        variants[0].customBillingPeriodMonths
      );
      return globalPricing.formatter.formatPrice(monthly);
    }

    const sorted = this.sortVariantsByMonthlyPrice(variants);
    const lowest = globalPricing.calculateMonthlyPrice(
      sorted[0].price, 
      sorted[0].billingPeriod, 
      sorted[0].customBillingPeriodMonths
    );
    const highest = globalPricing.calculateMonthlyPrice(
      sorted[sorted.length - 1].price, 
      sorted[sorted.length - 1].billingPeriod, 
      sorted[sorted.length - 1].customBillingPeriodMonths
    );

    return `${globalPricing.formatter.formatPrice(lowest)} - ${globalPricing.formatter.formatPrice(highest)}`;
  }
};

// Export default instance for convenience
export default globalPricing;