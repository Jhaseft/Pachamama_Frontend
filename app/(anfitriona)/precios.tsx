import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  Image,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { AntDesign, MaterialCommunityIcons, FontAwesome5, Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import {
  apiGetMyServicePrices,
  apiUpsertServicePrice,
  type ServiceType,
} from '@/src/api/servicePrices';

type ServiceConfig = {
  type: ServiceType;
  label: string;
  description: string;
  unit: string;
  icon: React.ReactNode;
};

const SERVICES: ServiceConfig[] = [
  {
    type: 'MESSAGE_SEND',
    label: 'Costo por mensaje',
    description: 'Créditos que el cliente paga al enviarte un mensaje',
    unit: 'créditos',
    icon: <MaterialCommunityIcons name="message-text" size={24} color="white" />,
  },
  {
    type: 'MESSAGE',
    label: 'Regalo',
    description: 'Por cada regalo enviado al cliente',
    unit: 'créditos',
    icon: <MaterialCommunityIcons name="gift" size={24} color="white" />,
  },
  {
    type: 'CALL',
    label: 'Llamada',
    description: 'Por minuto de llamada',
    unit: 'por minuto',
    icon: <FontAwesome5 name="phone-alt" size={22} color="white" />,
  },
  {
    type: 'VIDEO_CALL',
    label: 'Video Llamada',
    description: 'Por minuto de videollamada',
    unit: 'por minuto',
    icon: <Ionicons name="videocam" size={24} color="white" />,
  },
];

export default function Precios() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [prices, setPrices] = useState<Record<ServiceType, string>>({
    MESSAGE_SEND: '',
    MESSAGE: '',
    CALL: '',
    VIDEO_CALL: '',
  });

  useEffect(() => {
    void loadPrices();
  }, []);

  const loadPrices = async () => {
    try {
      const data = await apiGetMyServicePrices();
      const mapped: Record<ServiceType, string> = { MESSAGE_SEND: '', MESSAGE: '', CALL: '', VIDEO_CALL: '' };
      data.forEach((sp) => {
        mapped[sp.serviceType] = String(sp.price);
      });
      setPrices(mapped);
    } catch {
      Alert.alert('Error', 'No se pudieron cargar los precios.');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    for (const service of SERVICES) {
      const val = prices[service.type];
      if (val === '') continue;
      const num = Number(val);
      const minVal = service.type === 'MESSAGE_SEND' ? 0 : 1;
      if (isNaN(num) || num < minVal) {
        const msg = service.type === 'MESSAGE_SEND'
          ? `El precio de "${service.label}" debe ser un número mayor o igual a 0.`
          : `El precio de "${service.label}" debe ser un número mayor a 0.`;
        Alert.alert('Error', msg);
        return;
      }
    }

    setSaving(true);
    try {
      await Promise.all(
        SERVICES.filter((s) => prices[s.type] !== '').map((s) =>
          apiUpsertServicePrice(s.type, Number(prices[s.type])),
        ),
      );

      Alert.alert('¡Listo!', 'Precios guardados correctamente.');
      router.back();
    } catch (error) {
      console.error('Error guardando precios:', error);

      Alert.alert(
        'Error',
        'No se pudieron guardar los precios.',
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View className="flex-1 bg-black justify-center items-center">
        <ActivityIndicator size="large" color="#ef4444" />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-black" style={{ paddingTop: insets.top }}>
      <LinearGradient
        colors={['#1a0a2e', '#0f0f1e']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{ paddingHorizontal: 16, paddingVertical: 12 }}
      >
        <TouchableOpacity onPress={() => router.back()} className="flex-row items-center gap-2">
          <AntDesign name="arrow-left" size={22} color="#a844f2" />
          <Text className="text-white text-lg font-black tracking-wide">CONFIGURAR PRECIOS</Text>
        </TouchableOpacity>
      </LinearGradient>

      <ScrollView className="flex-1 px-4" showsVerticalScrollIndicator={false}>
        <View className="gap-4 mt-4">
          {SERVICES.map((service, index) => {
            const colorSchemes = [
              { border: '#132673', gradient: ['#132673', '#0a1a4d'] },
              { border: '#a844f2', gradient: ['#a844f2', '#7a2fb0'] },
              { border: '#f03eb3', gradient: ['#f03eb3', '#c02a8a'] },
              { border: '#132673', gradient: ['#132673', '#0a1a4d'] },
            ];
            const colorConfig = colorSchemes[index % colorSchemes.length];

            return (
              <View
                key={service.type}
                style={{
                  borderLeftWidth: 4,
                  borderLeftColor: colorConfig.border,
                  backgroundColor: 'rgba(255, 255, 255, 0.05)',
                  borderRadius: 16,
                  paddingHorizontal: 16,
                  paddingVertical: 14,
                }}
              >
                <View className="flex-row items-center gap-3 mb-2">
                  {React.cloneElement(service.icon as React.ReactElement<any>, {
                    color: colorConfig.border,
                  })}
                  <Text className="text-white text-sm font-bold tracking-wide">{service.label.toUpperCase()}</Text>
                </View>
                <Text className="text-white/70 text-xs mb-3 leading-4">{service.description}</Text>

                <View className="flex-row items-center gap-2">
                  <Text className="text-white/80 font-semibold text-sm">S/</Text>
                  <TextInput
                    style={{
                      flex: 1,
                      backgroundColor: 'rgba(255, 255, 255, 0.08)',
                      borderRadius: 10,
                      paddingHorizontal: 12,
                      paddingVertical: 8,
                      color: '#fff',
                      fontWeight: '600',
                      fontSize: 14,
                      borderWidth: 1,
                      borderColor: colorConfig.border,
                    }}
                    keyboardType="numeric"
                    placeholder="0"
                    placeholderTextColor="#6b7280"
                    value={prices[service.type]}
                    onChangeText={(val) =>
                      setPrices((prev) => ({ ...prev, [service.type]: val }))
                    }
                  />
                  <Text className="text-white/80 font-semibold text-sm">{service.unit}</Text>
                </View>
              </View>
            );
          })}
        </View>

        <View style={{ height: 30 }} />
      </ScrollView>

      <View className="px-4 pb-6" style={{ paddingBottom: insets.bottom + 16 }}>
        <LinearGradient
          colors={['#f03eb3', '#a844f2']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{ borderRadius: 16 }}
        >
          <TouchableOpacity
            onPress={handleSave}
            disabled={saving}
            style={{ paddingVertical: 14, alignItems: 'center' }}
          >
            {saving ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text className="text-white text-base font-black tracking-wide">GUARDAR CAMBIOS</Text>
            )}
          </TouchableOpacity>
        </LinearGradient>
      </View>
    </View>
  );
}
