import apiClient from './client';
import { WithdrawalRequestsResponse } from '../types/withdrawalRequest';

function parseApiError(error: any, fallback: string) {
    const rawMessage = error?.response?.data?.message ?? error?.message;
    if (Array.isArray(rawMessage)) return rawMessage.join(', ');
    if (typeof rawMessage === 'string' && rawMessage.trim().length > 0) return rawMessage;
    return fallback;
}

// LISTAR Y BUSCAR SOLICITUDES DE RETIRO (Lógica igual a apiGetAllClients)
export const apiGetWithdrawalRequests = async (search?: string, cursor?: string): Promise<WithdrawalRequestsResponse> => {
    try {
        const params: any = { limit: 10 };

        if (search && search.trim() !== '') {
            params.search = search;
        }

        if (cursor && cursor !== 'null' && cursor !== 'undefined' && cursor.length > 10) {
            params.cursor = cursor;
        }

        const response = await apiClient.get('/admin/anfitrionas/list/withdrawal-requests', { params });
        
        return response.data;
    } catch (error: any) {
        throw new Error(parseApiError(error, 'Error al obtener solicitudes de retiro'));
    }
};

//CANTIDAD DE SOLICITUDES DE PAGOS PENDIENTES
export const apiCountPendingWithdrawalRequests = async (): Promise<number> => {
    try {
        const response = await apiClient.get('/admin/anfitrionas/count/pending-withdrawal-requests');
        return response.data.count ?? response.data;
    } catch (error: any) {
        throw new Error(parseApiError(error, 'Error al obtener cantidad de solicitudes pendientes'));
    }
};