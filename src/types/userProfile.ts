
export type UserProfileData = {
    userName: string;
    bio: string | null;
    avatarUrl: string | null;
};

export type WalletData = {
    id: string;
    balance: number;
};

export type MyProfileData = {
    id: string;
    phoneNumber: string;
    email: string | null;
    firstName: string | null;
    lastName: string | null;
    role: string;
    isProfileComplete: boolean;
    UserProfile?: UserProfileData | null;
    wallet?: WalletData | null;
};

export type UpdateProfilePayload = {
    firstName?: string;
    lastName?: string;
    userName?: string; // Recuerda si en el back es userName o username
    bio?: string;
};