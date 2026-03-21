// src/api/deposits.ts
import apiClient from './client';
import { DepositResponse, CreateDepositRequest } from '../types/deposits';


export const apiCreateDepositRequest = async (
    data: CreateDepositRequest,
    file: any
): Promise<DepositResponse> => {
    try {
        const formData = new FormData();

        formData.append('file', {
            name: file.name || `comprobante_${Date.now()}.jpg`,
            type: file.type || 'image/jpeg',
            uri: file.uri, // para React Native, necesitamos esto
        } as any);


        // Agregamos los campos del objeto de forma dinámica
        formData.append('packageId', data.packageId);
        formData.append('paymentMethodId', data.paymentMethodId);

        const response = await apiClient.post<DepositResponse>(
            '/deposits/request',
            formData,
            {
                headers: {
                    'Content-Type': 'multipart/form-data', // clave para React Native
                }
            }
        );

        return response.data;
    } catch (error: any) {
        console.log("🔥 ERROR BACKEND:", error?.response?.data);

        throw error?.response?.data || error;
    }
};