export interface SubscriptionPlan {
    id: string;
    anfitrionaId: string;
    price: number;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface SubscriptionStatus {
    isSubscribed: boolean;
    expiresAt?: string;
}

export interface BuySubscriptionResponse {
    message: string;
    expiresAt: string;
}

export interface ToggleSubscriptionResponse {
    message: string;
    isActive: boolean;
}

export interface MySubscription {
    subscriptionId: string;
    anfitrionaId: string;
    anfitrionaName: string;
    anfitrionaUsername: string;
    anfitrionaAvatar: string;
    price: number;
    isActive: boolean;
    expiresAt: string;
    createdAt: string;
}
