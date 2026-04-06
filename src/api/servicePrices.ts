import apiClient from './client';

export type ServiceType = 'MESSAGE' | 'MESSAGE_SEND' | 'CALL' | 'VIDEO_CALL';

export type ServicePrice = {
  id: string;
  profileId: string;
  serviceType: ServiceType;
  price: number;
  createdAt: string;
  updatedAt: string;
};

// GET /service-prices — obtiene todos los precios de la anfitriona
export const apiGetMyServicePrices = async (): Promise<ServicePrice[]> => {
  const response = await apiClient.get('/service-prices');
  return response.data;
};

// GET /service-prices/public/:userId — precios públicos de una anfitriona (sin auth)
export const apiGetPublicServicePrices = async (anfitrionaUserId: string): Promise<ServicePrice[]> => {
  const response = await apiClient.get(`/service-prices/public/${anfitrionaUserId}`);
  return response.data;
};

// PUT /service-prices — crea o actualiza un precio
export const apiUpsertServicePrice = async (
  serviceType: ServiceType,
  price: number,
): Promise<ServicePrice> => {
  const response = await apiClient.put('/service-prices', { serviceType, price });
  return response.data;
};
