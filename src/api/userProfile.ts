import apiClient from './client';
import { MyProfileData } from '../types/userProfile';
import { ExpenseHistoryResponse } from '../types/userProfile';


// GET /anfitrionas/me/profile
export const apiGetMyProfileUser = async (): Promise<MyProfileData> => {
    const response = await apiClient.get('/users/my/profile');
    return response.data;
};

export const apiGetExpenseHistory = async (): Promise<ExpenseHistoryResponse> => {
    try {
        // La ruta debe ser la misma que pusiste en el @Get del Controller
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