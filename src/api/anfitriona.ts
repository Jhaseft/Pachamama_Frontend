// api/anfitriona.ts

import apiClient from './client';
import { UserClientData } from '../types/userClient';

interface PaginatedAnfitriona {
  data: UserClientData[];
  nextCursor?: string | null;
}

// LISTAR ANFITRIONAS (cursor pagination)
export const apiGetAllAnfitriona = async (
  search?: string,
  cursor?: string
): Promise<PaginatedAnfitriona> => {
  try {
    const response = await apiClient.get('/admin/anfitrionas', {
      params: {
        search,
        cursor,
        limit: 10
      }
    });

    return response.data;
  } catch (error: any) {
    throw error?.response?.data?.message || 'Error al obtener anfitrionas';
  }
};

// EDITAR PERFIL DE ANFITRIONA (admin)
export const apiAdminUpdateAnfitrionaProfile = async (
  id: string,
  payload: { firstName?: string; lastName?: string; username?: string; bio?: string },
) => {
  const response = await apiClient.patch(`/admin/anfitrionas/${id}/profile`, payload);
  return response.data;
};

// CAMBIAR ESTADO
export const apiToggleAnfitrionaStatus = async (
  id: string,
  isActive: boolean
) => {
  try {
    const response = await apiClient.patch(
      `/admin/anfitrionas/${id}/status`,
      { isActive }
    );

    return response.data;
  } catch (error: any) {
    throw error?.response?.data?.message || 'Error al actualizar estado';
  }
};