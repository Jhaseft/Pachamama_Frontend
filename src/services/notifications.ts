import messaging from '@react-native-firebase/messaging';
import { Platform } from 'react-native';
import { apiUpdateFcmToken } from '../api/userProfile';
import Toast from 'react-native-toast-message';
import { displayIncomingCall } from './callkeep';
import notifee, { AndroidImportance } from '@notifee/react-native';

// Ref global para saber qué conversación está activa
// Se actualiza desde ChatScreen al entrar/salir
export const activeChatRef = { current: null as string | null };

// Ref global para saber en qué pantalla está la anfitriona
// Se actualiza desde chats.tsx y chat/[conversationId].tsx
export const anfitrionaChatScreenRef = { current: false };

// SOLICITAR PERMISOS Y REGISTRAR TOKEN
// Pide permiso al usuario, obtiene el FCM token y lo guarda en el backend
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
// Se activa cuando la app está ABIERTA y llega una notificación
// Firebase no muestra nada automáticamente en foreground, así que lo hacemos nosotros con Toast
export const setupForegroundNotificationHandler = (): (() => void) => {

    // Mapa de tipos — define qué color de Toast mostrar según el tipo de notificación
    // El backend envía el 'type' dentro del campo data del mensaje
    // 'success' = verde, 'error' = rojo, 'info' = azul
    const toastConfig: Record<string, 'success' | 'error' | 'info'> = {
        WITHDRAWAL_APPROVED: 'success',
        WITHDRAWAL_REJECTED: 'error',
        NEW_MESSAGE:         'info',// mensaje nuevo normal
        NEW_LOCKED_MESSAGE:   'info', //mensage bloqueado, se muestra como info aunque es un mensaje nuevo
        MESSAGE_UNLOCKED:     'success',// mensaje desbloqueado, se muestra como success aunque es un mensaje nuevo
        INCOMING_CALL:       'info',// llamada entrante, se muestra como info aunque es un mensaje nuevo
        CALL_ACEPTED:       'success',// llamada aceptada, se muestra como success aunque es un mensaje nuevo
        CALL_REJECTED:       'error',// llamada rechazada, se muestra como error aunque es un mensaje nuevo
        CALL_BILLED:         'info',// llamada facturada, se muestra como info aunque es un mensaje nuevo
    };

    const unsubscribe = messaging().onMessage(async (remoteMessage) => {
        const type = remoteMessage.data?.type as string;
        const title = remoteMessage.notification?.title ?? 'Notificación';
        const body = remoteMessage.notification?.body ?? '';

        // Si es mensaje nuevo (normal o bloqueado) y el usuario está viendo esa conversación, no mostrar Toast
        if (
            (type === 'NEW_MESSAGE' || type === 'NEW_LOCKED_MESSAGE') &&
            activeChatRef.current === remoteMessage.data?.conversationId
        ) return;

        // Si la anfitriona está en chats o dentro de un chat, ignorar notificaciones de llamada
        if (
            (type === 'INCOMING_CALL' || type === 'CALL_ACEPTED' || type === 'CALL_REJECTED') &&
            anfitrionaChatScreenRef.current
        ) return;

        // INCOMING_CALL nunca se muestra en foreground — el UI de llamada entrante ya aparece en la app
        if (type === 'INCOMING_CALL') return;

        Toast.show({
            type: toastConfig[type] ?? 'info',
            text1: title,
            text2: body,
            position: 'top',
            visibilityTime: 4000,
            topOffset: 60,
        });

        // Reproducir sonido del sistema con notifee
        // En foreground Firebase no reproduce sonido, notifee lo hace por nosotros
        const channelId = await notifee.createChannel({
            id: 'default',
            name: 'Notificaciones',
            importance: AndroidImportance.HIGH, // HIGH activa sonido y vibración
            sound: 'default',                   // usa el sonido del sistema
        });

        await notifee.displayNotification({
            title,
            body,
            android: {
                channelId,
                sound: 'default',
                importance: AndroidImportance.HIGH,
                smallIcon: 'ic_launcher',
            },
        });
    });

    // Retorna función para cancelar el listener (se llama en el useEffect cleanup)
    return unsubscribe;
};

// MANEJAR NOTIFICACIONES EN BACKGROUND/QUIT
// Se activa cuando el usuario toca la notificación para abrir la app
export const setupBackgroundNotificationHandler = (): void => {
    // Cuando la app está CERRADA y el usuario toca la notificación
    messaging()
        .getInitialNotification()
        .then((remoteMessage) => {
            if (remoteMessage) {
                console.log('App abierta desde notificación (quit):', remoteMessage.data);
            }
        });

    // Cuando la app está en BACKGROUND y el usuario toca la notificación
    messaging().onNotificationOpenedApp((remoteMessage) => {
        console.log('App abierta desde notificación (background):', remoteMessage.data);
    });
};

// HANDLER DE BACKGROUND
// Procesa mensajes cuando la app está cerrada — debe registrarse en index.js antes de que la app cargue
export const setBackgroundMessageHandler = (): void => {
    messaging().setBackgroundMessageHandler(async (remoteMessage) => {
        console.log('Notificación recibida en background:', remoteMessage);

        const type = remoteMessage.data?.type as string;

        // Si es llamada entrante, mostrar pantalla nativa de llamada con sonido
        if (type === 'INCOMING_CALL') {
            const callId    = remoteMessage.data?.callId as string;
            const callerName = remoteMessage.data?.callerName as string ?? 'Cliente';
            const isVideo   = remoteMessage.data?.callType === 'VIDEO_CALL';

            // Muestra la pantalla nativa del sistema (como WhatsApp)
            // con botones de Aceptar/Rechazar y sonido de ringtone
            displayIncomingCall(callId, callerName, isVideo);
        }
    });
};
