// Centralized Currency & Price Formatting Utility

// Change this value to 'INR' to automatically scale and render prices in Indian Rupees
// Supported values: 'USD' | 'INR'
export type CurrencyType = 'USD' | 'INR';

export const CURRENT_CURRENCY: CurrencyType = 'INR';

// Conversion rate from USD base to INR
export const CONVERSION_RATE = 80;

// Format price based on current currency configuration
export const formatPrice = (usdPrice: number): string => {
  if (CURRENT_CURRENCY === 'INR') {
    const inrValue = Math.round(usdPrice * CONVERSION_RATE);
    return `₹${inrValue.toLocaleString('en-IN')}`;
  }
  return `$${usdPrice.toLocaleString('en-US')}`;
};

// Formats direct values without converting (if some are already converted)
export const formatSymbol = (): string => {
  return CURRENT_CURRENCY === 'INR' ? '₹' : '$';
};
