export type HighlightStory = {
  id: string;
  title: string;
  emoji: string;
  locked?: boolean;
};

export type TrustItem = {
  emoji: string;
  label: string;
  value: string;
};

export type AnfitrioneProfileDetail = {
  id: string;
  name: string;
  avatar: string;
  coverImage: string;
  isOnline: boolean;
  highlightedStories: HighlightStory[];
  galleryImages: import('./gallery').GalleryItemPublic[];
  introMessage: string;
  trustItems: TrustItem[];
  likesCount: number;
  isLiked: boolean;
  /** Créditos por conversación. Null si la anfitriona no lo configuró. */
  rateCredits: number | null;
};
