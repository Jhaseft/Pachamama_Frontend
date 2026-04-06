import { View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { SubscriptionPlan } from '../../../types/subscriptions';

interface Props {
    plan: SubscriptionPlan;
    toggling: boolean;
    onToggle: () => void;
}

export default function SubscriptionStatusCard({ plan, toggling, onToggle }: Props) {
    const isActive = plan.isActive;

    return (
        <View className={`rounded-[20px] p-5 gap-4 border ${isActive ? 'bg-[#141414] border-[#F6C16A40]' : 'bg-[#141414] border-white/10'}`}>

            {/* Estado */}
            <View className="flex-row items-center justify-between">
                <View className="flex-row items-center gap-3">
                    <View className={`w-11 h-11 rounded-xl items-center justify-center ${isActive ? 'bg-[#2a1a00]' : 'bg-[#1a0505]'}`}>
                        <MaterialCommunityIcons
                            name={isActive ? 'crown' : 'crown-outline'}
                            size={22}
                            color={isActive ? '#F6C16A' : '#6b7280'}
                        />
                    </View>
                    <View>
                        <Text className="text-white font-bold text-[18px]">Mi plan</Text>
                    </View>
                </View>

                <View className={`rounded-full px-3 py-1 border ${isActive ? 'bg-[#F6C16A20] border-[#F6C16A60]' : 'bg-white/5 border-white/10'}`}>
                    <Text className={`text-[11px] font-bold ${isActive ? 'text-[#F6C16A]' : 'text-zinc-500'}`}>
                        {isActive ? '● ACTIVO' : '● INACTIVO'}
                    </Text>
                </View>
            </View>

            {/* Precio */}
            <View className="bg-[#0f0f0f] rounded-xl p-4 flex-row items-center gap-3">
                <MaterialCommunityIcons name="tag-outline" size={18} color="#A11B1B" />
                <View>
                    <Text className="text-zinc-500 text-[10px] uppercase tracking-widest">Precio mensual</Text>
                    <Text className="text-white text-[22px] font-black mt-0.5">
                        {plan.price}
                        <Text className="text-zinc-500 text-[13px] font-normal"> créditos/mes</Text>
                    </Text>
                </View>
            </View>

            {/* Toggle */}
            <TouchableOpacity
                onPress={onToggle}
                disabled={toggling}
                activeOpacity={0.8}
                className={`rounded-xl py-4 items-center justify-center flex-row gap-2 border ${
                    isActive ? 'bg-[#1a0505] border-[#A11B1B]' : 'bg-[#0d1a00] border-green-500/40'
                }`}
            >
                {toggling ? (
                    <ActivityIndicator size={16} color={isActive ? '#ef4444' : '#22c55e'} />
                ) : (
                    <MaterialCommunityIcons
                        name={isActive ? 'pause-circle-outline' : 'play-circle-outline'}
                        size={20}
                        color={isActive ? '#ef4444' : '#22c55e'}
                    />
                )}
                <Text className={`font-bold text-[14px] ${isActive ? 'text-red-500' : 'text-green-500'}`}>
                    {isActive ? 'Desactivar plan' : 'Activar plan'}
                </Text>
            </TouchableOpacity>
        </View>
    );
}
