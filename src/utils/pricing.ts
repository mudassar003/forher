// src/utils/pricing.ts
// Enterprise-level pricing utilities with monthly display price support

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
  formatPrice(price: number | null | undefined, options?: PriceFormatOptions): string {
    if (price === null || price === undefined || isNaN(price)) {
      return '$0';
    }

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
    price: number | null | undefined, 
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
  public formatter: PriceFormatter;

  constructor(options?: PriceFormatOptions) {
    this.formatter = new PriceFormatter(options);
  }

  /**
   * Calculate monthly equivalent price
   * Returns the monthly display price if available, otherwise calculates it
   */
  calculateMonthlyPrice(
    totalPrice: number | null | undefined, 
    billingPeriod: string, 
    customMonths?: number | null,
    monthlyDisplayPrice?: number | null
  ): number {
    // If monthlyDisplayPrice is provided, use it
    if (monthlyDisplayPrice !== null && monthlyDisplayPrice !== undefined && !isNaN(monthlyDisplayPrice)) {
      return monthlyDisplayPrice;
    }

    // Otherwise calculate from total price
    if (totalPrice === null || totalPrice === undefined || isNaN(totalPrice)) {
      return 0;
    }

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
    monthlyDisplayPrice?: number | null;
    title: string;
    isDefault?: boolean;
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

    // First check for default variant
    const defaultVariant = variants.find(v => v.isDefault);
    if (defaultVariant) {
      bestVariant = defaultVariant;
      lowestMonthlyPrice = this.calculateMonthlyPrice(
        defaultVariant.price, 
        defaultVariant.billingPeriod, 
        defaultVariant.customBillingPeriodMonths,
        defaultVariant.monthlyDisplayPrice
      );
      originalPrice = defaultVariant.price;
    } else {
      // Find the variant with the lowest monthly price
      for (const variant of variants) {
        const monthlyPrice = this.calculateMonthlyPrice(
          variant.price, 
          variant.billingPeriod, 
          variant.customBillingPeriodMonths,
          variant.monthlyDisplayPrice
        );

        if (monthlyPrice < lowestMonthlyPrice) {
          lowestMonthlyPrice = monthlyPrice;
          bestVariant = variant;
          originalPrice = variant.price;
        }
      }
    }

    // Calculate savings percentage if applicable
    let savingsPercentage: number | undefined;
    if (variants.length > 1) {
      const monthlyVariant = variants.find(v => v.billingPeriod === 'monthly');
      if (monthlyVariant && bestVariant && bestVariant.billingPeriod !== 'monthly') {
        const monthlyPrice = this.calculateMonthlyPrice(
          monthlyVariant.price, 
          monthlyVariant.billingPeriod, 
          monthlyVariant.customBillingPeriodMonths,
          monthlyVariant.monthlyDisplayPrice
        );
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
   * Calculate discount percentage
   */
  calculateDiscountPercentage(originalPrice: number, discountedPrice: number): number {
    if (originalPrice <= discountedPrice) return 0;
    return Math.round(((originalPrice - discountedPrice) / originalPrice) * 100);
  }

  /**
   * Format pricing for subscription cards
   */
  formatCardPricing(
    price: number,
    billingPeriod: string,
    customMonths?: number | null,
    monthlyDisplayPrice?: number | null,
    showMonthlyEquivalent: boolean = true
  ): {
    mainPrice: string;
    subtitle: string;
    monthlyEquivalent?: string;
  } {
    const monthlyPrice = this.calculateMonthlyPrice(
      price, 
      billingPeriod, 
      customMonths,
      monthlyDisplayPrice
    );
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
      default:
        subtitle = `${formattedTotal} total`;
    }

    return {
      mainPrice,
      subtitle,
      monthlyEquivalent: showMonthlyEquivalent ? `${mainPrice}/month` : undefined
    };
  }
}

/**
 * Global pricing instance for consistent formatting across the app
 */
export const globalPricing = new PricingCalculator({
  showDecimals: true,
  forceDecimals: false,
  currency: 'USD',
  locale: 'en-US'
});

/**
 * Utility functions for pricing operations
 */
export class PricingUtils {
  /**
   * Sort variants by monthly price (lowest first)
   */
  static sortVariantsByMonthlyPrice(
    variants: Array<{
      price: number;
      billingPeriod: string;
      customBillingPeriodMonths?: number | null;
      monthlyDisplayPrice?: number | null;
    }>
  ): typeof variants {
    return variants.sort((a, b) => {
      const monthlyA = globalPricing.calculateMonthlyPrice(
        a.price, 
        a.billingPeriod, 
        a.customBillingPeriodMonths,
        a.monthlyDisplayPrice
      );
      const monthlyB = globalPricing.calculateMonthlyPrice(
        b.price, 
        b.billingPeriod, 
        b.customBillingPeriodMonths,
        b.monthlyDisplayPrice
      );
      
      return monthlyA - monthlyB;
    });
  }

  /**
   * Find the best value variant (lowest monthly price)
   */
  static findBestValueVariant(
    variants: Array<{
      price: number;
      billingPeriod: string;
      customBillingPeriodMonths?: number | null;
      monthlyDisplayPrice?: number | null;
      isDefault?: boolean;
    }>
  ): typeof variants[0] | null {
    if (variants.length === 0) return null;

    // First check for default variant
    const defaultVariant = variants.find(v => v.isDefault);
    if (defaultVariant) return defaultVariant;

    // Otherwise find lowest monthly price
    const sorted = this.sortVariantsByMonthlyPrice(variants);
    return sorted[0];
  }
}

export default globalPricing;