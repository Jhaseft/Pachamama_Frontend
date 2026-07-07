// Colores oficiales de la app MonetizaLab.
// Fuente única de verdad: la usa tailwind.config.js (clases) y los componentes
// que necesitan valores hex crudos (ej. LinearGradient).
const colors = {
  primary: {
    DEFAULT: "#132673", // Azul
    blue: "#132673",
    purple: "#a844f2", // Morado
  },
  secondary: {
    DEFAULT: "#f03eb3", // Rosado
    pink: "#f03eb3",
  },
  dark: "#000000", // Negro
  // Superficies oscuras con tinte de marca (para fondos y tarjetas sobre negro).
  surface: {
    DEFAULT: "#0a0613", // fondo de pantalla (casi negro con tinte morado)
    card: "#150a24", // tarjetas / paneles elevados
    border: "#2a1a45", // bordes sutiles sobre superficies oscuras
  },
};

module.exports = colors;
