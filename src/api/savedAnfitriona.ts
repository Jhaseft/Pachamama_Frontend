import apiClient from './client';
import { SavedAnfitrianaResponse, ToggleSavedResponse } from '../types/savedAnfitriona';

function parseApiError(error: any, fallback: string) {
    const rawMessage = error?.response?.data?.message ?? error?.message;
    if (Array.isArray(rawMessage)) return rawMessage.join(', ');
    if (typeof rawMessage === 'string' && rawMessage.trim().length > 0) return rawMessage;
    return fallback;
}

// TOGGLE GUARDAR / QUITAR ANFITRIONA
export const apiToggleSavedAnfitriona = async (anfitrionaId: string): Promise<ToggleSavedResponse> => {
    try {
        const response = await apiClient.post('/users/public/saved-anfitrionas/toggle', { anfitrionaId });
        return response.data;
    } catch (error: any) {
        throw new Error(parseApiError(error, 'Error al guardar anfitriona'));
    }
};

// LISTAR ANFITRIONAS GUARDADAS
export const apiGetSavedAnfitrionas = async (cursor?: string, limit: number = 10): Promise<SavedAnfitrianaResponse> => {
    try {
        const response = await apiClient.get('/users/public/saved-anfitrionas', {
            params: { cursor, limit },
        });
        return response.data;
    } catch (error: any) {
        throw new Error(parseApiError(error, 'Error al obtener anfitrionas guardadas'));
    }
};
