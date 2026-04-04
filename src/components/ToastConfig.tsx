import React from 'react';
import { View, Text } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { BaseToastProps } from 'react-native-toast-message';

// CONFIGURACIÓN DE ICONOS POR TIPO
const iconConfig = {
    success: { name: 'check-circle',  color: '#00ff88', bg: '#0d1f0d', border: '#00ff88' },
    error:   { name: 'close-circle',  color: '#ff3b5c', bg: '#1a0505', border: '#ff3b5c' },
    info:    { name: 'information',   color: '#60a5fa', bg: '#0d1a2e', border: '#60a5fa' },
};

// COMPONENTE BASE DEL TOAST
function CustomToast({ text1, text2, type = 'info' }: BaseToastProps & { type?: string }) {
    const config = iconConfig[type as keyof typeof iconConfig] ?? iconConfig.info;

    return (
        <View
            style={{
                backgroundColor: config.bg,
                borderLeftWidth: 4,
                borderLeftColor: config.border,
                borderRadius: 14,
                paddingHorizontal: 14,
                paddingVertical: 12,
                marginHorizontal: 16,
                flexDirection: 'row',
                alignItems: 'center',
                gap: 12,
                shadowColor: config.border,
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.3,
                shadowRadius: 8,
                elevation: 6,
                borderWidth: 1,
                borderColor: config.border + '30',
            }}
        >
            <MaterialCommunityIcons name={config.name as any} size={26} color={config.color} />
            <View style={{ flex: 1 }}>
                <Text style={{ color: 'white', fontWeight: '800', fontSize: 14, letterSpacing: 0.3 }}>
                    {text1}
                </Text>
                {!!text2 && (
                    <Text style={{ color: '#9ca3af', fontSize: 12, marginTop: 2 }}>
                        {text2}
                    </Text>
                )}
            </View>
        </View>
    );
}

// EXPORTAR CONFIG PARA PASAR AL COMPONENTE <Toast />
export const toastConfig = {
    success: (props: BaseToastProps) => <CustomToast {...props} type="success" />,
    error:   (props: BaseToastProps) => <CustomToast {...props} type="error" />,
    info:    (props: BaseToastProps) => <CustomToast {...props} type="info" />,
};
