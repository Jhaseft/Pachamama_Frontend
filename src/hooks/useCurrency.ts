import { useEffect, useState } from 'react';
import { apiGetConfig } from '../api/userClient';
import { useAuth } from '../context/AuthContext';
import {
  CurrencyCode,
  CurrencyInfo,
  DEFAULT_RATES,
  RatesMap,
  formatAmount,
  getCurrencyByPhone,
} from '../utils/currency';

export function useCurrency() {
  const { user } = useAuth();
  const [rates, setRates] = useState<RatesMap>(DEFAULT_RATES);

  useEffect(() => {
    apiGetConfig()
      .then((cfg) => setRates(cfg.rates ?? DEFAULT_RATES))
      .catch(() => {});
  }, []);

  const code: CurrencyCode = getCurrencyByPhone(user?.phoneNumber);
  const currency: CurrencyInfo = rates[code] ?? DEFAULT_RATES[code];
  const usd: CurrencyInfo = rates.USD ?? DEFAULT_RATES.USD;

  return {
    code,
    currency,
    rates,
    symbol: currency.symbol,
    rate: currency.rate,
    name: currency.name,
    isPeru: code === 'PEN',
    format: (credits: number) => formatAmount(credits, currency),
    formatUSD: (credits: number) => formatAmount(credits, usd),
  };
}
