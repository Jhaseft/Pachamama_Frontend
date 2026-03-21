import { Stack, router } from "expo-router";
import { DollarSign, Images, MessageCircle, Settings } from "lucide-react-native";
import { useEffect, useState } from "react";
import { ActivityIndicator, Image, Pressable, ScrollView, Text, View } from "react-native";
import { useAuth } from "../../src/context/AuthContext";
import { getProfile } from "../../src/services/auth";
import { apiGetMyEarnings, type EarningTransaction, type EarningsData } from "../../src/api/wallet";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatRelativeTime(dateStr: string): string {
  const diffMs = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diffMs / 60_000);
  if (mins < 1) return "Ahora";
  if (mins < 60) return `Hace ${mins} min`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `Hace ${hours}h`;
  return "Ayer";
}

function serviceToIcon(service: string) {
  const s = service.toLowerCase();
  if (s.includes("imagen") || s.includes("foto") || s.includes("gallery") || s.includes("image")) {
    return Images;
  }
  if (s.includes("mensaje") || s.includes("message")) return MessageCircle;
  return DollarSign;
}

function formatActivityLabel(tx: EarningTransaction): string {
  const s = tx.service.toLowerCase();
  if (s.includes("imagen") || s.includes("foto") || s.includes("image")) {
    return `Foto desbloqueada por ${tx.clientName} · +${tx.amount} cr`;
  }
  if (s.includes("mensaje") || s.includes("message")) {
    return `Mensaje de ${tx.clientName} · +${tx.amount} cr`;
  }
  return `${tx.service} de ${tx.clientName} · +${tx.amount} cr`;
}

// ─── Pantalla ─────────────────────────────────────────────────────────────────

export default function AnfitrianaInicio() {
  const { accessToken, user, isHydrated, setSession, logout } = useAuth();
  const [earnings, setEarnings] = useState<EarningsData | null>(null);
  const [loadingEarnings, setLoadingEarnings] = useState(true);

  // Validar sesión al montar
  useEffect(() => {
    const validate = async () => {
      if (!accessToken) return;
      try {
        const profile = await getProfile();
        await setSession(accessToken, profile);
      } catch {
        await logout();
        router.replace("/(auth)/choose-access");
      }
    };
    if (isHydrated) void validate();
  }, [accessToken, isHydrated, logout, setSession]);

  // Cargar ganancias reales
  useEffect(() => {
    const load = async () => {
      try {
        const data = await apiGetMyEarnings();
        setEarnings(data);
      } catch {
        // silencioso — se muestra "—" en los valores
      } finally {
        setLoadingEarnings(false);
      }
    };
    void load();
  }, []);

  const ACCESOS = [
    {
      Icon: MessageCircle,
      label: "Mensajes",
      sub: null,
      route: "/(anfitriona)/chats",
    },
    {
      Icon: DollarSign,
      label: "Ganancias",
      sub: earnings ? `Cr/ ${earnings.today}` : null,
      route: "/(anfitriona)/ganancias",
    },
    {
      Icon: Settings,
      label: "Mis precios",
      sub: null,
      route: "/(anfitriona)/precios",
    },
  ];

  return (
    <ScrollView className="flex-1 bg-black px-4 pt-4">
      <Stack.Screen options={{ headerShown: false }} />

      {/* Header saludo */}
      <View className="flex flex-row gap-14 p-4 mb-1">
        <View className="items-center justify-center">
          <Text className="text-white text-2xl font-bold">
            Hola {user?.firstName ?? "👋"}
          </Text>
          <Text className="text-gray-400 text-sm mb-4">Aquí está tu resumen de hoy</Text>
        </View>
        <View>
          <Image
            source={require("../../assets/BlackandWhiteXLetterDigital.jpg")}
            className="w-[100px] h-[100px]"
            resizeMode="contain"
          />
        </View>
      </View>

      {/* Tarjetas de ganancias */}
      {loadingEarnings ? (
        <View className="flex-row gap-3 mb-6">
          <View className="flex-1 bg-red-600 rounded-xl p-4 items-center justify-center h-20">
            <ActivityIndicator color="white" />
          </View>
          <View className="flex-1 bg-red-600 rounded-xl p-4 items-center justify-center h-20">
            <ActivityIndicator color="white" />
          </View>
        </View>
      ) : (
        <View className="flex-row gap-3 mb-6">
          <View className="flex-1 bg-red-600 rounded-xl p-4">
            <Text className="text-white text-xs mb-1">Hoy</Text>
            <Text className="text-white text-2xl font-bold">
              Cr/ {earnings?.today ?? "—"}
            </Text>
          </View>
          <View className="flex-1 bg-red-600 rounded-xl p-4">
            <Text className="text-white text-xs mb-1">Esta semana</Text>
            <Text className="text-white text-2xl font-bold">
              Cr/ {earnings?.thisWeek ?? "—"}
            </Text>
          </View>
        </View>
      )}

      {/* Accesos rápidos */}
      <Text className="text-white text-lg font-bold mb-3">Accesos rápidos</Text>
      <View className="flex-row flex-wrap gap-3 mb-6">
        {ACCESOS.map(({ Icon, label, sub, route }) => (
          <Pressable
            key={label}
            onPress={() => router.push(route as any)}
            className="bg-red-600 rounded-xl p-4 items-center justify-center active:opacity-70"
            style={{ width: "47%" }}
          >
            <Icon size={32} color="white" />
            <Text className="text-white font-semibold mt-2">{label}</Text>
            {sub && <Text className="text-white text-xs opacity-80">{sub}</Text>}
          </Pressable>
        ))}
      </View>

      {/* Actividad reciente */}
      <Text className="text-white text-lg font-bold mb-3">Actividad reciente</Text>

      {loadingEarnings && (
        <ActivityIndicator color="#ef4444" style={{ marginBottom: 16 }} />
      )}

      {!loadingEarnings && earnings && earnings.transactions.length === 0 && (
        <View className="bg-zinc-900 rounded-xl px-4 py-5 mb-3 items-center">
          <Text className="text-zinc-500 text-sm">Sin actividad reciente</Text>
        </View>
      )}

      {!loadingEarnings &&
        earnings?.transactions.map((tx) => {
          const Icon = serviceToIcon(tx.service);
          return (
            <View
              key={tx.id}
              className="bg-red-600 rounded-xl px-4 py-3 flex-row items-center gap-3 mb-3"
            >
              <Icon size={24} color="white" />
              <View className="flex-1">
                <Text className="text-white font-semibold">
                  {formatActivityLabel(tx)}
                </Text>
                <Text className="text-white text-xs opacity-70">
                  {formatRelativeTime(tx.createdAt)}
                </Text>
              </View>
            </View>
          );
        })}

      <View className="h-8" />
    </ScrollView>
  );
}
