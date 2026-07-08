import apiClient from './client';
import {
  SocialNetwork,
  SocialLink,
  CreateSocialLinkPayload,
  UpdateSocialLinkPayload,
} from '../types/socialNetwork';

/**
 * GET /social-networks
 * Obtener todas las redes sociales disponibles (público)
 */
export const apiGetAllSocialNetworks = async (
): Promise<SocialNetwork[]> => {
  const response = await apiClient.get('/social-networks');
  return response.data;
};

/**
 * GET /social-networks/:id
 * Obtener una red social por ID (público)
 */
export const apiGetSocialNetworkById = async (id: string): Promise<SocialNetwork> => {
  const response = await apiClient.get(`/social-networks/${id}`);
  return response.data;
};

/**
 * GET /social-networks/anfitriona/:userId
 * Obtener todos los social links de una anfitriona (público)
 * Nota: El parámetro en la URL se llama anfitrionaProfileId pero espera el userId
 */
export const apiGetAnfitrioneProfileSocialLinks = async (
  userId: string,
): Promise<SocialLink[]> => {
  const response = await apiClient.get(`/social-networks/anfitriona/${userId}`);
  return response.data;
};

/**
 * POST /social-networks/anfitriona/:userId/links
 * Agregar un social link (protegido - requiere JWT)
 * Nota: El parámetro en la URL se llama anfitrionaProfileId pero espera el userId
 */
export const apiAddSocialLink = async (
  userId: string,
  payload: CreateSocialLinkPayload,
): Promise<SocialLink> => {
  const response = await apiClient.post(
    `/social-networks/anfitriona/${userId}/links`,
    payload,
  );
  return response.data;
};

/**
 * PUT /social-networks/anfitriona/:userId/links/:linkId
 * Actualizar un social link (protegido - requiere JWT)
 * Nota: El parámetro en la URL se llama anfitrionaProfileId pero espera el userId
 */
export const apiUpdateSocialLink = async (
  userId: string,
  linkId: string,
  payload: UpdateSocialLinkPayload,
): Promise<SocialLink> => {
  const response = await apiClient.put(
    `/social-networks/anfitriona/${userId}/links/${linkId}`,
    payload,
  );
  return response.data;
};

/**
 * DELETE /social-networks/anfitriona/:userId/links/:linkId
 * Eliminar un social link (protegido - requiere JWT)
 * Nota: El parámetro en la URL se llama anfitrionaProfileId pero espera el userId
 */
export const apiDeleteSocialLink = async (
  userId: string,
  linkId: string,
): Promise<void> => {
  await apiClient.delete(
    `/social-networks/anfitriona/${userId}/links/${linkId}`,
  );
};
