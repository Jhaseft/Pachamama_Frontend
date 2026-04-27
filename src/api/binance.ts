import apiClient from './client';

function parseApiError(error: any, fallback: string) {
  const rawMessage = error?.response?.data?.message ?? error?.message;
  if (Array.isArray(rawMessage)) return rawMessage.join(', ');
  if (typeof rawMessage === 'string' && rawMessage.trim().length > 0) return rawMessage;
  return fallback;
}

export type BinanceIntentStatus = 'PENDING' | 'CONFIRMED' | 'REJECTED' | 'EXPIRED';

export interface BinanceNetworkOption {
  network: string;
  label: string;
  wallet: string;
}

export interface BinanceIntent {
  intentId: string;
  walletAddress: string;
  network: string;
  coin: string;
  amount: string;
  credits: number;
  packageName: string;
  expiresAt: string;
  status: BinanceIntentStatus;
  txid: string | null;
  failureReason: string | null;
  tolerancePercent: number;
  networks: BinanceNetworkOption[];
  defaultNetwork: string | null;
}

export interface BinanceConfirmResponse {
  status: 'CONFIRMED';
  credits: number;
  newBalance?: string;
  message: string;
}

export const apiBinanceCreateIntent = async (
  packageId: string,
): Promise<BinanceIntent> => {
  try {
    const response = await apiClient.post('/binance/intent', { packageId });
    return response.data;
  } catch (error: any) {
    throw new Error(parseApiError(error, 'No se pudo iniciar el pago con Binance'));
  }
};

export const apiBinanceGetIntent = async (
  intentId: string,
): Promise<BinanceIntent> => {
  try {
    const response = await apiClient.get(`/binance/intent/${intentId}`);
    return response.data;
  } catch (error: any) {
    throw new Error(parseApiError(error, 'No se pudo consultar el estado del pago'));
  }
};

export const apiBinanceConfirm = async (
  intentId: string,
  txid: string,
): Promise<BinanceConfirmResponse> => {
  try {
    const response = await apiClient.post('/binance/confirm', { intentId, txid });
    return response.data;
  } catch (error: any) {
    throw new Error(parseApiError(error, 'No se pudo confirmar el pago'));
  }
};
