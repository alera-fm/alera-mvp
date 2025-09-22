import { NextRequest, NextResponse } from 'next/server';
import { getPricingForCountry, isCountrySupported } from '@/lib/regional-pricing';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const country = searchParams.get('country') || 'US';
    
    const pricing = getPricingForCountry(country);
    const isSupported = isCountrySupported(country);
    
    return NextResponse.json({
      pricing,
      country,
      isSupported,
      supportedCountries: ['IN', 'ZA', 'TR', 'US']
    });
  } catch (error) {
    console.error('Error fetching regional pricing:', error);
    return NextResponse.json(
      { error: 'Failed to fetch pricing' },
      { status: 500 }
    );
  }
}
