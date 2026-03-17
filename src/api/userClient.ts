// api/userClient.ts
import apiClient from './client';
import { UserClientData } from '../types/userClient';

// Definimos la estructura de respuesta paginada que viene del Backend
interface PaginatedClients {
    data: UserClientData[];
    nextCursor?: string | null;
}

function parseApiError(error: any, fallback: string) {
    const rawMessage = error?.response?.data?.message ?? error?.message;
    if (Array.isArray(rawMessage)) return rawMessage.join(', ');
    if (typeof rawMessage === 'string' && rawMessage.trim().length > 0) return rawMessage;
    return fallback;
}



// LISTAR Y BUSCAR CLIENTES (Soporta la barra roja de búsqueda)
export const apiGetAllClients = async (search?: string, cursor?: string): Promise<PaginatedClients> => {

    try {
        // Enviamos los query params que definimos en el Controller
        const response = await apiClient.get('/admin/clients', {
            params: { search, cursor, limit: 10 }
        });
        return response.data;
    } catch (error: any) {
        throw new Error(parseApiError(error, 'Error al obtener clientes'));
    }
};

// CAMBIAR ESTADO (ACTIVAR/SUSPENDER)
export const apiToggleClientStatus = async (id: string, isActive: boolean) => {
    try {
        const response = await apiClient.patch(`/admin/clients/${id}/status`, {
            isActive // Enviamos el booleano al DTO
        });
        return response.data;
    } catch (error: any) {
        throw new Error(parseApiError(error, 'Error al actualizar estado'));
    }
};
