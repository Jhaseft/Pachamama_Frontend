import apiClient from './client';

//funcion para agarrar errores
function parseApiError(error: any, fallback: string) {
    const rawMessage = error?.response?.data?.message ?? error?.message;
    if (Array.isArray(rawMessage)) return rawMessage.join(', ');
    if (typeof rawMessage === 'string' && rawMessage.trim().length > 0) return rawMessage;
    return fallback;
}

export interface PaypalOrderResponse {
    approveUrl: string;
    orderId: string;
}

export interface PaypalCaptureResponse {
    credits: number;
    newBalance: string | number;
}

//crear orden PayPal
export const apiPaypalCreateOrder = async (
    packageId: string,
): Promise<PaypalOrderResponse> => {
    try {
        const response = await apiClient.post('/paypal/create-order', { packageId });
        return response.data;
    } catch (error: any) {
        throw new Error(parseApiError(error, 'No se pudo iniciar el pago con PayPal'));
    }
};

//capturar orden PayPal y acreditar creditos
export const apiPaypalCapture = async (
    orderId: string,
): Promise<PaypalCaptureResponse> => {
    try {
        const response = await apiClient.post('/paypal/capture', { orderId });
        return response.data;
    } catch (error: any) {
        throw new Error(parseApiError(error, 'No se pudo completar el pago'));
    }
};
