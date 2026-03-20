import ScreenHeader from "@/components/Menu/ScreenHeader";
import { apiGetMyEarnings, EarningTransaction, EarningsData } from "@/src/api/wallet";
import { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  RefreshControl,
} from "react-native";
import { MessageCircle, Image as ImageIcon, Phone, Video, TrendingUp } from "lucide-react-native";

function getServiceIcon(service: string) {
  const s = service.toLowerCase();
  if (s.includes("mensaje")) return <MessageCircle size={22} color="#fff" />;
  if (s.includes("foto") || s.includes("imagen") || s.includes("galería") || s.includes("privada")) return <ImageIcon size={22} color="#fff" />;
  if (s.includes("llamada")) return <Phone size={22} color="#fff" />;
  if (s.includes("video")) return <Video size={22} color="#fff" />;
  return <TrendingUp size={22} color="#fff" />;
}

function TransactionItem({ tx }: { tx: EarningTransaction }) {
  return (
    <View className="flex-row items-center bg-[#1a1a1a] rounded-2xl px-4 py-4 mb-3">
      <View className="w-11 h-11 rounded-xl bg-[#D11B1B] items-center justify-center mr-4">
        {getServiceIcon(tx.service)}
      </View>
      <View className="flex-1">
        <Text className="text-white font-semibold text-base">{tx.service}</Text>
        {tx.clientName ? (
          <Text className="text-gray-400 text-xs mt-0.5">{tx.clientName}</Text>
        ) : null}
      </View>
      <Text className="text-green-400 font-bold text-base">+ Cred/{tx.amount}</Text>
    </View>
  );
}

export default function AnfitrianaGanancias() {
  const [data, setData] = useState<EarningsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true);
      const result = await apiGetMyEarnings();
      setData(result);
    } catch (e) {
      Alert.alert("Error", "No se pudieron cargar las ganancias");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <View className="flex-1 bg-black">
      <ScreenHeader title="Mis ganancias" role="anfitriona" />

      {loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color="#D11B1B" size="large" />
        </View>
      ) : (
        <ScrollView
          className="flex-1"
          contentContainerStyle={{ padding: 16, paddingBottom: 32 }}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => load(true)}
              tintColor="#D11B1B"
            />
          }
        >
          {/* Subtitle */}
          <Text className="text-gray-400 text-sm mb-4">Resumen de tus ingresos</Text>

          {/* Total Card */}
          <View className="bg-[#D11B1B] rounded-2xl px-6 py-5 mb-6">
            <Text className="text-red-200 text-xs font-semibold uppercase tracking-widest mb-1">
              Total acumulado
            </Text>
            <Text className="text-white text-4xl font-black mb-4">
              Cred/ {data?.total ?? 0}
            </Text>
            <View className="flex-row justify-between">
              <View className="items-center">
                <Text className="text-white text-xl font-bold">Cred/ {data?.today ?? 0}</Text>
                <Text className="text-red-200 text-xs mt-0.5">Hoy</Text>
              </View>
              <View className="w-px bg-red-400 mx-2" />
              <View className="items-center">
                <Text className="text-white text-xl font-bold">Cred/ {data?.thisWeek ?? 0}</Text>
                <Text className="text-red-200 text-xs mt-0.5">Esta semana</Text>
              </View>
              <View className="w-px bg-red-400 mx-2" />
              <View className="items-center">
                <Text className="text-white text-xl font-bold">Cred/ {data?.total ?? 0}</Text>
                <Text className="text-red-200 text-xs mt-0.5">Total</Text>
              </View>
            </View>
          </View>

          {/* Transaction History Header */}
          <View className="flex-row items-center justify-between mb-4">
            <Text className="text-white font-bold text-base">Historial de transacciones</Text>
            <TouchableOpacity
              className="bg-[#D11B1B] px-4 py-1.5 rounded-full"
              onPress={() => Alert.alert("Solicitar pago", "Función disponible próximamente")}
            >
              <Text className="text-white text-xs font-semibold">Solicitar pago</Text>
            </TouchableOpacity>
          </View>

          {/* Transactions */}
          {data?.transactions.length === 0 ? (
            <View className="items-center py-12">
              <TrendingUp size={48} color="#333" />
              <Text className="text-gray-500 mt-4 text-center">
                Aún no tienes ganancias registradas.{"\n"}¡Empieza a enviar mensajes bloqueados!
              </Text>
            </View>
          ) : (
            data?.transactions.map((tx) => (
              <TransactionItem key={tx.id} tx={tx} />
            ))
          )}
        </ScrollView>
      )}
    </View>
  );
}
