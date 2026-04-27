// src/config.ts
export const API_URL = process.env.EXPO_PUBLIC_API_URL ?? "https://caja-negra-pacha-back.wkhbmg.easypanel.host";
export const AGORA_APP_ID = process.env.EXPO_PUBLIC_AGORA_APP_ID ?? "0f5a7945c4de4aeaa704902064e1f8f9";
export const MIN_WITHDRAWAL_USD = Number(process.env.EXPO_PUBLIC_MIN_WITHDRAWAL_USD ?? "50");
export const CREDITS_PER_USD = Number(process.env.EXPO_PUBLIC_CREDITS_PER_USD ?? "4");