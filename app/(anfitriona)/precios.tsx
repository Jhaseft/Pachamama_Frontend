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

      <View className="flex-row items-center justify-between px-4 py-3">
        <TouchableOpacity onPress={() => router.back()} className="flex-row items-center gap-2">
          <AntDesign name="arrow-left" size={22} color="white" />
          <Text className="text-white text-xl font-black">Configurar Precios</Text>
        </TouchableOpacity>

      </View>

      <ScrollView className="flex-1 px-4" showsVerticalScrollIndicator={false}>
        <View className="gap-3 mt-2">
          {SERVICES.map((service) => (
            <View key={service.type} className="bg-red-600 rounded-2xl px-4 py-4">

              <View className="flex-row items-center gap-2 mb-1">
                {service.icon}
                <Text className="text-white text-base font-bold">{service.label}</Text>
              </View>
              <Text className="text-white/80 text-xs mb-3">{service.description}</Text>


              <View className="flex-row items-center gap-2">
                <Text className="text-white font-semibold text-sm">S/</Text>
                <TextInput
                  className="flex-1 bg-white rounded-xl px-3 py-2 text-black font-semibold text-sm"
                  keyboardType="numeric"
                  placeholder="0"
                  placeholderTextColor="#9ca3af"
                  value={prices[service.type]}
                  onChangeText={(val) =>
                    setPrices((prev) => ({ ...prev, [service.type]: val }))
                  }
                />
                <Text className="text-white font-semibold text-sm">{service.unit}</Text>
              </View>
            </View>
          ))}
        </View>

        <View style={{ height: 30 }} />
      </ScrollView>


      <View className="px-4 pb-6" style={{ paddingBottom: insets.bottom + 16 }}>
        <TouchableOpacity
          onPress={handleSave}
          disabled={saving}
          className="bg-white rounded-2xl py-4 items-center"
        >
          {saving ? (
            <ActivityIndicator color="#000" />
          ) : (
            <Text className="text-black text-base font-black">Guardar Cambios</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}
