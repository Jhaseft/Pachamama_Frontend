import apiClient from './client';
import { HistoryItem, CreateHistoryRequest, AnfitrionaStories } from '../types/anfitrionaHistory';
import { HistoryFeedItem, HistoryFeedResponse } from '../types/historyViewClient';

/**
 * Servicio para la gestión de historias de Anfitrionas en Pachamama
 */

// 1. CREAR UNA NUEVA HISTORIA (Sube archivo y datos)
export const apiCreateHistory = async (data: CreateHistoryRequest, file: any) => {
    try {
        const formData = new FormData();


        formData.append('file', {
            uri: file.uri,
            name: file.name || 'historia.jpg',
            type: file.type || 'image/jpeg',
        } as any);;


        if (data.priceCredits !== undefined) {
            formData.append('priceCredits', data.priceCredits.toString());
        }

        const response = await apiClient.post(
            '/anfitrionas/history',
            formData,
            {
                headers: {
                    // Esto fuerza a que se trate como archivo
                    'Content-Type': 'multipart/form-data',
                },
            }
        );

        return response.data as HistoryItem;
    } catch (error: any) {
        throw (
            error?.response?.data?.message ||
            'Error al subir la historia'
        );
    }
};

// 2. ELIMINAR UNA HISTORIA
export const apiDeleteHistory = async (historyId: string) => {
    try {

        const response = await apiClient.delete(`/anfitrionas/history/${historyId}`);

        return response.data;
    } catch (error: any) {
        throw (
            error?.response?.data?.message ||
            'No se pudo eliminar la historia'
        );
    }
};

// 3. OBTENER HISTORIAS DE LA ANFITRIONA LOGUEADA (O por ID si lo habilitas)
export const apiGetMyStories = async (): Promise<HistoryItem[]> => {
    try {

        const response = await apiClient.get(`/anfitrionas/me/stories`);


        return response.data as HistoryItem[];
    } catch (error: any) {
        throw (
            error?.response?.data?.message ||
            'Error al obtener tus historias'
        );
    }
};

//OBTENER EL FEED DE CIRCULOS PARA EL HOME
export const apiGetStoriesFeed = async (): Promise<HistoryFeedItem[]> => {
    try {
        const response = await apiClient.get<HistoryFeedResponse>('/anfitrionas/feed/stories');
        return response.data.data;
    } catch (error: any) {
        throw error?.response?.data?.message || 'Error al obtener el feed';
    }
};

//MARCAR COMO VISTA
export const apiMarkAsViewed = async (historyId: string) => {
    try {
        const response = await apiClient.post(`/anfitrionas/history/${historyId}/view`);
        return response.data;
    } catch (error: any) {
        console.error("Error silencioso al marcar vista:", error);
    }
};