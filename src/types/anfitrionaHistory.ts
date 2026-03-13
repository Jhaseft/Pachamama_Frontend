//Tipo para listar historias (response del backend)
export type HistoryItem = {
    id: string;
    mediaUrl: string;
    mediaType: "IMAGE" | "VIDEO";
    priceCredits: number;
    publishedAt: string;
};

//Tipo para crear historia (request al backend)
export type CreateHistoryRequest = {
    priceCredits: number;
};

//PARA LISTAR HISTORIAS DE UNA ANFITRIONA
export type AnfitrionaStories = {
    userId: string;
    stories: HistoryItem[];
};