import { apiGetMyProfile, type MyProfileData } from '@/src/api/anfitrionaProfile';
import { apiGetMyGallery } from '@/src/api/anfitrionaGallery';
import { apiGetMyServicePrices, type ServicePrice } from '@/src/api/servicePrices';
import type { GalleryItem } from '@/src/types/gallery';

// Espejo de la lógica del onboarding web (pacha-web/src/lib/onboarding.ts).
// Las fotos de galería son opcionales: el perfil se considera listo con
// avatar, portada y bio.

export interface OnboardingData {
  profile: MyProfileData;
  gallery: GalleryItem[];
  prices: ServicePrice[];
}

export interface OnboardingCompletion {
  publicCount: number;
  premiumCount: number;
  /** Precio del servicio, o `undefined` si aún no se ha definido (0 = gratis). */
  priceOf: (serviceType: string) => number | undefined;
  /** Meta 1: perfil (avatar, portada y bio). */
  profileOk: boolean;
  /** Metas 2-3: el chat tiene un precio definido (puede ser 0 = gratis). */
  servicesOk: boolean;
  /** El perfil está listo para operar. */
  complete: boolean;
}

/**
 * Carga en paralelo todo lo necesario para conocer el estado del onboarding.
 * La galería y los precios pueden fallar sin romper el flujo (perfil recién
 * creado): se devuelven vacíos.
 */
export async function loadOnboardingData(): Promise<OnboardingData> {
  const [profile, gallery, prices] = await Promise.all([
    apiGetMyProfile(),
    apiGetMyGallery().catch(() => [] as GalleryItem[]),
    apiGetMyServicePrices().catch(() => [] as ServicePrice[]),
  ]);
  return { profile, gallery, prices };
}

/**
 * Deriva el avance del onboarding del estado REAL del perfil, no de un flag
 * aparte. Así el progreso "se guarda" solo: al volver, se recalcula.
 */
export function computeCompletion({
  profile,
  gallery,
  prices,
}: OnboardingData): OnboardingCompletion {
  const publicCount = gallery.filter((g) => !g.isPremium).length;
  const premiumCount = gallery.filter((g) => g.isPremium).length;
  const priceOf = (serviceType: string) =>
    prices.find((p) => p.serviceType === serviceType)?.price;

  const profileOk =
    !!profile.avatarUrl && !!profile.coverUrl && !!profile.bio?.trim();

  const servicesOk = priceOf('MESSAGE_SEND') != null;

  return {
    publicCount,
    premiumCount,
    priceOf,
    profileOk,
    servicesOk,
    complete: profileOk && servicesOk,
  };
}
