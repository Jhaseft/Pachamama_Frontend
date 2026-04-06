import { View, Text } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export default function SubscriptionEmptyState() {
    return (
        <View className="bg-[#141414] rounded-[20px] border border-white/5 p-8 items-center gap-3">
            <View className="w-16 h-16 rounded-[20px] bg-[#1a0505] items-center justify-center">
                <MaterialCommunityIcons name="crown-outline" size={32} color="#A11B1B" />
            </View>
            <Text className="text-white font-extrabold text-[17px] text-center">
                Sin plan activo
            </Text>
            <Text className="text-zinc-500 text-[13px] text-center leading-5">
                Crea tu plan de suscripción para que tus clientes puedan suscribirse y acceder a contenido exclusivo.
            </Text>
        </View>
    );
}
