import { useEffect, useRef, useState, useCallback } from 'react';
import { View, Text, Pressable, ActivityIndicator, Animated, Easing } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router, useFocusEffect } from 'expo-router';
import { apiGetMyPlan } from '../../api/subscriptions';
import { SubscriptionPlan } from '../../types/subscriptions';

const GOLD_BORDER = [
    '#F6C16A', '#FFE5A0', '#F6C16A', '#C9933A',
    '#8B5E1A', '#C9933A', '#FFE5A0', '#F6C16A', '#F6C16A',
] as const;

const GRAY_BORDER = [
    '#3f3f46', '#52525b', '#3f3f46', '#27272a',
    '#18181b', '#27272a', '#52525b', '#3f3f46', '#3f3f46',
] as const;

function AnimatedBorderCard({ children, borderColors, borderRadius = 16 }: {
    children: React.ReactNode;
    borderColors: readonly string[];
    borderRadius?: number;
}) {
    const spin = useRef(new Animated.Value(0)).current;
    useEffect(() => {
        Animated.loop(
            Animated.timing(spin, { toValue: 1, duration: 3000, easing: Easing.linear, useNativeDriver: true })
        ).start();
    }, [spin]);
    const rotate = spin.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });

    return (
        <View style={{ borderRadius, padding: 2, overflow: 'hidden' }}>
            <Animated.View style={{
                position: 'absolute', width: 600, height: 600,
                top: '50%', left: '50%', marginTop: -300, marginLeft: -300,
                transform: [{ rotate }],
            }}>
                <LinearGradient colors={borderColors as any} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={{ flex: 1 }} />
            </Animated.View>
            {children}
        </View>
    );
}

export default function SubscriptionBanner() {
    const [plan, setPlan] = useState<SubscriptionPlan | null>(null);
    const [loading, setLoading] = useState(true);

    // Glow pulsante solo cuando está activo
    const pulse = useRef(new Animated.Value(0.3)).current;
    useEffect(() => {
        Animated.loop(
            Animated.sequence([
                Animated.timing(pulse, { toValue: 0.7, duration: 1200, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
                Animated.timing(pulse, { toValue: 0.3, duration: 1200, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
            ])
        ).start();
    }, [pulse]);

    useEffect(() => {
        // animación del glow
    }, [pulse]);

    useFocusEffect(useCallback(() => {
        setLoading(true);
        apiGetMyPlan()
            .then(setPlan)
            .catch(() => setPlan(null))
            .finally(() => setLoading(false));
    }, []));


    const isActive = plan?.isActive ?? false;
    const borderColors = isActive ? GOLD_BORDER : GRAY_BORDER;

    return (
        <Pressable
            onPress={() => router.push('/(anfitriona)/subcripcion')}
            className="mb-7"
            style={({ pressed }) => ({ opacity: pressed ? 0.8 : 1 })}
        >
            {/* Glow exterior solo si activo */}
            {isActive && (
                <Animated.View
                    pointerEvents="none"
                    style={{
                        position: 'absolute', top: -6, left: -6, right: -6, bottom: -6,
                        borderRadius: 22, backgroundColor: '#F6C16A', opacity: pulse,
                    }}
                />
            )}

            <AnimatedBorderCard borderColors={borderColors} borderRadius={16}>
                <LinearGradient
                    colors={isActive ? ['#1a1000', '#2a1a00', '#1a1000'] : ['#141414', '#1a1a1a', '#141414']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={{ borderRadius: 14, paddingHorizontal: 16, paddingVertical: 14 }}
                >
                    <View className="flex-row items-center gap-3">
                        {/* Ícono */}
                        <View className={`w-11 h-11 rounded-xl items-center justify-center ${isActive ? 'bg-[#3a2200]' : 'bg-[#1a1a1a]'}`}>
                            {loading ? (
                                <ActivityIndicator size={16} color="#F6C16A" />
                            ) : (
                                <MaterialCommunityIcons
                                    name="crown"
                                    size={22}
                                    color={isActive ? '#F6C16A' : '#52525b'}
                                />
                            )}
                        </View>

                        {/* Texto */}
                        <View className="flex-1">
                            {loading ? (
                                <Text className="text-zinc-500 text-[13px]">Cargando plan...</Text>
                            ) : plan ? (
                                <>
                                    <Text style={{ color: isActive ? '#F6C16A' : '#a1a1aa', fontWeight: '800', fontSize: 14 }}>
                                        {isActive ? '✦ Plan activo' : 'Plan inactivo'}
                                    </Text>
                                    <Text className="text-zinc-500 text-[12px] mt-0.5">
                                        {plan.price} créditos / mes
                                    </Text>
                                </>
                            ) : (
                                <>
                                    <Text className="text-zinc-400 font-bold text-[14px]">Sin plan de suscripción</Text>
                                    <Text className="text-zinc-600 text-[12px] mt-0.5">Crea uno para monetizar más 💰</Text>
                                </>
                            )}
                        </View>

                        {/* Badge + flecha */}
                        <View className="items-end gap-1">
                            {!loading && plan && (
                                <View style={{
                                    backgroundColor: isActive ? '#F6C16A25' : '#ffffff10',
                                    borderRadius: 99, paddingHorizontal: 8, paddingVertical: 3,
                                    borderWidth: 1, borderColor: isActive ? '#F6C16A50' : '#ffffff15',
                                }}>
                                    <Text style={{ color: isActive ? '#F6C16A' : '#52525b', fontSize: 10, fontWeight: '700' }}>
                                        {isActive ? '● ON' : '● OFF'}
                                    </Text>
                                </View>
                            )}
                            <MaterialCommunityIcons name="chevron-right" size={16} color={isActive ? '#F6C16A60' : '#3f3f46'} />
                        </View>
                    </View>
                </LinearGradient>
            </AnimatedBorderCard>
        </Pressable>
    );
}
