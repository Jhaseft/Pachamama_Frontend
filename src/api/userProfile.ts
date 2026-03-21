import apiClient from './client';
import { MyProfileData } from '../types/userProfile';

// GET /anfitrionas/me/profile
export const apiGetMyProfileUser = async (): Promise<MyProfileData> => {
    const response = await apiClient.get('/users/my/profile');
    return response.data;
};

