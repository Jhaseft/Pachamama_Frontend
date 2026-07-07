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
        <View className={`rounded-[20px] p-5 gap-4 border ${isActive ? 'border-[#a844f2]/30' : 'border-white/10'}`} style={{ backgroundColor: '#0d1428' }}>

            {/* Estado */}
            <View className="flex-row items-center justify-between">
                <View className="flex-row items-center gap-3">
                    <View className={`w-11 h-11 rounded-xl items-center justify-center ${isActive ? 'bg-[#a844f2]/15' : 'bg-[#2a2a5a]'}`}>
                        <MaterialCommunityIcons
                            name={isActive ? 'crown' : 'crown-outline'}
                            size={22}
                            color={isActive ? '#f03eb3' : '#6b7280'}
                        />
                    </View>
                    <View>
                        <Text className="text-white font-bold text-[18px]">Mi plan</Text>
                    </View>
                </View>

                <View className={`rounded-full px-3 py-1 border ${isActive ? 'bg-[#a844f2]/20 border-[#a844f2]/50' : 'bg-white/5 border-white/10'}`}>
                    <Text className={`text-[11px] font-bold ${isActive ? 'text-[#f03eb3]' : 'text-zinc-500'}`}>
                        {isActive ? '● ACTIVO' : '● INACTIVO'}
                    </Text>
                </View>
            </View>

            {/* Precio */}
            <View className="rounded-xl p-4 flex-row items-center gap-3" style={{ backgroundColor: '#000000' }}>
                <MaterialCommunityIcons name="tag-outline" size={18} color="#a844f2" />
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
                    isActive ? 'border-[#a844f2]/40' : 'border-green-500/40'
                }`}
                style={{ backgroundColor: isActive ? 'rgba(168,68,242,0.1)' : 'rgba(34,197,94,0.05)' }}
            >
                {toggling ? (
                    <ActivityIndicator size={16} color={isActive ? '#a844f2' : '#22c55e'} />
                ) : (
                    <MaterialCommunityIcons
                        name={isActive ? 'pause-circle-outline' : 'play-circle-outline'}
                        size={20}
                        color={isActive ? '#a844f2' : '#22c55e'}
                    />
                )}
                <Text className={`font-bold text-[14px] ${isActive ? 'text-[#a844f2]' : 'text-green-500'}`}>
                    {isActive ? 'Desactivar plan' : 'Activar plan'}
                </Text>
            </TouchableOpacity>
        </View>
    );
}
