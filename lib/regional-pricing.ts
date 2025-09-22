// Regional pricing configuration and utilities
export interface RegionalPricing {
  country: string;
  currency: string;
  plus: {
    monthly: { amount: number; priceId: string };
    yearly: { amount: number; priceId: string };
  };
  pro: {
    monthly: { amount: number; priceId: string };
    yearly: { amount: number; priceId: string };
  };
}

export interface PricingData {
  plus: {
    monthly: { amount: number; currency: string; priceId: string };
    yearly: { amount: number; currency: string; priceId: string };
  };
  pro: {
    monthly: { amount: number; currency: string; priceId: string };
    yearly: { amount: number; currency: string; priceId: string };
  };
}

// Regional pricing configuration
export const REGIONAL_PRICING: Record<string, RegionalPricing> = {
  IN: {
    country: 'India',
    currency: 'INR',
    plus: {
      monthly: { amount: 249, priceId: process.env.STRIPE_PLUS_INDIA_MONTHLY_PRICE_ID || process.env.STRIPE_PLUS_PRICE_ID || '' },
      yearly: { amount: 2499, priceId: process.env.STRIPE_PLUS_INDIA_YEARLY_PRICE_ID || process.env.STRIPE_PLUS_YEARLY_PRICE_ID || '' }
    },
    pro: {
      monthly: { amount: 499, priceId: process.env.STRIPE_PRO_INDIA_MONTHLY_PRICE_ID || process.env.STRIPE_PRO_PRICE_ID || '' },
      yearly: { amount: 4999, priceId: process.env.STRIPE_PRO_INDIA_YEARLY_PRICE_ID || process.env.STRIPE_PRO_YEARLY_PRICE_ID || '' }
    }
  },
  ZA: {
    country: 'South Africa',
    currency: 'ZAR',
    plus: {
      monthly: { amount: 79, priceId: process.env.STRIPE_PLUS_SA_MONTHLY_PRICE_ID || process.env.STRIPE_PLUS_PRICE_ID || '' },
      yearly: { amount: 799, priceId: process.env.STRIPE_PLUS_SA_YEARLY_PRICE_ID || process.env.STRIPE_PLUS_YEARLY_PRICE_ID || '' }
    },
    pro: {
      monthly: { amount: 149, priceId: process.env.STRIPE_PRO_SA_MONTHLY_PRICE_ID || process.env.STRIPE_PRO_PRICE_ID || '' },
      yearly: { amount: 1499, priceId: process.env.STRIPE_PRO_SA_YEARLY_PRICE_ID || process.env.STRIPE_PRO_YEARLY_PRICE_ID || '' }
    }
  },
  TR: {
    country: 'Turkey',
    currency: 'TRY',
    plus: {
      monthly: { amount: 99.99, priceId: process.env.STRIPE_PLUS_TURKEY_MONTHLY_PRICE_ID || process.env.STRIPE_PLUS_PRICE_ID || '' },
      yearly: { amount: 999.99, priceId: process.env.STRIPE_PLUS_TURKEY_YEARLY_PRICE_ID || process.env.STRIPE_PLUS_YEARLY_PRICE_ID || '' }
    },
    pro: {
      monthly: { amount: 199.99, priceId: process.env.STRIPE_PRO_TURKEY_MONTHLY_PRICE_ID || process.env.STRIPE_PRO_PRICE_ID || '' },
      yearly: { amount: 1999.99, priceId: process.env.STRIPE_PRO_TURKEY_YEARLY_PRICE_ID || process.env.STRIPE_PRO_YEARLY_PRICE_ID || '' }
    }
  }
};

// Default USD pricing (fallback)
export const DEFAULT_PRICING: PricingData = {
  plus: {
    monthly: { amount: 4.99, currency: 'USD', priceId: process.env.STRIPE_PLUS_PRICE_ID || '' },
    yearly: { amount: 49.99, currency: 'USD', priceId: process.env.STRIPE_PLUS_YEARLY_PRICE_ID || '' }
  },
  pro: {
    monthly: { amount: 14.99, currency: 'USD', priceId: process.env.STRIPE_PRO_PRICE_ID || '' },
    yearly: { amount: 149.99, currency: 'USD', priceId: process.env.STRIPE_PRO_YEARLY_PRICE_ID || '' }
  }
};

// Get pricing for a specific country
export function getPricingForCountry(countryCode: string): PricingData {
  const regionalPricing = REGIONAL_PRICING[countryCode.toUpperCase()];
  
  if (!regionalPricing) {
    return DEFAULT_PRICING;
  }

  return {
    plus: {
      monthly: {
        amount: regionalPricing.plus.monthly.amount,
        currency: regionalPricing.currency,
        priceId: regionalPricing.plus.monthly.priceId
      },
      yearly: {
        amount: regionalPricing.plus.yearly.amount,
        currency: regionalPricing.currency,
        priceId: regionalPricing.plus.yearly.priceId
      }
    },
    pro: {
      monthly: {
        amount: regionalPricing.pro.monthly.amount,
        currency: regionalPricing.currency,
        priceId: regionalPricing.pro.monthly.priceId
      },
      yearly: {
        amount: regionalPricing.pro.yearly.amount,
        currency: regionalPricing.currency,
        priceId: regionalPricing.pro.yearly.priceId
      }
    }
  };
}

// Format currency for display
export function formatCurrency(amount: number, currency: string): string {
  const formatters: Record<string, Intl.NumberFormat> = {
    USD: new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }),
    INR: new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }),
    ZAR: new Intl.NumberFormat('en-ZA', { style: 'currency', currency: 'ZAR' }),
    TRY: new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' })
  };

  const formatter = formatters[currency] || formatters.USD;
  return formatter.format(amount);
}

// Calculate yearly savings percentage
export function calculateYearlySavings(monthlyAmount: number, yearlyAmount: number): number {
  const monthlyTotal = monthlyAmount * 12;
  const savings = monthlyTotal - yearlyAmount;
  return Math.round((savings / monthlyTotal) * 100);
}

// Get supported countries
export function getSupportedCountries(): string[] {
  return Object.keys(REGIONAL_PRICING);
}

// Check if country is supported
export function isCountrySupported(countryCode: string): boolean {
  return countryCode.toUpperCase() in REGIONAL_PRICING;
}
