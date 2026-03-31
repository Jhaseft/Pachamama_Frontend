import messaging from '@react-native-firebase/messaging';
import { Platform } from 'react-native';
import { apiUpdateFcmToken } from '../api/userProfile';

// SOLICITAR PERMISOS Y REGISTRAR TOKEN
export const registerForPushNotifications = async (): Promise<void> => {
    try {
        const authStatus = await messaging().requestPermission();
        const enabled =
            authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
            authStatus === messaging.AuthorizationStatus.PROVISIONAL;

        if (!enabled) {
            console.log('Permisos de notificación denegados');
            return;
        }

        // En Android el registro es automático, en iOS necesita esto
        if (Platform.OS === 'ios') {
            await messaging().registerDeviceForRemoteMessages();
        }

        const fcmToken = await messaging().getToken();
        if (fcmToken) {
            await apiUpdateFcmToken(fcmToken);
            console.log('FCM Token registrado:', fcmToken);
        }

        // Si el token se refresca, actualizarlo en el backend
        messaging().onTokenRefresh(async (newToken) => {
            await apiUpdateFcmToken(newToken);
        });

    } catch (error) {
        console.error('Error registrando notificaciones:', error);
    }
};

// MANEJAR NOTIFICACIONES EN FOREGROUND
export const setupForegroundNotificationHandler = (): (() => void) => {
    const unsubscribe = messaging().onMessage(async (remoteMessage) => {
        console.log('Notificación en foreground:', remoteMessage);
        // Aquí puedes mostrar un toast o alerta personalizada
    });
    return unsubscribe;
};

// MANEJAR NOTIFICACIONES EN BACKGROUND/QUIT (tap del usuario)
export const setupBackgroundNotificationHandler = (): void => {
    // Cuando la app está cerrada y el usuario toca la notificación
    messaging()
        .getInitialNotification()
        .then((remoteMessage) => {
            if (remoteMessage) {
                console.log('App abierta desde notificación (quit):', remoteMessage.data);
            }
        });

    // Cuando la app está en background y el usuario toca la notificación
    messaging().onNotificationOpenedApp((remoteMessage) => {
        console.log('App abierta desde notificación (background):', remoteMessage.data);
    });
};

// HANDLER DE BACKGROUND (debe registrarse fuera del componente, en index.js o _layout.tsx)
export const setBackgroundMessageHandler = (): void => {
    messaging().setBackgroundMessageHandler(async (remoteMessage) => {
        console.log('Notificación recibida en background:', remoteMessage);
    });
};
