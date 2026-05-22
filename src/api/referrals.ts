import apiClient from "./client";

export interface ReferralItem {
  referredUserId: string;
  referredCreatorId?: string | null;
  name?: string | null;
  email?: string | null;
  percent: number;
  status?: "PENDING" | "ACTIVE" | "DISABLED";
  createdAt?: string;
  qualifiedAt?: string | null;
  totalGenerated: number;
  totalRewardAmount: number;
  rewardEventsCount: number;
}

export interface MyReferralsResponse {
  referralCode: string | null;
  percent: number;
  totalReferrals: number;
  totalRewardAmount: number;
  referrals?: ReferralItem[];
}

function parseApiError(error: any, fallback: string) {
  const rawMessage = error?.response?.data?.message ?? error?.message;
  if (Array.isArray(rawMessage)) return rawMessage.join(", ");
  if (typeof rawMessage === "string" && rawMessage.trim().length > 0) return rawMessage;
  return fallback;
}

export const apiGetMyReferrals = async (): Promise<MyReferralsResponse> => {
  try {
    const response = await apiClient.get("/referrals/me");
    const data = response.data ?? {};

    return {
      referralCode: data.referralCode ?? null,
      percent: Number(data.percent ?? 0),
      totalReferrals: Number(data.totalReferrals ?? 0),
      totalRewardAmount: Number(data.totalRewardAmount ?? 0),
      referrals: Array.isArray(data.referrals)
        ? data.referrals.map((item: any) => ({
            referredUserId: item.referredUserId ?? "",
            referredCreatorId: item.referredCreatorId ?? null,
            name: item.name ?? null,
            email: item.email ?? null,
            percent: Number(
              item.percent ??
                item.contractPercent ??
                item.referralPercent ??
                item.agreedPercent ??
                0,
            ),
            status: item.status,
            createdAt: item.createdAt,
            qualifiedAt: item.qualifiedAt ?? null,
            totalGenerated: Number(item.totalGenerated ?? 0),
            totalRewardAmount: Number(item.totalRewardAmount ?? 0),
            rewardEventsCount: Number(item.rewardEventsCount ?? 0),
          }))
        : [],
    };
  } catch (error: any) {
    throw new Error(parseApiError(error, "No se pudo cargar la información de referidos"));
  }
};
