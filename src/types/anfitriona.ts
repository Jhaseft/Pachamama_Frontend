// ─── UI model (used by PostCard and components) ───────────────────────────────

export type Anfitriona = {
  id: string;
  name: string;
  age?: number;
  shortDescription: string;
  /** Price in app credits per conversation */
  credits: number;
  /** At least one image; first one is the featured image */
  images: string[];
  avatar: string;
  isOnline: boolean;
  // Fields not yet returned by backend — optional, mapper provides defaults
  solPrice?: number;
  likesCount?: number;
  isPopular?: boolean;
  isFavorite?: boolean;
};

// ─── Backend API response types ───────────────────────────────────────────────

/** Item shape returned by GET /anfitrionas/public */
export type AnfitrioneApiListItem = {
  id: string;
  name: string;
  avatar: string | null;
  shortDescription: string | null;
  rateCredits: number | null;
  mainImage: string | null;
  images: string[];
  isOnline: boolean;
};

export type AnfitrioneApiListResponse = {
  data: AnfitrioneApiListItem[];
};

/** Shape returned by GET /anfitrionas/public/:id */
export type AnfitrioneApiDetail = {
  id: string;
  name: string;
  username: string;
  age: number | null;
  bio: string | null;
  avatar: string | null;
  images: string[];
  rateCredits: number | null;
  isOnline: boolean;
};
