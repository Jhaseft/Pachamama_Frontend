import apiClient from './client';

export interface EarningTransaction {
  id: string;
  service: string;
  clientName: string;
  amount: number;
  createdAt: string;
}

export interface EarningsData {
  balance: number;
  today: number;
  thisWeek: number;
  total: number;
  transactions: EarningTransaction[];
}

export const apiGetMyEarnings = async (): Promise<EarningsData> => {
  const response = await apiClient.get('/wallet/me/earnings');
  return response.data;
};
