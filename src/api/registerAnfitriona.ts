import apiClient from './client';
import type {
    SendOtpRequest,
    VerifyOtpRequest,
    VerifyOtpResponse,
    CompleteAnfitrioneRegistrationRequest,
    RegisterAnfitrioneResponse,
} from '../types/registerAnfitriona';

// ENVIAR OTP (envia código OTP al número de teléfono para verificación)
export const apiSendOtp = async (data: SendOtpRequest): Promise<{ message: string }> => {
    try {
        const response = await apiClient.post('/auth/send-otp', data);
        return response.data;
    } catch (error: any) {
        throw error?.response?.data?.message || 'Error al enviar OTP';
    }
};

// VERIFICAR OTP (verifica el código OTP enviado)
export const apiVerifyOtp = async (data: VerifyOtpRequest): Promise<VerifyOtpResponse> => {
    try {
        const response = await apiClient.post('/auth/verify-otp', data);
        return response.data;
    } catch (error: any) {
        const msg = error?.response?.data?.message;
        throw Array.isArray(msg) ? msg[0] : msg || 'Error al verificar OTP';
    }
};

// COMPLETAR REGISTRO DE ANFITRIONA (completa el registro con los datos del perfil)
export const apiCompleteAnfitrioneRegistration = async (
    data: CompleteAnfitrioneRegistrationRequest,
): Promise<RegisterAnfitrioneResponse> => {
    try {
        const form = new FormData();

        (Object.keys(data) as (keyof CompleteAnfitrioneRegistrationRequest)[]).forEach((key) => {
            const value = data[key];
            if (value === undefined) return;
            if (key === 'idDoc') {
                const file = value as { uri: string; name: string; type: string };
                form.append(
                    'idDoc', {
                        uri: file.uri,
                        name: file.name,
                        type: file.type
                    } as any);
            } else {
                form.append(key, value as string);
            }
        });

        const response = await apiClient.post('/auth/complete-anfitrione-registration', form, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
        return response.data;
    } catch (error: any) {
        const msg = error?.response?.data?.message;
        throw Array.isArray(msg) ? msg[0] : msg || 'Error al completar el registro';
    }
};
