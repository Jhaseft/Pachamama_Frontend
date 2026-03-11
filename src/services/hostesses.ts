import { apiFetch } from "./api";
import type {
  Anfitriona,
  AnfitrioneApiDetail,
  AnfitrioneApiListItem,
  AnfitrioneApiListResponse,
} from "../types/anfitriona";

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
 * Used for HU2 (profile detail screen).
 */
export async function getPublicHostessById(
  id: string,
): Promise<AnfitrioneApiDetail> {
  return apiFetch<AnfitrioneApiDetail>(`/anfitrionas/public/${id}`, {
    method: "GET",
  });
}
