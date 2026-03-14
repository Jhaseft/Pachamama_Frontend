// Mantener una sola fuente de verdad para el backend usando .env
export const API_URL =
  process.env.EXPO_PUBLIC_API_URL ?? "https://paginas-pachamama-backend.pk1ooa.easypanel.host";
