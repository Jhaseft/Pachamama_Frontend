import { Stack, router } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { DollarSign, Images, MessageCircle, Settings, Phone, Video } from "lucide-react-native";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  Easing,
  Image,
  Pressable,
  RefreshControl,
  ScrollView,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "../../src/context/AuthContext";
import { getProfile } from "../../src/services/auth";
import { apiGetMyEarnings, type EarningTransaction, type EarningsData } from "../../src/api/wallet";
import { getChats } from "../../src/api/messages";

// ─── Constantes ───────────────────────────────────────────────────────────────

const CREDITS_TO_SOLES = 0.1;
const toSoles = (credits: number) => (credits * CREDITS_TO_SOLES).toFixed(2);

// ─── AnimatedBorderCard ───────────────────────────────────────────────────────

const GOLD_BORDER = [
  "#F6C16A", "#FFE5A0", "#F6C16A", "#C9933A",
  "#8B5E1A", "#C9933A", "#FFE5A0", "#F6C16A", "#F6C16A",
] as const;

const PURPLE_BORDER = [
  "#a855f7", "#d8b4fe", "#a855f7", "#7c3aed",
  "#4c1d95", "#7c3aed", "#d8b4fe", "#a855f7", "#a855f7",
] as const;

function AnimatedBorderCard({
  children,
  borderRadius = 18,
  borderColors = GOLD_BORDER,
  style,
}: {
  children: React.ReactNode;
  borderRadius?: number;
  borderColors?: readonly string[];
  style?: object;
}) {
  const spin = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.timing(spin, {
        toValue: 1,
        duration: 3000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();
  }, [spin]);

  const rotate = spin.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  return (
    <View style={[{ borderRadius, padding: 2, overflow: "hidden" }, style]}>
      <Animated.View
        style={{
          position: "absolute",
          width: 600,
          height: 600,
          top: "50%",
          left: "50%",
          marginTop: -300,
          marginLeft: -300,
          transform: [{ rotate }],
        }}
      >
        <LinearGradient
          colors={borderColors as any}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{ flex: 1 }}
        />
      </Animated.View>
      {children}
    </View>
  );
}

// ─── GlowingCard ─────────────────────────────────────────────────────────────

function GlowingCard({
  children,
  borderRadius = 16,
  glowColor = "#F6A800",
  borderColors = GOLD_BORDER,
  style,
}: {
  children: React.ReactNode;
  borderRadius?: number;
  glowColor?: string;
  borderColors?: readonly string[];
  style?: object;
}) {
  const pulse = useRef(new Animated.Value(0.5)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 1,
          duration: 900,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulse, {
          toValue: 0.5,
          duration: 900,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [pulse]);

  return (
    <View style={[{ position: "relative" }, style]}>
      {/* Capa de brillo exterior pulsante */}
      <Animated.View
        pointerEvents="none"
        style={{
          position: "absolute",
          top: -8,
          left: -8,
          right: -8,
          bottom: -8,
          borderRadius: borderRadius + 8,
          backgroundColor: glowColor,
          opacity: pulse,
          // blur simulado con múltiples capas
        }}
      />
      <Animated.View
        pointerEvents="none"
        style={{
          position: "absolute",
          top: -4,
          left: -4,
          right: -4,
          bottom: -4,
          borderRadius: borderRadius + 4,
          backgroundColor: glowColor,
          opacity: pulse,
        }}
      />
      <AnimatedBorderCard borderRadius={borderRadius} borderColors={borderColors} style={{ flex: 1 }}>
        {children}
      </AnimatedBorderCard>
    </View>
  );
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function serviceIcon(service: string, size = 22) {
  const s = service.toLowerCase();
  if (s.includes("llamada") || s.includes("call")) return <Phone size={size} color="#fff" />;
  if (s.includes("video")) return <Video size={size} color="#fff" />;
  if (s.includes("foto") || s.includes("imagen") || s.includes("image")) return <Images size={size} color="#fff" />;
  if (s.includes("mensaje") || s.includes("message")) return <MessageCircle size={size} color="#fff" />;
  return <DollarSign size={size} color="#fff" />;
}

function formatRelativeTime(dateStr: string): string {
  const diffMs = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diffMs / 60_000);
  if (mins < 1) return "Ahora";
  if (mins < 60) return `Hace ${mins} min`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `Hace ${hours}h`;
  return "Ayer";
}

// ─── Pantalla ─────────────────────────────────────────────────────────────────

export default function AnfitrianaInicio() {
  const { accessToken, user, isHydrated, setSession, logout } = useAuth();
  const [earnings, setEarnings] = useState<EarningsData | null>(null);
  const [loadingEarnings, setLoadingEarnings] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);
  const [refreshing, setRefreshing] = useState(false);

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

  // Cargar ganancias y mensajes no leídos
  const loadData = useCallback(async () => {
    try {
      const [earningsData, chats] = await Promise.all([
        apiGetMyEarnings(),
        user?.id ? getChats(user.id) : Promise.resolve([]),
      ]);
      setEarnings(earningsData);
      const total = chats.reduce((sum, c) => sum + (c.unreadCount ?? 0), 0);
      setUnreadCount(total);
    } catch {
      // silencioso
    } finally {
      setLoadingEarnings(false);
      setRefreshing(false);
    }
  }, [user?.id]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    void loadData();
  }, [loadData]);

  return (
    <View style={{ flex: 1, backgroundColor: "#25060E" }}>
      <Stack.Screen options={{ headerShown: false }} />
      <SafeAreaView edges={["top"]} style={{ flex: 1 }}>
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor="#F6C16A"
              colors={["#F6C16A"]}
            />
          }
        >

          {/* ── Header saludo ── */}
          <View className="flex-row items-center justify-between mb-6 px-1">
            <View style={{ flex: 1 }}>
              <Text style={{ color: "white", fontSize: 28, fontWeight: "800" }}>
                👋 Hola {user?.firstName ?? ""}
              </Text>
              <Text style={{ color: "rgba(255,255,255,0.55)", fontSize: 13, marginTop: 4 }}>
                Aquí está tu resumen de hoy
              </Text>
            </View>
            <Image
              source={require("../../assets/BlackandWhiteXLetterDigital.jpg")}
              style={{ width: 100, height: 100 }}
              resizeMode="contain"
            />
          </View>

          {/* ── Tarjetas de ganancias ── */}
          {loadingEarnings ? (
            <View className="flex-row gap-3 mb-6">
              {[0, 1].map((i) => (
                <View
                  key={i}
                  style={{
                    flex: 1,
                    backgroundColor: "#5c0018",
                    borderRadius: 16,
                    height: 80,
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <ActivityIndicator color="white" />
                </View>
              ))}
            </View>
          ) : (
            <View className="flex-row gap-3 mb-7">
              {/* Hoy */}
              <AnimatedBorderCard borderRadius={16} style={{ flex: 1 }}>
                <LinearGradient
                  colors={["#4a0000", "#8B0000"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={{ borderRadius: 14, paddingHorizontal: 16, paddingVertical: 18 }}
                >
                  <Text style={{ color: "#F6C16A", fontSize: 12, marginBottom: 4 }}>
                    Hoy
                  </Text>
                  <Text style={{ color: "#FFEE00", fontSize: 22, fontWeight: "900" }}>
                    +S/ {toSoles(earnings?.today ?? 0)}
                  </Text>
                </LinearGradient>
              </AnimatedBorderCard>

              {/* Esta semana */}
              <GlowingCard borderRadius={16} glowColor="#7c3aed" borderColors={PURPLE_BORDER} style={{ flex: 1 }}>
                <LinearGradient
                  colors={["#3b0764", "#6d28d9"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={{ borderRadius: 14, paddingHorizontal: 16, paddingVertical: 18 }}
                >
                  <Text style={{ color: "rgba(230,200,255,0.85)", fontSize: 12, marginBottom: 4 }}>
                    Esta semana
                  </Text>
                  <Text style={{ color: "#FFEE00", fontSize: 22, fontWeight: "900" }}>
                    +S/ {toSoles(earnings?.thisWeek ?? 0)}
                  </Text>
                </LinearGradient>
              </GlowingCard>
            </View>
          )}

          {/* ── Accesos rápidos ── */}
          <Text style={{ color: "white", fontSize: 17, fontWeight: "700", marginBottom: 12 }}>
            Accesos rápidos
          </Text>
          <View className="flex-row gap-3 mb-7">

            {/* Mensajes */}
            <Pressable
              onPress={() => router.push("/(anfitriona)/chats")}
              style={{
                flex: 1,
                backgroundColor: "#5c0018",
                borderRadius: 16,
                paddingVertical: 18,
                alignItems: "center",
              }}
            >
              <MessageCircle size={30} color="white" />
              <Text style={{ color: "white", fontWeight: "600", marginTop: 8, fontSize: 13 }}>
                Mensajes
              </Text>
              {unreadCount > 0 && (
                <View
                  style={{
                    backgroundColor: "#D11B1B",
                    borderRadius: 99,
                    paddingHorizontal: 10,
                    paddingVertical: 3,
                    marginTop: 6,
                  }}
                >
                  <Text style={{ color: "white", fontSize: 11, fontWeight: "700" }}>
                    {unreadCount} nuevos
                  </Text>
                </View>
              )}
            </Pressable>

            {/* Ganancias — brillante */}
            <GlowingCard borderRadius={16} glowColor="#C97B00" style={{ flex: 1 }}>
              <Pressable
                onPress={() => router.push("/(anfitriona)/ganancias")}
                style={{ borderRadius: 14, overflow: "hidden" }}
              >
                <LinearGradient
                  colors={["#7c2d00", "#b45309", "#f59e0b"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={{ paddingVertical: 18, alignItems: "center" }}
                >
                  <DollarSign size={32} color="#FFF" />
                  <Text style={{ color: "white", fontWeight: "700", marginTop: 8, fontSize: 13 }}>
                    Ganancias
                  </Text>
                  {earnings && (
                    <Text style={{ color: "#FFEE00", fontSize: 11, fontWeight: "800", marginTop: 4 }}>
                      +S/ {toSoles(earnings.today)} hoy
                    </Text>
                  )}
                </LinearGradient>
              </Pressable>
            </GlowingCard>

            {/* Mis precios */}
            <Pressable
              onPress={() => router.push("/(anfitriona)/precios")}
              style={{
                flex: 1,
                backgroundColor: "#5c0018",
                borderRadius: 16,
                paddingVertical: 18,
                alignItems: "center",
              }}
            >
              <Settings size={30} color="white" />
              <Text style={{ color: "white", fontWeight: "600", marginTop: 8, fontSize: 13 }}>
                Mis precios
              </Text>
            </Pressable>

          </View>

          {/* ── Actividad reciente ── */}
          <Text style={{ color: "white", fontSize: 17, fontWeight: "700", marginBottom: 12 }}>
            Actividad reciente
          </Text>

          {loadingEarnings && (
            <ActivityIndicator color="#D11B1B" style={{ marginBottom: 16 }} />
          )}

          {!loadingEarnings && earnings?.transactions.length === 0 && (
            <View
              style={{
                backgroundColor: "#1a0a10",
                borderRadius: 16,
                padding: 24,
                alignItems: "center",
              }}
            >
              <Text style={{ color: "#6b7280", fontSize: 14 }}>Sin actividad reciente</Text>
            </View>
          )}

          {!loadingEarnings &&
            earnings?.transactions.map((tx) => (
              <AnimatedBorderCard key={tx.id} style={{ marginBottom: 12 }}>
                <LinearGradient
                  colors={["#1a0208", "#3d0010", "#5a0018"]}
                  start={{ x: 0, y: 0.5 }}
                  end={{ x: 1, y: 0.5 }}
                  style={{ borderRadius: 16 }}
                >
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      paddingHorizontal: 16,
                      paddingVertical: 14,
                    }}
                  >
                    <View
                      style={{
                        width: 44,
                        height: 44,
                        borderRadius: 12,
                        backgroundColor: "#9E1A34",
                        alignItems: "center",
                        justifyContent: "center",
                        marginRight: 12,
                      }}
                    >
                      {serviceIcon(tx.service)}
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={{ color: "white", fontWeight: "600", fontSize: 14 }}>
                        {tx.service}{" "}
                        <Text style={{ color: "#FFEE00", fontWeight: "800" }}>
                          · +S/ {toSoles(tx.amount)}
                        </Text>
                      </Text>
                      <Text style={{ color: "rgba(255,255,255,0.45)", fontSize: 12, marginTop: 2 }}>
                        {formatRelativeTime(tx.createdAt)}
                      </Text>
                    </View>
                    <Text
                      style={{ color: "rgba(255,255,255,0.55)", fontSize: 12, fontWeight: "600" }}
                    >
                      +{tx.amount} créditos
                    </Text>
                  </View>
                </LinearGradient>
              </AnimatedBorderCard>
            ))}

        </ScrollView>
      </SafeAreaView>
    </View>
  );
}
