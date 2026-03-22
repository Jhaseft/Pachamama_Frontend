// ANFITRIONA GUARDADA
export interface SavedAnfitriona {
    id: string;
    name: string;
    avatar: string | null;
    isOnline: boolean;
    rateCredits: number | null;
}

// RESPUESTA PAGINADA
export interface SavedAnfitrianaResponse {
    data: SavedAnfitriona[];
    nextCursor: string | null;
}

// RESPUESTA TOGGLE
export interface ToggleSavedResponse {
    saved: boolean;
}
