"use client";

import { useState, useEffect } from 'react';
import { getPricingForCountry, formatCurrency, calculateYearlySavings, PricingData, isCountrySupported } from '@/lib/regional-pricing';

interface UseRegionalPricingReturn {
  pricing: PricingData;
  country: string;
  isLoading: boolean;
  isSupported: boolean;
  formatPrice: (amount: number, currency: string) => string;
  getYearlySavings: (tier: 'plus' | 'pro') => number;
}

export function useRegionalPricing(): UseRegionalPricingReturn {
  const [pricing, setPricing] = useState<PricingData | null>(null);
  const [country, setCountry] = useState<string>('US');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const detectCountry = async () => {
      try {
        // Try to get country from browser's timezone
        const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
        let detectedCountry = 'US'; // Default fallback

        // Map timezones to countries
        if (timezone.includes('Asia/Kolkata') || timezone.includes('Asia/Calcutta')) {
          detectedCountry = 'IN';
        } else if (timezone.includes('Africa/Johannesburg') || timezone.includes('Africa/Cape_Town')) {
          detectedCountry = 'ZA';
        } else if (timezone.includes('Europe/Istanbul') || timezone.includes('Asia/Istanbul')) {
          detectedCountry = 'TR';
        }
        

        // Try IP-based geolocation as fallback (only if timezone detection didn't work)
        if (detectedCountry === 'US') {
          try {
            const response = await fetch('https://ipapi.co/json/', {
              mode: 'cors',
              headers: {
                'Accept': 'application/json',
              }
            });
            
            if (response.ok) {
              const data = await response.json();
              if (data.country_code && ['IN', 'ZA', 'TR'].includes(data.country_code)) {
                detectedCountry = data.country_code;
              }
            }
          } catch (error) {
            console.log('IP geolocation failed, using timezone detection result');
          }
        }

        setCountry(detectedCountry);
        setPricing(getPricingForCountry(detectedCountry));
      } catch (error) {
        console.error('Country detection failed:', error);
        // Fallback to US pricing if everything fails
        setCountry('US');
        setPricing(getPricingForCountry('US'));
      } finally {
        setIsLoading(false);
      }
    };

    detectCountry();
  }, []);

  const formatPrice = (amount: number, currency: string): string => {
    return formatCurrency(amount, currency);
  };

  const getYearlySavings = (tier: 'plus' | 'pro'): number => {
    if (!pricing) return 0;
    const monthlyAmount = pricing[tier].monthly.amount;
    const yearlyAmount = pricing[tier].yearly.amount;
    return calculateYearlySavings(monthlyAmount, yearlyAmount);
  };

  return {
    pricing: pricing || getPricingForCountry('US'),
    country,
    isLoading,
    isSupported: isCountrySupported(country),
    formatPrice,
    getYearlySavings
  };
}
