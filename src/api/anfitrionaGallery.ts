import apiClient from './client';
import type { GalleryItem } from '../types/gallery';

type GalleryImageFile = {
  uri: string;
  name: string;
  type: string;
};

type CreateGalleryPayload = {
  isPremium: boolean;
  unlockCredits?: number;
};

/** POST /anfitrionas/me/gallery — crea una imagen permanente en la galería */
export const apiCreateGalleryImage = async (
  payload: CreateGalleryPayload,
  file: GalleryImageFile,
): Promise<GalleryItem> => {
  const formData = new FormData();

  formData.append('file', {
    uri: file.uri,
    name: file.name,
    type: file.type,
  } as any);

  formData.append('isPremium', String(payload.isPremium));

  if (payload.isPremium && payload.unlockCredits !== undefined) {
    formData.append('unlockCredits', String(payload.unlockCredits));
  }

  const response = await apiClient.post('/anfitrionas/me/gallery', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });

  return response.data as GalleryItem;
};

/** GET /anfitrionas/me/gallery — galería propia de la anfitriona */
export const apiGetMyGallery = async (): Promise<GalleryItem[]> => {
  const response = await apiClient.get('/anfitrionas/me/gallery');
  return response.data as GalleryItem[];
};
