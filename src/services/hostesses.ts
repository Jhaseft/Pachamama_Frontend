import { apiFetch } from "./api";
import type {
  Anfitriona,
  AnfitrioneApiDetail,
  AnfitrioneApiListItem,
  AnfitrioneApiListResponse,
} from "../types/anfitriona";
import type { AnfitrioneProfileDetail } from "../types/anfitrionaProfile";

// ─── Mapper ───────────────────────────────────────────────────────────────────

/**
 * Converts a backend list item to the UI Anfitriona model.
 * Fields not yet available from backend (likesCount, isPopular, isFavorite, solPrice)
 * receive safe defaults so components don't crash.
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
    username: item.username,
    avatar: item.avatar ?? "",
    shortDescription: item.shortDescription ?? "",
    credits: item.rateCredits ?? 0,
    images,
    isOnline: item.isOnline,
    // Not yet returned by backend — defaults
    likesCount: 0,
    isPopular: false,
    isFavorite: false,
  };
}

// ─── Service functions ────────────────────────────────────────────────────────

/**
 * GET /anfitrionas/public
 * Public — no auth token required.
 * TODO: when isFavorite is added to backend, pass userId from auth context here.
 */
export async function getPublicHostesses(): Promise<Anfitriona[]> {
  const response = await apiFetch<AnfitrioneApiListResponse>(
    "/anfitrionas/public",
    { method: "GET" },
  );
  return response.data.map(mapListItemToAnfitriona);
}

/**
 * GET /anfitrionas/public/:id
 * Public — no auth token required.
 * Returns the raw backend shape. Use getPublicHostessProfile for the UI model.
 */
export async function getPublicHostessById(
  id: string,
): Promise<AnfitrioneApiDetail> {
  return apiFetch<AnfitrioneApiDetail>(`/anfitrionas/public/${id}`, {
    method: "GET",
  });
}

/**
 * Converts raw backend detail response to the UI profile model.
 *
 * Fields not yet in backend (highlightedStories, trustItems) default to []
 * so existing UI sections render as empty rather than crashing.
 * Remove defaults here when the backend adds those fields.
 */
function mapDetailToProfile(data: AnfitrioneApiDetail): AnfitrioneProfileDetail {
  return {
    id: data.id,
    name: data.name,
    username: data.username,
    avatar: data.avatar ?? "",
    coverImage: data.coverImage ?? data.images[0] ?? "",
    isOnline: data.isOnline,
    galleryImages: data.images,
    introMessage: data.bio ?? "",
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
