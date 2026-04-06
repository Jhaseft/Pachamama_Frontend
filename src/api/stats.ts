import apiClient from './client';

export interface AnfitrionaStats {
    balance: { credits: number; soles: string };
    earnings: {
        today:     { credits: number; soles: string };
        thisMonth: { credits: number; soles: string };
        total:     { credits: number; soles: string };
    };
}

export const getAnfitrionaStats = async (anfitrionaId: string): Promise<AnfitrionaStats> => {
    const response = await apiClient.get(`/admin/stats/anfitriona/${anfitrionaId}`);
    return response.data;
};
