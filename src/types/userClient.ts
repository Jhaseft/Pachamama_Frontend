export interface UserClientData {
    id: string;
    firstName: string;
    lastName: string;
    phoneNumber: string;
    email?: string;
    isActive: boolean;

    wallet?: {
        balance: number | string;
    }
}

export interface UserAnfitrionaData {
    id: string;
    firstName: string;
    lastName: string;
    phoneNumber: string;
    email?: string;
    isActive: boolean;

    wallet?: {
        balance: number | string;
    },

    anfitrionaProfile?: {
        username: string;
        avatarUrl?: string;
        bio: string;
        rateCredits: number;
        isOnline: boolean;
        idDocUrl?: string;
        idDocPublicId?: string;
    }
}