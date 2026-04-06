import apiClient from './client';
import {
    SubscriptionPlan,
    SubscriptionStatus,
    BuySubscriptionResponse,
    ToggleSubscriptionResponse,
    MySubscription,
} from '../types/subscriptions';

// Anfitriona

// GET /subscriptions/my-plan
export const apiGetMyPlan = async (): Promise<SubscriptionPlan> => {
    const res = await apiClient.get('/subscriptions/my-plan');
    return res.data;
};

// PUT /subscriptions/my-plan — crear o editar precio del plan
export const apiUpsertMyPlan = async (price: number): Promise<SubscriptionPlan> => {
    const res = await apiClient.put('/subscriptions/my-plan', { price });
    return res.data;
};

// PATCH /subscriptions/my-plan/toggle — activar/desactivar plan
export const apiToggleMyPlan = async (): Promise<ToggleSubscriptionResponse> => {
    const res = await apiClient.patch('/subscriptions/my-plan/toggle');
    return res.data;
};

// Cliente

// GET /subscriptions/public/:anfitrionaId — ver plan de una anfitriona
export const apiGetPublicPlan = async (anfitrionaId: string): Promise<SubscriptionPlan> => {
    const res = await apiClient.get(`/subscriptions/public/${anfitrionaId}`);
    return res.data;
};

// POST /subscriptions/:anfitrionaId/buy — comprar suscripción
export const apiBuySubscription = async (anfitrionaId: string): Promise<BuySubscriptionResponse> => {
    const res = await apiClient.post(`/subscriptions/${anfitrionaId}/buy`);
    return res.data;
};

// GET /subscriptions/:anfitrionaId/status — verificar si tiene suscripción activa
export const apiGetSubscriptionStatus = async (anfitrionaId: string): Promise<SubscriptionStatus> => {
    const res = await apiClient.get(`/subscriptions/${anfitrionaId}/status`);
    return res.data;
};

// GET /subscriptions/my-subscriptions — todas las suscripciones del cliente
export const apiGetMySubscriptions = async (): Promise<MySubscription[]> => {
    const res = await apiClient.get('/subscriptions/my-subscriptions');
    return res.data;
};
