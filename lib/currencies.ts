/**
 * Comprehensive list of world currencies
 * ISO 4217 currency codes with symbols and names
 */

export interface Currency {
  code: string
  name: string
  symbol: string
  region: string
}

export const CURRENCIES: Currency[] = [
  // Popular/Most Used
  { code: 'USD', name: 'US Dollar', symbol: '$', region: 'Americas' },
  { code: 'EUR', name: 'Euro', symbol: '€', region: 'Europe' },
  { code: 'GBP', name: 'British Pound', symbol: '£', region: 'Europe' },
  { code: 'AED', name: 'UAE Dirham', symbol: 'د.إ', region: 'Middle East' },
  { code: 'BDT', name: 'Bangladeshi Taka', symbol: '৳', region: 'Asia' },
  { code: 'INR', name: 'Indian Rupee', symbol: '₹', region: 'Asia' },
  { code: 'AMD', name: 'Armenian Dram', symbol: '֏', region: 'Asia' },
  
  // Rest of World
  { code: 'AUD', name: 'Australian Dollar', symbol: 'A$', region: 'Oceania' },
  { code: 'CAD', name: 'Canadian Dollar', symbol: 'C$', region: 'Americas' },
  { code: 'CHF', name: 'Swiss Franc', symbol: 'Fr', region: 'Europe' },
  { code: 'CNY', name: 'Chinese Yuan', symbol: '¥', region: 'Asia' },
  { code: 'JPY', name: 'Japanese Yen', symbol: '¥', region: 'Asia' },
  { code: 'KRW', name: 'South Korean Won', symbol: '₩', region: 'Asia' },
  { code: 'SAR', name: 'Saudi Riyal', symbol: 'ر.س', region: 'Middle East' },
  { code: 'SGD', name: 'Singapore Dollar', symbol: 'S$', region: 'Asia' },
  { code: 'THB', name: 'Thai Baht', symbol: '฿', region: 'Asia' },
  { code: 'TRY', name: 'Turkish Lira', symbol: '₺', region: 'Middle East' },
  
  // Africa
  { code: 'ZAR', name: 'South African Rand', symbol: 'R', region: 'Africa' },
  { code: 'EGP', name: 'Egyptian Pound', symbol: '£', region: 'Africa' },
  { code: 'NGN', name: 'Nigerian Naira', symbol: '₦', region: 'Africa' },
  { code: 'KES', name: 'Kenyan Shilling', symbol: 'KSh', region: 'Africa' },
  
  // Middle East
  { code: 'BHD', name: 'Bahraini Dinar', symbol: '.د.ب', region: 'Middle East' },
  { code: 'KWD', name: 'Kuwaiti Dinar', symbol: 'د.ك', region: 'Middle East' },
  { code: 'OMR', name: 'Omani Rial', symbol: 'ر.ع.', region: 'Middle East' },
  { code: 'QAR', name: 'Qatari Riyal', symbol: 'ر.ق', region: 'Middle East' },
  { code: 'ILS', name: 'Israeli Shekel', symbol: '₪', region: 'Middle East' },
  { code: 'JOD', name: 'Jordanian Dinar', symbol: 'د.ا', region: 'Middle East' },
  { code: 'LBP', name: 'Lebanese Pound', symbol: 'ل.ل', region: 'Middle East' },
  
  // Asia
  { code: 'PKR', name: 'Pakistani Rupee', symbol: '₨', region: 'Asia' },
  { code: 'LKR', name: 'Sri Lankan Rupee', symbol: 'Rs', region: 'Asia' },
  { code: 'NPR', name: 'Nepalese Rupee', symbol: 'रू', region: 'Asia' },
  { code: 'MYR', name: 'Malaysian Ringgit', symbol: 'RM', region: 'Asia' },
  { code: 'IDR', name: 'Indonesian Rupiah', symbol: 'Rp', region: 'Asia' },
  { code: 'PHP', name: 'Philippine Peso', symbol: '₱', region: 'Asia' },
  { code: 'VND', name: 'Vietnamese Dong', symbol: '₫', region: 'Asia' },
  { code: 'HKD', name: 'Hong Kong Dollar', symbol: 'HK$', region: 'Asia' },
  { code: 'TWD', name: 'Taiwan Dollar', symbol: 'NT$', region: 'Asia' },
  { code: 'KZT', name: 'Kazakhstani Tenge', symbol: '₸', region: 'Asia' },
  { code: 'AZN', name: 'Azerbaijani Manat', symbol: '₼', region: 'Asia' },
  { code: 'GEL', name: 'Georgian Lari', symbol: '₾', region: 'Asia' },
  { code: 'UZS', name: 'Uzbekistani Som', symbol: 'сўм', region: 'Asia' },
  
  // Europe
  { code: 'DKK', name: 'Danish Krone', symbol: 'kr', region: 'Europe' },
  { code: 'SEK', name: 'Swedish Krona', symbol: 'kr', region: 'Europe' },
  { code: 'NOK', name: 'Norwegian Krone', symbol: 'kr', region: 'Europe' },
  { code: 'PLN', name: 'Polish Zloty', symbol: 'zł', region: 'Europe' },
  { code: 'CZK', name: 'Czech Koruna', symbol: 'Kč', region: 'Europe' },
  { code: 'HUF', name: 'Hungarian Forint', symbol: 'Ft', region: 'Europe' },
  { code: 'RON', name: 'Romanian Leu', symbol: 'lei', region: 'Europe' },
  { code: 'BGN', name: 'Bulgarian Lev', symbol: 'лв', region: 'Europe' },
  { code: 'HRK', name: 'Croatian Kuna', symbol: 'kn', region: 'Europe' },
  { code: 'RUB', name: 'Russian Ruble', symbol: '₽', region: 'Europe' },
  { code: 'UAH', name: 'Ukrainian Hryvnia', symbol: '₴', region: 'Europe' },
  
  // Americas
  { code: 'MXN', name: 'Mexican Peso', symbol: '$', region: 'Americas' },
  { code: 'BRL', name: 'Brazilian Real', symbol: 'R$', region: 'Americas' },
  { code: 'ARS', name: 'Argentine Peso', symbol: '$', region: 'Americas' },
  { code: 'CLP', name: 'Chilean Peso', symbol: '$', region: 'Americas' },
  { code: 'COP', name: 'Colombian Peso', symbol: '$', region: 'Americas' },
  { code: 'PEN', name: 'Peruvian Sol', symbol: 'S/', region: 'Americas' },
  { code: 'VES', name: 'Venezuelan Bolívar', symbol: 'Bs.', region: 'Americas' },
  { code: 'JMD', name: 'Jamaican Dollar', symbol: 'J$', region: 'Americas' },
  
  // Oceania
  { code: 'NZD', name: 'New Zealand Dollar', symbol: 'NZ$', region: 'Oceania' },
]

export const DEFAULT_CURRENCY = 'USD'

export const POPULAR_CURRENCIES = ['USD', 'EUR', 'GBP', 'AED', 'BDT', 'INR', 'AMD']

export function getCurrencyByCode(code: string): Currency | undefined {
  return CURRENCIES.find(c => c.code === code)
}

export function formatCurrencyValue(value: number, currencyCode: string): string {
  const currency = getCurrencyByCode(currencyCode)
  if (!currency) return `${value.toFixed(2)} ${currencyCode}`
  return `${currency.symbol}${value.toFixed(2)}`
}
