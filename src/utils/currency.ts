export type CurrencyCode = 'PEN' | 'USD';

export type CurrencyInfo = {
  code: CurrencyCode;
  symbol: string;
  name: string;
  rate: number;
};

export type RatesMap = Record<CurrencyCode, CurrencyInfo>;

export const DEFAULT_RATES: RatesMap = {
  PEN: { code: 'PEN', symbol: 'S/', name: 'Soles', rate: 1 },
  USD: { code: 'USD', symbol: 'US$', name: 'Dólares', rate: 0.25 },
};

const PERU_DIAL_CODE = '51';

export function getCurrencyByPhone(phoneNumber?: string | null): CurrencyCode {
  if (!phoneNumber) return 'USD';
  const digits = phoneNumber.replace(/\D/g, '');
  return digits.startsWith(PERU_DIAL_CODE) ? 'PEN' : 'USD';
}

export function formatAmount(credits: number, currency: CurrencyInfo): string {
  const value = (credits * currency.rate).toFixed(2);
  return `${currency.symbol} ${value}`;
}
