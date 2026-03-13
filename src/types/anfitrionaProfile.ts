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
  username: string;
  avatar: string;
  coverImage: string;
  isOnline: boolean;
  highlightedStories: HighlightStory[];
  galleryImages: string[];
  introMessage: string;
  trustItems: TrustItem[];
};
