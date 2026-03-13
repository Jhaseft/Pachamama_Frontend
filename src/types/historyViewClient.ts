// 1. Tipo para un elemento individual del Feed (los círculos)
export type HistoryFeedItem = {
    userId: string;
    name: string;
    avatar: string | null;
    hasUnseen: boolean;     // <--- VITAL: Para el color del borde (Rojo/Blanco)
    totalStories: number;   // <--- Para mostrar el numerito de cuántas hay
    stories: HistoryItem[]; // <--- AGREGA ESTO
};

// 2. Respuesta que viene del endpoint /anfitrionas/feed/stories
export type HistoryFeedResponse = {
    data: HistoryFeedItem[];
};

// 3. Actualizamos HistoryItem para saber si esta historia específica ya fue vista
// (Útil si quieres poner un check verde dentro del visor)
export type HistoryItem = {
    id: string;
    mediaUrl: string;
    mediaType: "IMAGE" | "VIDEO";
    priceCredits: number;
    publishedAt: string;
    isViewed?: boolean; // <--- Opcional, por si el backend lo envía
};