// src/utils/subscriptionHelpers.ts

interface BillingPeriodOptions {
  showMonthlyEquivalent?: boolean;
  includeSlash?: boolean;
  locale?: string;
}

/**
 * Smart price formatting that maintains precision when needed
 * Shows decimals only when the price has meaningful fractional parts
 * @param price The price to format
 * @param currency The currency code
 * @param locale The locale for formatting
 * @returns Formatted price string
 */
export function formatPriceDisplay(
  price: number,
  currency: string = 'USD',
  locale: string = 'en-US'
): string {
  // Check if price has meaningful decimal places
  const hasDecimals = price % 1 !== 0;
  
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: hasDecimals ? 2 : 0,
    maximumFractionDigits: 2,
  }).format(price);
}

/**
 * Format price for display based on billing period
 * @param price The base price of the subscription
 * @param billingPeriod The billing period from Sanity (monthly, three_month, six_month, annually, other)
 * @param customBillingPeriodMonths Custom billing period in months (if billingPeriod is 'other')
 * @param options Formatting options
 * @returns Formatted price string
 */
export function formatPriceWithBillingPeriod(
  price: number,
  billingPeriod: string,
  customBillingPeriodMonths?: number | null,
  options: BillingPeriodOptions = {}
): string {
  const { 
    showMonthlyEquivalent = true, 
    includeSlash = true,
    locale = 'en-US'
  } = options;

  // Format the base price using smart formatting
  const formattedPrice = formatPriceDisplay(price, 'USD', locale);
  
  // Get the period display
  let periodDisplay = '';
  let monthlyPrice = price;
  
  // Calculate monthly price if needed
  switch (billingPeriod.toLowerCase()) {
    case 'monthly':
      periodDisplay = locale === 'es' ? '/mes' : '/month';
      break;
    case 'three_month':
      periodDisplay = locale === 'es' ? '/3 meses' : '/3 months';
      monthlyPrice = price / 3;
      break;
    case 'six_month':
      periodDisplay = locale === 'es' ? '/6 meses' : '/6 months';
      monthlyPrice = price / 6;
      break;
    case 'annually':
      periodDisplay = locale === 'es' ? '/año' : '/year';
      monthlyPrice = price / 12;
      break;
    case 'other':
      // Handle custom billing period
      const months = customBillingPeriodMonths || 1;
      periodDisplay = locale === 'es' 
        ? `/${months} ${months === 1 ? 'mes' : 'meses'}`
        : `/${months} ${months === 1 ? 'month' : 'months'}`;
      monthlyPrice = price / months;
      break;
    default:
      periodDisplay = locale === 'es' ? '/mes' : '/month';
  }
  
  // Format the monthly equivalent price using smart formatting
  const formattedMonthlyPrice = formatPriceDisplay(monthlyPrice, 'USD', locale);
  
  // Build the final price display
  let priceDisplay = formattedPrice;
  
  if (includeSlash) {
    priceDisplay += periodDisplay;
  } else {
    priceDisplay += ' ' + periodDisplay.substring(1); // Remove the leading slash
  }
  
  // Add monthly equivalent for non-monthly billing periods
  if (showMonthlyEquivalent && billingPeriod.toLowerCase() !== 'monthly') {
    const monthlyText = locale === 'es' ? 'al mes' : 'per month';
    priceDisplay += ` (${formattedMonthlyPrice} ${monthlyText})`;
  }
  
  return priceDisplay;
}

/**
 * Get a simple display string for billing period
 * @param billingPeriod The billing period from Sanity
 * @param customBillingPeriodMonths Custom billing period in months (if billingPeriod is 'other')
 * @param locale The locale for language-specific output
 * @returns Formatted billing period display
 */
export function getBillingPeriodDisplay(
  billingPeriod: string,
  customBillingPeriodMonths?: number | null,
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
      const months = customBillingPeriodMonths || 1;
      return isSpanish 
        ? `/${months} ${months === 1 ? 'mes' : 'meses'}`
        : `/${months} ${months === 1 ? 'month' : 'months'}`;
    default:
      return isSpanish ? '/mes' : '/month';
  }
}

/**
 * Calculate the monthly price equivalent of a subscription
 * @param price The full price of the subscription
 * @param billingPeriod The billing period type
 * @param customBillingPeriodMonths Optional custom billing period length
 * @returns The monthly price equivalent
 */
export function calculateMonthlyPrice(
  price: number,
  billingPeriod: string,
  customBillingPeriodMonths?: number | null
): number {
  switch (billingPeriod.toLowerCase()) {
    case 'monthly':
      return price;
    case 'three_month':
      return price / 3;
    case 'six_month':
      return price / 6;
    case 'annually':
      return price / 12;
    case 'other':
      const months = customBillingPeriodMonths || 1;
      return price / months;
    default:
      return price;
  }
}

/**
 * Get the number of months in a billing period
 * @param billingPeriod The billing period type
 * @param customBillingPeriodMonths Optional custom billing period length
 * @returns The number of months in the billing period
 */
export function getMonthsInBillingPeriod(
  billingPeriod: string,
  customBillingPeriodMonths?: number | null
): number {
  switch (billingPeriod.toLowerCase()) {
    case 'monthly':
      return 1;
    case 'three_month':
      return 3;
    case 'six_month':
      return 6;
    case 'annually':
      return 12;
    case 'other':
      return customBillingPeriodMonths || 1;
    default:
      return 1;
  }
}