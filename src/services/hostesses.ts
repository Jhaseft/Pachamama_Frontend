import { apiFetch } from "./api";
import type {
  Anfitriona,
  AnfitrioneApiDetail,
  AnfitrioneApiListItem,
  AnfitrioneApiListResponse,
  ToggleLikeResponse,
} from "../types/anfitriona";

export type UnlockImageResponse = {
  alreadyUnlocked: boolean;
  creditsSpent: number;
  imageUrl: string;
};
import type { AnfitrioneProfileDetail } from "../types/anfitrionaProfile";

// ─── Mapper ───────────────────────────────────────────────────────────────────

/**
 * Converts a backend list item to the UI Anfitriona model.
 */
function mapListItemToAnfitriona(item: AnfitrioneApiListItem): Anfitriona {
  // Prefer explicit images array; fall back to mainImage if present
  const images =
    item.images.length > 0
      ? item.images
      : item.mainImage
        ? [item.mainImage]
        : [];

  return {
    id: item.id,
    name: item.name,
    username: item.username ?? undefined,
    avatar: item.avatar ?? "",
    shortDescription: item.shortDescription ?? "",
    credits: item.rateCredits ?? 0,
    images,
    isOnline: item.isOnline,
    likesCount: item.likesCount ?? 0,
    isLiked: item.isLiked ?? false,
    isPopular: false,
    isFavorite: false,
  };
}

// ─── Service functions ────────────────────────────────────────────────────────

export type HostessesPaginatedResult = {
  anfitrionas: Anfitriona[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
};

/**
 * GET /anfitrionas/public?page=1&limit=10
 * Public — no auth token required.
 */
export async function getPublicHostesses(
  page = 1,
  limit = 10,
): Promise<HostessesPaginatedResult> {
  const response = await apiFetch<AnfitrioneApiListResponse>(
    `/anfitrionas/public?page=${page}&limit=${limit}`,
    { method: "GET" },
  );
  return {
    anfitrionas: response.data.map(mapListItemToAnfitriona),
    total: response.total,
    page: response.page,
    limit: response.limit,
    hasMore: response.page * response.limit < response.total,
  };
}

/**
 * GET /anfitrionas/public/:id
 * Public — no auth token required.
 */
export async function getPublicHostessById(
  id: string,
): Promise<AnfitrioneApiDetail> {
  return apiFetch<AnfitrioneApiDetail>(`/anfitrionas/public/${id}`, {
    method: "GET",
  });
}

export async function getPublicHostessProfileByUsername(
  username: string,
): Promise<AnfitrioneProfileDetail> {
  const data = await apiFetch<AnfitrioneApiDetail>(
    `/anfitrionas/public/@${username}`,
    { method: "GET" }
  );
  return mapDetailToProfile(data);
}


/**
 * POST /anfitrionas/public/:id/like
 * Requiere autenticación con rol USER.
 * Alterna el like: si ya dio like lo quita, si no lo da.
 */
export async function toggleAnfitrianaLike(
  anfitrionaId: string,
): Promise<ToggleLikeResponse> {
  return apiFetch<ToggleLikeResponse>(
    `/anfitrionas/public/${anfitrionaId}/like`,
    { method: "POST" },
  );
}

/**
 * POST /anfitrionas/public/:anfitrionaId/gallery/:imageId/unlock
 * Requiere autenticación con rol USER.
 * Descuenta créditos del cliente y desbloquea la imagen premium.
 * Si ya fue desbloqueada antes devuelve alreadyUnlocked: true sin cobrar.
 */
export async function unlockGalleryImage(
  anfitrionaId: string,
  imageId: string,
): Promise<UnlockImageResponse> {
  return apiFetch<UnlockImageResponse>(
    `/anfitrionas/public/${anfitrionaId}/gallery/${imageId}/unlock`,
    { method: "POST" },
  );
}

/**
 * Converts raw backend detail response to the UI profile model.
 */
function mapDetailToProfile(data: AnfitrioneApiDetail): AnfitrioneProfileDetail {
  return {
    id: data.id,
    name: data.name,
    avatar: data.avatar ?? "",
    coverImage: data.coverImage ?? data.images[0] ?? "",
    isOnline: data.isOnline,
    galleryImages: data.galleryImages ?? [],
    introMessage: data.bio ?? "",
    likesCount: data.likesCount,
    isLiked: data.isLiked,
    rateCredits: data.rateCredits ?? null,
    // TODO: replace with real backend data when trust/stories endpoints are added
    highlightedStories: [],
    trustItems: [
      { emoji: "⚡", label: "Respuesta rápida", value: "Activa en la plataforma" },
      { emoji: "✅", label: "Perfil verificado", value: "Identidad confirmada" },
      { emoji: "💬", label: "Conversación real", value: "Sin bots, sin scripts" },
    ],
  };
}

/**
 * GET /anfitrionas/public/:id → mapped to AnfitrioneProfileDetail (UI model).
 * Used by the HU2 profile screen.
 */
export async function getPublicHostessProfile(
  id: string,
): Promise<AnfitrioneProfileDetail> {
  const data = await getPublicHostessById(id);
  return mapDetailToProfile(data);
}
