import { setBackgroundMessageHandler } from './src/services/notifications';

// Debe registrarse antes de que la app cargue
setBackgroundMessageHandler();

import 'expo-router/entry';
