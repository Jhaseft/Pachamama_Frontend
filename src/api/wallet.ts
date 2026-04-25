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

export interface Bank {
  id: number;
  name: string;
  logoUrl: string;
}

export type WithdrawalMethodType = 'BCP' | 'OTHER_BANK' | 'PAYPAL' | 'BYBIT' | 'BINANCE';

export interface BankAccount {
  id: string;
  type: WithdrawalMethodType;
  bankId: number | null;
  bankName: string | null;
  bankLogoUrl: string | null;
  accountNumber: string | null;
  paypalEmail: string | null;
  accountHolderName?: string | null;
}

export interface WithdrawalRequest {
  id: string;
  credits: number;
  payoutAmount: number;
  payoutCurrency: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  methodType: WithdrawalMethodType;
  bankName: string | null;
  accountNumber: string | null;
  paypalEmail: string | null;
  rejectionReason: string | null;
  receiptUrl: string | null;
  createdAt: string;
}

export const apiGetMyEarnings = async (): Promise<EarningsData> => {
  const response = await apiClient.get('/wallet/me/earnings');
  return response.data;
};

export const apiGetBanks = async (): Promise<Bank[]> => {
  const response = await apiClient.get('/wallet/banks');
  return response.data;
};

export const apiGetBankAccounts = async (): Promise<BankAccount[]> => {
  const response = await apiClient.get('/wallet/me/bank-accounts');
  return response.data;
};

export const apiAddBankAccount = async (data: {
  type: WithdrawalMethodType;
  bankId?: number;
  accountNumber?: string;
  paypalEmail?: string;
  accountHolderName?: string;
}): Promise<BankAccount> => {
  const response = await apiClient.post('/wallet/me/bank-accounts', data);
  return response.data;
};

export const apiDeleteBankAccount = async (id: string): Promise<void> => {
  await apiClient.delete(`/wallet/me/bank-accounts/${id}`);
};

export const apiCreateWithdrawalRequest = async (data: {
  credits: number;
  bankAccountId: string;
}): Promise<WithdrawalRequest> => {
  const response = await apiClient.post('/wallet/me/withdrawal-request', data);
  return response.data;
};

export const apiGetWithdrawalRequests = async (): Promise<WithdrawalRequest[]> => {
  const response = await apiClient.get('/wallet/me/withdrawal-requests');
  return response.data;
};
