import HighlightStoriesRow from "@/components/cliente/profile/HighlightStoriesRow";
import IntroCard from "@/components/cliente/profile/IntroCard";
import { getPublicHostessProfile } from "@/src/services/hostesses";
import { apiGetPublicServicePrices, type ServicePrice } from "@/src/api/servicePrices";
import { apiGetStoriesFeed } from "@/src/api/anfitrionaHistory";
import type { HistoryFeedItem } from "@/src/types/historyViewClient";
import type { AnfitrioneProfileDetail } from "@/src/types/anfitrionaProfile";
import { apiGetPublicPlan, apiBuySubscription, apiGetSubscriptionStatus } from "@/src/api/subscriptions";
import type { SubscriptionPlan, SubscriptionStatus } from "@/src/types/subscriptions";
import { useAuth } from "@/src/context/AuthContext";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { useFocusEffect } from "@react-navigation/native";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Modal,
  ScrollView,
  StatusBar,
  Text,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from "react-native";

import { ZoomableImage } from "@/components/cliente/profile/ZoomableImage";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import colors from "@/constants/colors";
import PrimaryButton from "@/components/PrimaryButton";

const COVER_HEIGHT = 270;
const AVATAR_SIZE = 90;

export default function AnfitrioneProfileScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const { user } = useAuth();

  const [profile, setProfile] = useState<AnfitrioneProfileDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [servicePrices, setServicePrices] = useState<ServicePrice[]>([]);
  const [viewingImage, setViewingImage] = useState<string | null>(null);
  const [storyFeedItem, setStoryFeedItem] = useState<HistoryFeedItem | null>(null);
  const [subPlan, setSubPlan] = useState<SubscriptionPlan | null>(null);
  const [subStatus, setSubStatus] = useState<SubscriptionStatus | null>(null);
  const [showSubModal, setShowSubModal] = useState(false);
  const [buying, setBuying] = useState(false);

  useEffect(() => { void loadProfile(); }, [id]);

  useFocusEffect(
    useCallback(() => {
      void loadProfile();
    }, [id])
  );

  const loadProfile = async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const [data, prices, feed] = await Promise.all([
        getPublicHostessProfile(id),
        apiGetPublicServicePrices(id).catch(() => [] as ServicePrice[]),
        apiGetStoriesFeed().catch(() => [] as HistoryFeedItem[]),
      ]);
      setProfile(data);
      setServicePrices(prices);
      const match = feed.find((item) => item.userId === id);
      setStoryFeedItem(match ?? null);
      // Cargar plan y estado de suscripción en paralelo
      const [plan, status] = await Promise.allSettled([
        apiGetPublicPlan(id),
        apiGetSubscriptionStatus(id),
      ]);
      if (plan.status === 'fulfilled') setSubPlan(plan.value);
      if (status.status === 'fulfilled') setSubStatus(status.value);
    } catch {
      setError("No se pudo cargar el perfil. Verifica tu conexión.");
    } finally {
      setLoading(false);
    }
  };

  // El perfil es público, pero cualquier interacción requiere sesión.
  // Si no hay usuario, se ofrece iniciar sesión y se corta la acción.
  const ensureAuth = useCallback(() => {
    if (user) return true;
    Alert.alert(
      "Inicia sesión",
      "Necesitas iniciar sesión para continuar.",
      [
        { text: "Cancelar", style: "cancel" },
        { text: "Iniciar sesión", onPress: () => router.push("/(auth)/login-client") },
      ]
    );
    return false;
  }, [user, router]);

  const handleViewStories = () => {
    if (!ensureAuth()) return;
    if (!storyFeedItem || !storyFeedItem.stories.length) return;
    const formattedStories = storyFeedItem.stories.map((s) => ({
      id: s.id,
      uri: s.mediaUrl,
      type: s.mediaType.toLowerCase(),
    }));
    router.push({
      pathname: "/story-viewer",
      params: {
        data: JSON.stringify({
          userId: storyFeedItem.userId,
          name: storyFeedItem.name,
          avatar: storyFeedItem.avatar,
          stories: formattedStories,
        }),
      },
    });
  };

  function getPrice(type: ServicePrice["serviceType"]) {
    return servicePrices.find((p) => p.serviceType === type)?.price ?? null;
  }

  function handleCall(callType: "CALL" | "VIDEO_CALL") {
    if (!ensureAuth()) return;
    if (!profile) return;
    const price = getPrice(callType);
    if (price === null) return;
    router.push({
      pathname: "/(cliente)/call" as any,
      params: {
        anfitrionaId: id,
        anfitrionaName: profile.name,
        anfitrionaAvatar: profile.avatar ?? "",
        callType,
        pricePerMinute: String(price),
        callId: `${user?.id}_${Date.now()}`,
      },
    });
  }

  const handleChat = () => {
    if (!ensureAuth()) return;
    if (!profile) return;
    router.push({
      pathname: "/(cliente)/chat/[conversationId]" as any,
      params: {
        conversationId: "new",
        otherUserId: id,
        otherUserName: profile.name,
        otherUserAvatar: profile.avatar ?? "",
      },
    });
  };

  const handleBuySubscription = async () => {
    if (!id) return;
    setBuying(true);
    try {
      const res = await apiBuySubscription(id);
      setSubStatus({ isSubscribed: true, expiresAt: res.expiresAt });
      setShowSubModal(false);
      await loadProfile();
    } catch (e: any) {
      const msg = e?.response?.data?.message ?? e?.message ?? '';
      const isInsufficient = msg.toLowerCase().includes('credit') || msg.toLowerCase().includes('saldo') || msg.toLowerCase().includes('insuf');
      Alert.alert(
        isInsufficient ? 'Saldo insuficiente' : 'Error',
        isInsufficient
          ? `Necesitas ${subPlan?.price} créditos para suscribirte. Recarga tu saldo e intenta de nuevo.`
          : 'No se pudo completar la suscripción. Intenta de nuevo.',
        isInsufficient
          ? [
              { text: 'Cancelar', style: 'cancel' },
              { text: 'Recargar', onPress: () => { setShowSubModal(false); router.push('/(cliente)/credito'); } },
            ]
          : [{ text: 'OK' }]
      );
    } finally {
      setBuying(false);
    }
  };

  const isSubscribed = subStatus?.isSubscribed === true &&
    (subStatus.expiresAt ? new Date(subStatus.expiresAt) > new Date() : true);
  const callPrice = getPrice("CALL");
  const videoPrice = getPrice("VIDEO_CALL");
  const chatPrice = getPrice("MESSAGE_SEND");

  const publicImages = profile?.galleryImages.filter(
    (img) => !img.isPremium || img.isUnlockedByViewer
  ) ?? [];
  const privateImages = profile?.galleryImages.filter(
    (img) => img.isPremium && !img.isUnlockedByViewer
  ) ?? [];
  return (
    <View style={{ flex: 1, backgroundColor: colors.surface.DEFAULT }}>
      <Stack.Screen options={{ headerShown: false }} />

      {/* Botón volver */}
      <TouchableOpacity
        onPress={() => router.back()}
        style={{
          position: "absolute",
          top: insets.top + 8,
          left: 16,
          zIndex: 20,
          backgroundColor: "rgba(0,0,0,0.55)",
          borderRadius: 20,
          padding: 8,
        }}
      >
        <MaterialCommunityIcons name="arrow-left" size={22} color="white" />
      </TouchableOpacity>

      {/* Loading */}
      {loading && (
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
          <ActivityIndicator size="large" color={colors.primary.purple} />
        </View>
      )}

      {/* Error */}
      {!loading && error && (
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: 24 }}>
          <MaterialCommunityIcons name="wifi-off" size={48} color="#4b5563" style={{ marginBottom: 16 }} />
          <Text style={{ color: "white", textAlign: "center", fontSize: 16, marginBottom: 16 }}>{error}</Text>
          <TouchableOpacity
            onPress={loadProfile}
            style={{ backgroundColor: colors.primary.purple, paddingHorizontal: 24, paddingVertical: 12, borderRadius: 999 }}
          >
            <Text style={{ color: "white", fontWeight: "600" }}>Reintentar</Text>
          </TouchableOpacity>
        </View>
      )}

      {!loading && !error && !profile && (
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: 24 }}>
          <Text style={{ color: "#9ca3af", textAlign: "center", fontSize: 16 }}>Anfitriona no encontrada.</Text>
        </View>
      )}

      {!loading && !error && profile && (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: insets.bottom + 32 }}
        >
          {/* ── Cover ── */}
          <TouchableOpacity
            activeOpacity={0.95}
            onPress={() => profile.coverImage && setViewingImage(profile.coverImage)}
            style={{ width, height: COVER_HEIGHT }}
          >
            <Image
              source={profile.coverImage ? { uri: profile.coverImage } : require("../../../../assets/no_image.jpg")}
              style={{ width: "100%", height: "100%" }}
              resizeMode="cover"
            />
            <LinearGradient
              colors={["transparent", "rgba(10,6,19,0.9)"]}
              style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 140 }}
            />
          </TouchableOpacity>

          {/* ── Avatar + nombre ── */}
          <View style={{
            flexDirection: "row",
            alignItems: "flex-end",
            paddingHorizontal: 16,
            marginTop: -(AVATAR_SIZE / 2),
            marginBottom: 16,
          }}>
            {/* Avatar */}
            <TouchableOpacity
              activeOpacity={0.9}
              onPress={() => profile.avatar && setViewingImage(profile.avatar)}
            >
              <View style={{
                width: AVATAR_SIZE, height: AVATAR_SIZE,
                borderRadius: AVATAR_SIZE / 2,
                borderWidth: 3, borderColor: colors.secondary.DEFAULT,
                backgroundColor: colors.surface.card, overflow: "hidden",
              }}>
                <Image
                  source={profile.avatar ? { uri: profile.avatar } : require("../../../../assets/no_image.jpg")}
                  style={{ width: "100%", height: "100%" }}
                  resizeMode="cover"
                />
              </View>
              <View style={{
                position: "absolute", bottom: 4, right: 4,
                width: 18, height: 18, borderRadius: 9,
                backgroundColor: profile.isOnline ? "#22c55e" : "#6b7280",
                borderWidth: 2, borderColor: colors.surface.DEFAULT,
              }} />
            </TouchableOpacity>

            {/* Nombre + estado + bio */}
            <View style={{ flex: 1, marginLeft: 12, paddingBottom: 4 }}>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                <Text style={{ color: "white", fontSize: 24, fontWeight: "800" }}>{profile.name}</Text>
              </View>
              <Text style={{
                color: profile.isOnline ? colors.secondary.DEFAULT : "#6b7280",
                fontSize: 13, fontWeight: "600", marginTop: 2,
              }}>
                {profile.isOnline ? "En línea ahora" : "Desconectada"}
              </Text>
              {!!profile.introMessage && (
                <Text style={{ color: "rgba(255,255,255,0.55)", fontSize: 12, marginTop: 3 }} numberOfLines={1}>
                  ✨ {profile.introMessage}
                </Text>
              )}
            </View>
          </View>

          <View style={{ paddingHorizontal: 16, gap: 14 }}>

            {/* ── Pills de acción ── */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
              {profile.highlightedStories.length > 0 && (
                <View style={{
                  flexDirection: "row", alignItems: "center", gap: 6,
                  backgroundColor: colors.primary.purple, borderRadius: 999,
                  paddingVertical: 10, paddingHorizontal: 16,
                }}>
                  <Text style={{ fontSize: 14 }}>▶</Text>
                  <Text style={{ color: "white", fontWeight: "700", fontSize: 13 }}>Ver historia 🔥</Text>
                </View>
              )}

              {callPrice !== null && (
                <TouchableOpacity
                  onPress={() => handleCall("CALL")}
                  activeOpacity={0.8}
                  style={{
                    flexDirection: "row", alignItems: "center", gap: 6,
                    backgroundColor: "#15803d", borderRadius: 999,
                    paddingVertical: 10, paddingHorizontal: 16,
                  }}
                >
                  <Text style={{ fontSize: 15 }}>📞</Text>
                  <Text style={{ color: "white", fontWeight: "700", fontSize: 13 }}>
                    Llamada · {callPrice} cr/min
                  </Text>
                </TouchableOpacity>
              )}

              {videoPrice !== null && (
                <TouchableOpacity
                  onPress={() => handleCall("VIDEO_CALL")}
                  activeOpacity={0.8}
                  style={{
                    flexDirection: "row", alignItems: "center", gap: 6,
                    backgroundColor: "#6d28d9", borderRadius: 999,
                    paddingVertical: 10, paddingHorizontal: 16,
                  }}
                >
                  <Text style={{ fontSize: 15 }}>📹</Text>
                  <Text style={{ color: "white", fontWeight: "700", fontSize: 13 }}>
                    Video · {videoPrice} cr/min
                  </Text>
                </TouchableOpacity>
              )}

              {storyFeedItem && storyFeedItem.stories.length > 0 && (
                <TouchableOpacity
                  onPress={handleViewStories}
                  activeOpacity={0.8}
                  style={{
                    flexDirection: "row", alignItems: "center", gap: 6,
                    backgroundColor: colors.primary.purple, borderRadius: 999,
                    paddingVertical: 10, paddingHorizontal: 16,
                  }}
                >
                  <Text style={{ fontSize: 15 }}>▶</Text>
                  <Text style={{ color: "white", fontWeight: "700", fontSize: 13 }}>
                    Ver historias 🔥
                  </Text>
                </TouchableOpacity>
              )}

              <View style={{
                flexDirection: "row", alignItems: "center", gap: 6,
                backgroundColor: colors.surface.card, borderRadius: 999,
                borderWidth: 1, borderColor: colors.surface.border,
                paddingVertical: 10, paddingHorizontal: 16,
              }}>
                <Text style={{ fontSize: 15 }}>❤️</Text>
                <Text style={{ color: "rgba(255,255,255,0.7)", fontSize: 13, fontWeight: "600" }}>
                  {profile.likesCount}
                </Text>
              </View>
            </ScrollView>

            {/* ── Suscripción ── */}
            {subPlan ? (
              <TouchableOpacity
                onPress={() => { if (!ensureAuth()) return; if (!isSubscribed) setShowSubModal(true); }}
                activeOpacity={isSubscribed ? 1 : 0.85}
                style={{
                  borderRadius: 16,
                  overflow: 'hidden',
                  borderWidth: 1,
                  borderColor: isSubscribed ? '#22c55e40' : 'rgba(240,62,179,0.25)',
                }}
              >
                <LinearGradient
                  colors={isSubscribed ? ['#0d1a00', '#0f2200'] : [colors.surface.card, colors.surface.border]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 14, gap: 12 }}
                >
                  <View style={{
                    width: 42, height: 42, borderRadius: 12,
                    backgroundColor: isSubscribed ? '#0d2200' : colors.surface.card,
                    alignItems: 'center', justifyContent: 'center',
                  }}>
                    <MaterialCommunityIcons
                      name={isSubscribed ? 'check-decagram' : 'crown'}
                      size={22}
                      color={isSubscribed ? '#22c55e' : colors.secondary.DEFAULT}
                    />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ color: isSubscribed ? '#22c55e' : colors.secondary.DEFAULT, fontWeight: '800', fontSize: 14 }}>
                      {isSubscribed ? '✦ Suscrito' : 'Suscribirse al plan'}
                    </Text>
                    <Text style={{ color: 'rgba(255,255,255,0.45)', fontSize: 12, marginTop: 2 }}>
                      {isSubscribed
                        ? `Acceso activo · ${subPlan.price} cr/mes`
                        : `${subPlan.price} créditos/mes · Acceso a la galeria de la anfitriona`}
                    </Text>
                  </View>
                  {!isSubscribed && (
                    <View style={{
                      backgroundColor: colors.secondary.DEFAULT, borderRadius: 999,
                      paddingHorizontal: 12, paddingVertical: 6,
                    }}>
                      <Text style={{ color: '#ffffff', fontWeight: '800', fontSize: 12 }}>Unirse</Text>
                    </View>
                  )}
                </LinearGradient>
              </TouchableOpacity>
            ) : null}

            {/* ── CTA principal ── */}
            <PrimaryButton
              onPress={handleChat}
              title={`Enviar mensaje${chatPrice ? ` (${chatPrice} crédito${chatPrice !== 1 ? "s" : ""})` : ""}`}
            />

            {/* ── Historias destacadas ── */}
            {profile.highlightedStories.length > 0 && (
              <HighlightStoriesRow stories={profile.highlightedStories} />
            )}

            {/* ── Galería ── */}
            {profile.galleryImages.length > 0 && (
              <View style={{ flexDirection: "row", gap: 10 }}>

                {/* Pública */}
                {publicImages.length > 0 && (
                  <View style={{
                    flex: 1, backgroundColor: colors.surface.DEFAULT,
                    borderRadius: 16, borderWidth: 1, borderColor: colors.surface.border,
                    overflow: "hidden", padding: 12,
                    justifyContent: "space-between",
                  }}>
                    <View>
                      <Text style={{ color: "white", fontWeight: "700", fontSize: 14, marginBottom: 2 }}>
                        Galería Pública
                      </Text>
                      <Text style={{ color: "#71717a", fontSize: 11, marginBottom: 10 }}>
                        Álbum público
                      </Text>
                      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 3 }}>
                        {publicImages.slice(0, 6).map((img) => (
                          <TouchableOpacity
                            key={img.id}
                            onPress={() => setViewingImage(img.imageUrl)}
                            activeOpacity={0.85}
                            style={{ width: "31%", aspectRatio: 1, borderRadius: 6, overflow: "hidden" }}
                          >
                            <Image
                              source={{ uri: img.imageUrl }}
                              style={{ width: "100%", height: "100%" }}
                              resizeMode="cover"
                            />
                          </TouchableOpacity>
                        ))}
                      </View>
                    </View>
                    <TouchableOpacity
                      onPress={() =>
                        router.push({
                          pathname: "/(cliente)/anfitrionas/[id]/album" as any,
                          params: {
                            id,
                            anfitrionaName: profile.name,
                            images: JSON.stringify(publicImages.map((img) => ({ id: img.id, imageUrl: img.imageUrl }))),
                          },
                        })
                      }
                      style={{
                        marginTop: 10, borderWidth: 1, borderColor: colors.secondary.DEFAULT,
                        borderRadius: 999, paddingVertical: 8, alignItems: "center",
                      }}
                    >
                      <Text style={{ color: colors.secondary.DEFAULT, fontSize: 12, fontWeight: "700" }}>Ver Álbum</Text>
                    </TouchableOpacity>
                  </View>
                )}

                {/* Exclusiva */}
                {privateImages.length > 0 && (
                  <View style={{
                    flex: 1, backgroundColor: colors.surface.DEFAULT,
                    borderRadius: 16, borderWidth: 1, borderColor: colors.surface.border,
                    overflow: "hidden", padding: 12,
                    justifyContent: "space-between",
                  }}>
                    <View>
                      <Text style={{ color: "white", fontWeight: "700", fontSize: 14, marginBottom: 2 }}>
                        Galería Exclusiva
                      </Text>
                      <Text style={{ color: "#71717a", fontSize: 11, marginBottom: 10 }}>
                        Álbum privado
                      </Text>
                      <View style={{
                        aspectRatio: 1, borderRadius: 10, overflow: "hidden",
                        marginBottom: 10, position: "relative",
                      }}>
                        <Image
                          source={{ uri: privateImages[0].imageUrl }}
                          style={{ width: "100%", height: "100%", opacity: 0.2 }}
                          resizeMode="cover"
                          blurRadius={10}
                        />
                        <View style={{
                          position: "absolute", top: 0, bottom: 0, left: 0, right: 0,
                          alignItems: "center", justifyContent: "center",
                        }}>
                          <MaterialCommunityIcons name="lock" size={34} color="rgba(255,255,255,0.65)" />
                          <Text style={{ color: "rgba(255,255,255,0.5)", fontSize: 11, marginTop: 6 }}>
                            {privateImages.length} foto{privateImages.length !== 1 ? "s" : ""}
                          </Text>
                        </View>
                      </View>
                    </View>
                    <TouchableOpacity
                      onPress={() => {
                        if (!ensureAuth()) return;
                        router.push({
                          pathname: "/(cliente)/anfitrionas/[id]/desbloquear" as any,
                          params: {
                            id,
                            anfitrionaName: profile.name,
                            images: JSON.stringify(
                              privateImages.map((img) => ({
                                id: img.id,
                                imageUrl: img.imageUrl,
                                unlockCredits: img.unlockCredits ?? null,
                              }))
                            ),
                          },
                        });
                      }}
                      style={{
                        backgroundColor: colors.secondary.DEFAULT, borderRadius: 999,
                        paddingVertical: 9, paddingHorizontal: 8,
                        alignItems: "center",
                      }}
                    >
                      <Text style={{ color: "white", fontSize: 11, fontWeight: "700" }}>
                        Ver Álbum Exclusivo
                      </Text>
                    </TouchableOpacity>
                  </View>
                )}

              </View>
            )}

            {/* ── Bio / Intro ── */}
            {!!profile.introMessage && <IntroCard message={profile.introMessage} />}

          </View>
        </ScrollView>
      )}

      {/* Modal suscripción */}
      <Modal visible={showSubModal} transparent animationType="slide" onRequestClose={() => setShowSubModal(false)}>
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'flex-end', paddingBottom: 40 }}>
          <View style={{ backgroundColor: colors.surface.card, borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 24, gap: 20 }}>

            {/* Header */}
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
              <View style={{ width: 48, height: 48, borderRadius: 14, backgroundColor: colors.surface.DEFAULT, alignItems: 'center', justifyContent: 'center' }}>
                <MaterialCommunityIcons name="crown" size={26} color={colors.secondary.DEFAULT} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ color: 'white', fontWeight: '800', fontSize: 17 }}>Plan de suscripción</Text>
                <Text style={{ color: '#6b7280', fontSize: 12, marginTop: 2 }}>Acceso mensual exclusivo</Text>
              </View>
              <TouchableOpacity onPress={() => setShowSubModal(false)} style={{ padding: 4 }}>
                <MaterialCommunityIcons name="close" size={22} color="#6b7280" />
              </TouchableOpacity>
            </View>

            {/* Info precio */}
            <View style={{ backgroundColor: colors.surface.DEFAULT, borderRadius: 16, padding: 16, gap: 10 }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text style={{ color: '#9ca3af', fontSize: 13 }}>Anfitriona</Text>
                <Text style={{ color: 'white', fontWeight: '700', fontSize: 13 }}>{profile?.name}</Text>
              </View>
              <View style={{ height: 1, backgroundColor: '#1f1f1f' }} />
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text style={{ color: '#9ca3af', fontSize: 13 }}>Precio</Text>
                <Text style={{ color: colors.secondary.DEFAULT, fontWeight: '800', fontSize: 16 }}>{subPlan?.price} créditos / mes</Text>
              </View>
              <View style={{ height: 1, backgroundColor: '#1f1f1f' }} />
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text style={{ color: '#9ca3af', fontSize: 13 }}>Acceso</Text>
                <Text style={{ color: 'white', fontSize: 13 }}>Contenido exclusivo 30 días</Text>
              </View>
            </View>

            {/* Botones */}
            <View style={{ flexDirection: 'row', gap: 10 }}>
              <TouchableOpacity
                onPress={() => setShowSubModal(false)}
                style={{
                  flex: 1, borderRadius: 14, paddingVertical: 15,
                  alignItems: 'center', backgroundColor: '#1f1f1f',
                  borderWidth: 1, borderColor: '#2a2a2a',
                }}
              >
                <Text style={{ color: '#9ca3af', fontWeight: '700', fontSize: 15 }}>Cancelar</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleBuySubscription}
                disabled={buying}
                activeOpacity={0.85}
                style={{ flex: 2, borderRadius: 14, overflow: 'hidden' }}
              >
                <LinearGradient
                  colors={[colors.secondary.pink, colors.primary.purple, colors.secondary.pink]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={{ paddingVertical: 15, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 8 }}
                >
                  {buying ? (
                    <ActivityIndicator size={18} color="#ffffff" />
                  ) : (
                    <>
                      <MaterialCommunityIcons name="crown" size={18} color="#ffffff" />
                      <Text style={{ color: '#ffffff', fontWeight: '800', fontSize: 15 }}>Suscribirme</Text>
                    </>
                  )}
                </LinearGradient>
              </TouchableOpacity>
            </View>

          </View>
        </View>
      </Modal>

      {/* Visor de imagen con zoom */}
      <Modal visible={!!viewingImage} transparent animationType="fade" statusBarTranslucent>
        <StatusBar hidden />
        <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.95)" }}>
          {/* Botón cerrar */}
          <TouchableOpacity
            onPress={() => setViewingImage(null)}
            style={{
              position: "absolute", top: insets.top + 12, right: 16, zIndex: 10,
              backgroundColor: "rgba(0,0,0,0.6)", borderRadius: 20, padding: 8,
            }}
          >
            <MaterialCommunityIcons name="close" size={22} color="white" />
          </TouchableOpacity>

          {viewingImage && (
            <ZoomableImage uri={viewingImage} width={width} />
          )}

          <Text style={{ color: "rgba(255,255,255,0.4)", fontSize: 12, textAlign: "center", paddingBottom: insets.bottom + 12 }}>
            Pellizca para hacer zoom
          </Text>
        </View>
      </Modal>
    </View>
  );
}

