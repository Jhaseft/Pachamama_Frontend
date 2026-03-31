import apiClient from './client';
import { MyProfileData } from '../types/userProfile';
import { ExpenseHistoryResponse } from '../types/userProfile';

// GET /users/my/profile
export const apiGetMyProfileUser = async (): Promise<MyProfileData> => {
    const response = await apiClient.get('/users/my/profile');
    return response.data;
};

// ACTUALIZAR FCM TOKEN
export const apiUpdateFcmToken = async (fcmToken: string): Promise<void> => {
    try {
        await apiClient.patch('/users/fcm-token', { fcmToken });
    } catch (error: any) {
        console.error('Error actualizando FCM token:', error);
    }
};

// HISTORIAL DE GASTOS
export const apiGetExpenseHistory = async (): Promise<ExpenseHistoryResponse> => {
    try {
        const response = await apiClient.get<ExpenseHistoryResponse>('/users/expense-history');
        return response.data;
    } catch (error: any) {
        console.error('Error cargando historial de gastos:', error);
        return {
            success: false,
            data: [],
            message: error.response?.data?.message || 'Error al conectar con el servidor',
        };
    }
};
