/** Item devuelto por GET /anfitrionas/me/gallery */
export type GalleryItem = {
  id: string;
  imageUrl: string;
  isPremium: boolean;
  unlockCredits: number | null;
  isVisible: boolean;
  createdAt: string;
};

/** Item devuelto por GET /anfitrionas/public/:id (vista del consumidor) */
export type GalleryItemPublic = {
  id: string;
  imageUrl: string;
  isPremium: boolean;
  unlockCredits: number | null;
  /** true si el usuario autenticado ya pagó para ver esta imagen */
  isUnlockedByViewer: boolean;
};

/** Estado local del formulario de publicación */
export type PublishGalleryForm = {
  isPremium: boolean;
  /** String para el TextInput; se parsea a número al enviar */
  unlockCredits: string;
};
