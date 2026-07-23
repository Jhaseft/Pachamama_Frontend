import { useEffect, useState } from 'react';
import { View, Text, FlatList, ActivityIndicator, TouchableOpacity, Image, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { apiGetMySubscriptions } from '@/src/api/subscriptions';
import { MySubscription } from '@/src/types/subscriptions';

function SubscriptionCard({ item }: { item: MySubscription }) {
    const router = useRouter();
    const expiresAt = new Date(item.expiresAt);
    const daysLeft = Math.ceil((expiresAt.getTime() - Date.now()) / (1000 * 60 * 60 * 24));

    return (
        <TouchableOpacity
            onPress={() => router.push(`/(cliente)/anfitrionas/${item.anfitrionaId}/verperfil` as any)}
            activeOpacity={0.85}
            className={`rounded-2xl border overflow-hidden mb-3 ${item.isActive ? 'bg-[#141414] border-[#f03eb330]' : 'bg-[#111] border-white/5'}`}
        >
            <View className="flex-row items-center p-4 gap-3">
                {/* Avatar */}
                <View style={{
                    width: 52, height: 52, borderRadius: 26, overflow: 'hidden',
                    borderWidth: 2, borderColor: item.isActive ? '#f03eb3' : '#3f3f46',
                    backgroundColor: '#150a24',
                }}>
                    {item.anfitrionaAvatar ? (
                        <Image source={{ uri: item.anfitrionaAvatar }} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
                    ) : (
                        <View className="flex-1 items-center justify-center">
                            <Text style={{ color: '#a844f2', fontSize: 20, fontWeight: 'bold' }}>
                                {item.anfitrionaName[0]?.toUpperCase() ?? '?'}
                            </Text>
                        </View>
                    )}
                </View>

                {/* Info */}
                <View className="flex-1">
                    <Text className="text-white font-bold text-[15px]" numberOfLines={1}>
                        {item.anfitrionaName}
                    </Text>
                    <Text className="text-zinc-500 text-[12px] mt-0.5">
                        @{item.anfitrionaUsername}
                    </Text>
                    <Text className={`text-[11px] mt-1 font-semibold ${item.isActive ? 'text-[#f03eb3]' : 'text-zinc-600'}`}>
                        {item.isActive
                            ? daysLeft > 0 ? `Vence en ${daysLeft} día${daysLeft !== 1 ? 's' : ''}` : 'Vence hoy'
                            : 'Expirada'}
                    </Text>
                </View>

                {/* Precio + badge */}
                <View className="items-end gap-1">
                    <View className={`rounded-full px-2 py-0.5 ${item.isActive ? 'bg-[#f03eb320]' : 'bg-white/5'}`}>
                        <Text className={`text-[10px] font-bold ${item.isActive ? 'text-[#f03eb3]' : 'text-zinc-600'}`}>
                            {item.isActive ? '● ACTIVA' : '● EXPIRADA'}
                        </Text>
                    </View>
                    <Text className="text-zinc-500 text-[11px]">{item.price} cr/mes</Text>
                </View>
            </View>

            {/* Barra de expiración */}
            {item.isActive && (
                <View className="bg-[#0f0f0f] px-4 py-2 flex-row items-center gap-2 border-t border-white/5">
                    <MaterialCommunityIcons name="calendar-clock" size={13} color="#6b7280" />
                    <Text className="text-zinc-500 text-[11px]">
                        Vence el {expiresAt.toLocaleDateString('es-PE', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </Text>
                </View>
            )}
        </TouchableOpacity>
    );
}

export default function MisSuscripcionesScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const [subs, setSubs] = useState<MySubscription[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const load = async () => {
        try {
            const data = await apiGetMySubscriptions();
            setSubs(data);
        } catch {
            setSubs([]);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => { load(); }, []);

    const onRefresh = () => { setRefreshing(true); load(); };

    const active = subs.filter(s => s.isActive);
    const expired = subs.filter(s => !s.isActive);

    return (
        <View className="flex-1 bg-[#0a0613]">
            {/* Header */}
            <View
                className="flex-row items-center gap-3 px-4 pb-4 border-b border-white/5"
                style={{ paddingTop: insets.top + 12 }}
            >
                <TouchableOpacity
                    onPress={() => router.back()}
                    className="w-10 h-10 rounded-xl bg-[#1a1a1a] items-center justify-center"
                >
                    <MaterialCommunityIcons name="arrow-left" size={20} color="white" />
                </TouchableOpacity>
                <View className="flex-1">
                    <Text className="text-white font-extrabold text-[18px]">Mis suscripciones</Text>
                    <Text className="text-zinc-500 text-[12px] mt-0.5">
                        {active.length} activa{active.length !== 1 ? 's' : ''}
                    </Text>
                </View>
                <MaterialCommunityIcons name="crown" size={22} color="#f03eb3" />
            </View>

            {loading ? (
                <View className="flex-1 items-center justify-center">
                    <ActivityIndicator size="large" color="#a844f2" />
                </View>
            ) : (
                <FlatList
                    data={subs}
                    keyExtractor={item => item.subscriptionId}
                    contentContainerStyle={{ padding: 16, paddingBottom: insets.bottom + 32 }}
                    showsVerticalScrollIndicator={false}
                    refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#a844f2" />}
                    ListHeaderComponent={
                        subs.length > 0 && expired.length > 0 && active.length > 0 ? (
                            <Text className="text-zinc-500 text-[11px] uppercase tracking-widest mb-3">
                                Activas · {active.length}
                            </Text>
                        ) : null
                    }
                    ListEmptyComponent={
                        <View className="items-center justify-center py-16 gap-3">
                            <View className="w-16 h-16 rounded-[20px] bg-[#150a24] items-center justify-center">
                                <MaterialCommunityIcons name="crown-outline" size={32} color="#a844f2" />
                            </View>
                            <Text className="text-white font-bold text-[16px]">Sin suscripciones</Text>
                            <Text className="text-zinc-500 text-[13px] text-center px-8">
                                Aún no te has suscrito a ningún creador de contenido.
                            </Text>
                        </View>
                    }
                    renderItem={({ item, index }) => (
                        <>
                            {item.isActive === false && index > 0 && subs[index - 1].isActive === true && (
                                <Text className="text-zinc-500 text-[11px] uppercase tracking-widest mb-3 mt-2">
                                    Expiradas · {expired.length}
                                </Text>
                            )}
                            <SubscriptionCard item={item} />
                        </>
                    )}
                />
            )}
        </View>
    );
}
