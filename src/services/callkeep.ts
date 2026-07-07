import RNCallKeep from 'react-native-callkeep';
import { Platform } from 'react-native';

// CONFIGURACIÓN INICIAL DE CALLKEEP
// Debe llamarse una vez al iniciar la app (en _layout.tsx o AuthContext)
export const setupCallKeep = async (): Promise<void> => {
    try {
        await RNCallKeep.setup({
            ios: {
                appName: 'MonetizaLab', // nombre que aparece en la pantalla de llamada
            },
            // En Android, se muestra un diálogo pidiendo permisos para mostrar llamadas entrantes sobre otras apps
            android: {
                alertTitle: 'Permisos requeridos',
                alertDescription: 'MonetizaLab necesita acceso para mostrar llamadas entrantes',
                cancelButton: 'Cancelar',
                okButton: 'Aceptar',
                additionalPermissions: [],
                selfManaged: true,
            },
        });

        // En Android, registra la app como manejador de llamadas
        if (Platform.OS === 'android') {
            RNCallKeep.registerPhoneAccount({
                ios: { appName: 'MonetizaLab' },
                android: {
                    alertTitle: 'Permisos requeridos',
                    alertDescription: 'MonetizaLab necesita acceso para mostrar llamadas entrantes',
                    cancelButton: 'Cancelar',
                    okButton: 'Aceptar',
                    additionalPermissions: [],
                    selfManaged: true,
                },
            });
            RNCallKeep.registerAndroidEvents();
        }

        console.log('CallKeep configurado correctamente');
    } catch (error) {
        console.error('Error configurando CallKeep:', error);
    }
};

// MOSTRAR PANTALLA NATIVA DE LLAMADA ENTRANTE
// Se llama cuando llega una notificación INCOMING_CALL con la app cerrada/background
export const displayIncomingCall = (callId: string, callerName: string, isVideo: boolean): void => {
    // Muestra la pantalla nativa del sistema operativo con:
    // Nombre del llamante
    // Botones de Aceptar y Rechazar
    // Sonido de ringtone del sistema
    RNCallKeep.displayIncomingCall(
        callId,           // UUID único de la llamada
        callerName,       // número o nombre que aparece en pantalla
        callerName,       // nombre a mostrar
        'generic',        // tipo de handle (generic = nombre, number = teléfono)
        isVideo,          // true = videollamada, false = llamada de voz
    );
};

// TERMINAR LA LLAMADA EN CALLKEEP
// Se llama cuando la llamada es rechazada o termina
export const endCallKeep = (callId: string): void => {
    RNCallKeep.endCall(callId);
};

// ESCUCHAR CUANDO EL USUARIO ACEPTA DESDE LA PANTALLA NATIVA
export const onCallKeepAnswer = (cb: (callId: string) => void): void => {
    RNCallKeep.addEventListener('answerCall', ({ callUUID }) => {
        cb(callUUID);
    });
};

// ESCUCHAR CUANDO EL USUARIO RECHAZA DESDE LA PANTALLA NATIVA
export const onCallKeepEnd = (cb: (callId: string) => void): void => {
    RNCallKeep.addEventListener('endCall', ({ callUUID }) => {
        cb(callUUID);
    });
};

// LIMPIAR LISTENERS
export const removeCallKeepListeners = (): void => {
    RNCallKeep.removeEventListener('answerCall');
    RNCallKeep.removeEventListener('endCall');
};
