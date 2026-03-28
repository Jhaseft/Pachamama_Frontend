import apiClient from './client';
import { UpdateWithdrawalStatusRequest, UpdateWithdrawalStatusResponse } from '../types/withdrawalRequest';

function parseApiError(error: any, fallback: string) {
    const rawMessage = error?.response?.data?.message ?? error?.message;
    if (Array.isArray(rawMessage)) return rawMessage.join(', ');
    if (typeof rawMessage === 'string' && rawMessage.trim().length > 0) return rawMessage;
    return fallback;
}

// APROBAR / RECHAZAR SOLICITUD DE RETIRO
export const apiUpdateWithdrawalStatus = async (
    id: string,
    data: UpdateWithdrawalStatusRequest,
): Promise<UpdateWithdrawalStatusResponse> => {
    try {
        const formData = new FormData();

        formData.append('status', data.status);

        if (data.rejectionReason) {
            formData.append('rejectionReason', data.rejectionReason);
        }

        if (data.receipt) {
            formData.append('receipt', {
                uri: data.receipt.uri,
                name: data.receipt.name ?? `comprobante_${Date.now()}.jpg`,
                type: data.receipt.type ?? 'image/jpeg',
            } as any);
        }

        const response = await apiClient.patch<UpdateWithdrawalStatusResponse>(
            `/admin/payment-requests/${id}/status`,
            formData,
            { headers: { 'Content-Type': 'multipart/form-data' } },
        );

        return response.data;
    } catch (error: any) {
        throw new Error(parseApiError(error, 'Error al actualizar solicitud de retiro'));
    }
};
