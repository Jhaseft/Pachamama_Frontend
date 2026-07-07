import { useEffect, useState } from 'react';
import { View, Text, ScrollView, Alert, ActivityIndicator, RefreshControl, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { apiGetMyPlan, apiUpsertMyPlan, apiToggleMyPlan } from '@/src/api/subscriptions';
import { SubscriptionPlan } from '@/src/types/subscriptions';
import SubscriptionStatusCard from '@/src/components/anfitriona/subscription/SubscriptionStatusCard';
import SubscriptionPriceForm from '@/src/components/anfitriona/subscription/SubscriptionPriceForm';
import SubscriptionEmptyState from '@/src/components/anfitriona/subscription/SubscriptionEmptyState';

export default function SubscriptionScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();

    const [plan, setPlan] = useState<SubscriptionPlan | null>(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [toggling, setToggling] = useState(false);
    const [saving, setSaving] = useState(false);

    const loadPlan = async () => {
        try {
            const data = await apiGetMyPlan();
            setPlan(data);
        } catch {
            setPlan(null);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => { loadPlan(); }, []);

    const onRefresh = () => { setRefreshing(true); loadPlan(); };

    const handleSave = async (price: number) => {
        setSaving(true);
        try {
            const updated = await apiUpsertMyPlan(price);
            setPlan(updated);
            Alert.alert('✅ Listo', plan ? 'Precio actualizado correctamente.' : 'Plan creado correctamente.');
        } catch (e: any) {
            Alert.alert('Error', e?.message ?? 'No se pudo guardar el plan.');
        } finally {
            setSaving(false);
        }
    };

    const handleToggle = async () => {
        if (!plan) return;
        setToggling(true);
        try {
            const res = await apiToggleMyPlan();
            setPlan(prev => prev ? { ...prev, isActive: res.isActive } : prev);
        } catch (e: any) {
            Alert.alert('Error', e?.message ?? 'No se pudo cambiar el estado.');
        } finally {
            setToggling(false);
        }
    };

    return (
        <View className="flex-1 bg-[#000000]">

            {/* Header */}
            <View
                className="flex-row items-center gap-3 px-4 pb-4 border-b border-white/5"
                style={{ paddingTop: insets.top + 12 }}
            >
                <TouchableOpacity
                    onPress={() => router.back()}
                    className="w-10 h-10 rounded-xl bg-[#1a2d5a] items-center justify-center"
                >
                    <MaterialCommunityIcons name="arrow-left" size={20} color="white" />
                </TouchableOpacity>
                <View className="flex-1">
                    <Text className="text-white font-extrabold text-[18px]">Suscripciones</Text>
                    <Text className="text-zinc-500 text-[12px] mt-0.5">Gestiona tu plan mensual</Text>
                </View>
                <MaterialCommunityIcons name="crown" size={22} color="#f03eb3" />
            </View>

            {loading ? (
                <View className="flex-1 items-center justify-center">
                    <ActivityIndicator size="large" color="#a844f2" />
                </View>
            ) : (
                <ScrollView
                    className="flex-1"
                    contentContainerStyle={{ padding: 16, gap: 16, paddingBottom: 60 }}
                    showsVerticalScrollIndicator={false}
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#a844f2" />
                    }
                >
                    {/* Info banner */}
                    <View className="rounded-2xl border border-[#a844f2]/25 p-4 flex-row items-start gap-3" style={{ backgroundColor: 'rgba(168,68,242,0.08)' }}>
                        <MaterialCommunityIcons name="information-outline" size={18} color="#a844f2" style={{ marginTop: 1 }} />
                        <Text className="text-white/60 text-[12px] flex-1 leading-5">
                            Los clientes que se suscriban pagarán el precio mensual en créditos y tendrán acceso a tu contenido exclusivo.
                        </Text>
                    </View>

                    {plan ? (
                        <SubscriptionStatusCard
                            plan={plan}
                            toggling={toggling}
                            onToggle={handleToggle}
                        />
                    ) : (
                        <SubscriptionEmptyState />
                    )}

                    <SubscriptionPriceForm
                        initialPrice={plan?.price}
                        saving={saving}
                        onSave={handleSave}
                    />
                </ScrollView>
            )}
        </View>
    );
}
