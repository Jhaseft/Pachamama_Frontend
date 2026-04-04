import { setBackgroundMessageHandler } from './src/services/notifications';

// Debe registrarse antes de que la app cargue
/**
 * Esta función se encarga de configurar el handler para notificaciones push cuando la app está en background o cerrada.
 * Es importante que se registre antes de que la app cargue, para asegurar que las notificaciones push funcionen correctamente incluso cuando la app no está activa.
 * El handler se encargará de manejar las notificaciones recibidas en background o cuando el usuario toque una notificación para abrir la app.
 * Sin esta configuración, las notificaciones push podrían no funcionar correctamente en estas situaciones.
 * Por eso es crucial que esta función se ejecute antes de que cualquier otra parte de la app se cargue, para garantizar una experiencia de usuario consistente con las notificaciones push.
 */
setBackgroundMessageHandler();

import 'expo-router/entry';
