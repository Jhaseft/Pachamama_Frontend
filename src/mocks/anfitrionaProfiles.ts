import type { AnfitrioneProfileDetail } from "../types/anfitrionaProfile";

// TODO: replace with real API call to GET /anfitrionas/public/:id when backend is ready
// Key = anfitriona id (matches MOCK_ANFITRIONAS ids)
export const MOCK_ANFITRIONA_PROFILES: Record<string, AnfitrioneProfileDetail> = {
  "1": {
    id: "1",
    name: "Maria",
    avatar: "https://picsum.photos/seed/mstock1/200/200",
    coverImage: "https://picsum.photos/seed/pstock1/500/900",
    isOnline: true,
    highlightedStories: [
      { id: "h1", title: "Esta noche", emoji: "📸", locked: false },
      { id: "h2", title: "Momentos", emoji: "🌙", locked: false },
      { id: "h3", title: "Privadas", emoji: "🔥", locked: true },
      { id: "h4", title: "Videos", emoji: "🎥", locked: true },
    ],
    galleryImages: [
      "https://picsum.photos/seed/g1a/300/400",
      "https://picsum.photos/seed/g1b/300/400",
      "https://picsum.photos/seed/g1c/300/400",
      "https://picsum.photos/seed/g1d/300/400",
    ],
    introMessage: "Hola... estoy en el local esta noche, ¿Vienes a visitarme o prefieres hablar conmigo aquí?",
    trustItems: [
      { emoji: "⚡", label: "Respuesta rápida", value: "Responde en menos de 2 min" },
      { emoji: "👥", label: "1,200 seguidores", value: "Comunidad activa y comprometida" },
      { emoji: "⭐", label: "Calificación excelente", value: "★★★★★ 4.9" },
    ],
  },
  "2": {
    id: "2",
    name: "Sofia",
    avatar: "https://picsum.photos/seed/mstock2/200/200",
    coverImage: "https://picsum.photos/seed/pstock2/500/900",
    isOnline: true,
    highlightedStories: [
      { id: "h1", title: "Esta noche", emoji: "✨", locked: false },
      { id: "h2", title: "Momentos", emoji: "💃", locked: false },
      { id: "h3", title: "Privadas", emoji: "🔒", locked: true },
      { id: "h4", title: "Videos", emoji: "🎥", locked: true },
    ],
    galleryImages: [
      "https://picsum.photos/seed/g2a/300/400",
      "https://picsum.photos/seed/g2b/300/400",
      "https://picsum.photos/seed/g2c/300/400",
    ],
    introMessage: "¡Hola! Disponible ahora mismo para charlar. ¿Te animas? 💃",
    trustItems: [
      { emoji: "⚡", label: "Respuesta rápida", value: "Responde en menos de 1 min" },
      { emoji: "👥", label: "980 seguidores", value: "Comunidad activa" },
      { emoji: "⭐", label: "Calificación excelente", value: "★★★★★ 4.8" },
    ],
  },
  "3": {
    id: "3",
    name: "Valentina",
    avatar: "https://picsum.photos/seed/mstock3/200/200",
    coverImage: "https://picsum.photos/seed/pstock3/500/900",
    isOnline: false,
    highlightedStories: [
      { id: "h1", title: "Esta noche", emoji: "🌙", locked: false },
      { id: "h2", title: "Momentos", emoji: "📸", locked: false },
      { id: "h3", title: "Privadas", emoji: "🔥", locked: true },
      { id: "h4", title: "Videos", emoji: "🎥", locked: true },
    ],
    galleryImages: [
      "https://picsum.photos/seed/g3a/300/400",
      "https://picsum.photos/seed/g3b/300/400",
      "https://picsum.photos/seed/g3c/300/400",
      "https://picsum.photos/seed/g3d/300/400",
      "https://picsum.photos/seed/g3e/300/400",
    ],
    introMessage: "Buenas noches 🌙 Escríbeme cuando quieras conversar.",
    trustItems: [
      { emoji: "⚡", label: "Respuesta rápida", value: "Responde en menos de 5 min" },
      { emoji: "👥", label: "2,100 seguidores", value: "La más popular del momento" },
      { emoji: "⭐", label: "Calificación excelente", value: "★★★★★ 5.0" },
    ],
  },
  "4": {
    id: "4",
    name: "Isabella",
    avatar: "https://picsum.photos/seed/mstock4/200/200",
    coverImage: "https://picsum.photos/seed/pstock4/500/900",
    isOnline: false,
    highlightedStories: [
      { id: "h1", title: "Esta noche", emoji: "📸", locked: false },
      { id: "h2", title: "Momentos", emoji: "🌸", locked: false },
      { id: "h3", title: "Privadas", emoji: "🔒", locked: true },
      { id: "h4", title: "Videos", emoji: "🎥", locked: true },
    ],
    galleryImages: [
      "https://picsum.photos/seed/g4a/300/400",
      "https://picsum.photos/seed/g4b/300/400",
      "https://picsum.photos/seed/g4c/300/400",
    ],
    introMessage: "Nueva foto 📸 ¿Qué te parece? Cuéntame...",
    trustItems: [
      { emoji: "⚡", label: "Respuesta rápida", value: "Responde en menos de 3 min" },
      { emoji: "👥", label: "540 seguidores", value: "Comunidad en crecimiento" },
      { emoji: "⭐", label: "Calificación excelente", value: "★★★★☆ 4.6" },
    ],
  },
  "5": {
    id: "5",
    name: "Camila",
    avatar: "https://picsum.photos/seed/mstock5/200/200",
    coverImage: "https://picsum.photos/seed/pstock5/500/900",
    isOnline: true,
    highlightedStories: [
      { id: "h1", title: "Esta noche", emoji: "🌹", locked: false },
      { id: "h2", title: "Momentos", emoji: "💫", locked: false },
      { id: "h3", title: "Privadas", emoji: "🔥", locked: true },
      { id: "h4", title: "Videos", emoji: "🎥", locked: true },
    ],
    galleryImages: [
      "https://picsum.photos/seed/g5a/300/400",
      "https://picsum.photos/seed/g5b/300/400",
      "https://picsum.photos/seed/g5c/300/400",
      "https://picsum.photos/seed/g5d/300/400",
    ],
    introMessage: "Aquí para ti 🌹 Siempre con una sonrisa y ganas de conversar.",
    trustItems: [
      { emoji: "⚡", label: "Respuesta rápida", value: "Responde en menos de 2 min" },
      { emoji: "👥", label: "1,800 seguidores", value: "Comunidad activa y comprometida" },
      { emoji: "⭐", label: "Calificación excelente", value: "★★★★★ 4.9" },
    ],
  },
  "6": {
    id: "6",
    name: "Lucia",
    avatar: "https://picsum.photos/seed/mstock6/200/200",
    coverImage: "https://picsum.photos/seed/pstock6/500/900",
    isOnline: false,
    highlightedStories: [
      { id: "h1", title: "Esta noche", emoji: "😊", locked: false },
      { id: "h2", title: "Momentos", emoji: "🌟", locked: false },
      { id: "h3", title: "Privadas", emoji: "🔒", locked: true },
      { id: "h4", title: "Videos", emoji: "🎥", locked: true },
    ],
    galleryImages: [
      "https://picsum.photos/seed/g6a/300/400",
      "https://picsum.photos/seed/g6b/300/400",
      "https://picsum.photos/seed/g6c/300/400",
    ],
    introMessage: "Siempre sonriendo 😊 Escríbeme, te prometo que la pasaremos genial.",
    trustItems: [
      { emoji: "⚡", label: "Respuesta rápida", value: "Responde en menos de 4 min" },
      { emoji: "👥", label: "720 seguidores", value: "Comunidad en crecimiento" },
      { emoji: "⭐", label: "Calificación excelente", value: "★★★★☆ 4.7" },
    ],
  },
};
