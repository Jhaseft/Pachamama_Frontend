import apiClient from './client';
import { WithdrawalRequestsResponse } from '../types/withdrawalRequest';

function parseApiError(error: any, fallback: string) {
    const rawMessage = error?.response?.data?.message ?? error?.message;
    if (Array.isArray(rawMessage)) return rawMessage.join(', ');
    if (typeof rawMessage === 'string' && rawMessage.trim().length > 0) return rawMessage;
    return fallback;
}

// HISTORIAL DE PAGOS A ANFITRIONA (RECHAZADO Y APROBADO)
export const apiGetWithdrawalRequestsHistory = async (search?: string, cursor?: string): Promise<WithdrawalRequestsResponse> => {
    try {
        const params: any = { limit: 10 };

        if (search && search.trim() !== '') {
            params.search = search;
        }

        if (cursor && cursor !== 'null' && cursor !== 'undefined' && cursor.length > 10) {
            params.cursor = cursor;
        }

        const response = await apiClient.get('/admin/anfitrionas/payment/history', { params });
        console.log('HISTORY DATA:', JSON.stringify(response.data.data[0]?.anfitriona));
        return response.data;
    } catch (error: any) {
        throw new Error(parseApiError(error, 'Error al obtener datos para el historial de pagos'));
    }
};
