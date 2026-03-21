// src/api/paymentMethods.ts
import apiClient from './client';
import { PaymentMethod } from '@/src/types/paymentMethods'; // Importa la interfaz

export const apiGetPaymentMethods = async (): Promise<PaymentMethod[]> => {
    try {
        const response = await apiClient.get<PaymentMethod[]>('/users/payment-methods');
        return response.data;
    } catch (error: any) {

        throw new Error(error?.response?.data?.message || 'No se pudieron cargar los métodos de pago');
    }
};