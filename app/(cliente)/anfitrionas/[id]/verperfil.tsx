import GallerySection from "@/components/cliente/profile/GallerySection";
import HighlightStoriesRow from "@/components/cliente/profile/HighlightStoriesRow";
import IntroCard from "@/components/cliente/profile/IntroCard";
import ProfileHeader from "@/components/cliente/profile/ProfileHeader";
import TrustSection from "@/components/cliente/profile/TrustSection";
import { getPublicHostessProfile } from "@/src/services/hostesses";
import { apiGetPublicServicePrices, type ServicePrice } from "@/src/api/servicePrices";
import type { AnfitrioneProfileDetail } from "@/src/types/anfitrionaProfile";
import { useAuth } from "@/src/context/AuthContext";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function AnfitrioneProfileScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();

  const [profile, setProfile] = useState<AnfitrioneProfileDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [servicePrices, setServicePrices] = useState<ServicePrice[]>([]);

  useEffect(() => {
    void loadProfile();
  }, [id]);

  const loadProfile = async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const [data, prices] = await Promise.all([
        getPublicHostessProfile(id),
        apiGetPublicServicePrices(id).catch(() => [] as ServicePrice[]),
      ]);
      setProfile(data);
      setServicePrices(prices);
    } catch {
      setError("No se pudo cargar el perfil. Verifica tu conexión.");
    } finally {
      setLoading(false);
    }
  };

  function getPrice(type: ServicePrice['serviceType']) {
    return servicePrices.find((p) => p.serviceType === type)?.price ?? null;
  }

  function handleCall(callType: 'CALL' | 'VIDEO_CALL') {
    if (!profile) return;
    const price = getPrice(callType);
    if (price === null) return;

    router.push({
      pathname: '/(cliente)/call' as any,
      params: {
        anfitrionaId: id,
        anfitrionaName: profile.name,
        anfitrionaAvatar: profile.avatar ?? '',
        callType,
        pricePerMinute: String(price),
        callId: `${user?.id}_${Date.now()}`,
      },
    });
  }

  const callPrice = getPrice('CALL');
  const videoPrice = getPrice('VIDEO_CALL');

  return (
    <View style={{ flex: 1, backgroundColor: "#111" }}>
      <Stack.Screen options={{ headerShown: false }} />

      <TouchableOpacity
        onPress={() => router.back()}
        style={{
          position: "absolute",
          top: insets.top + 8,
          left: 16,
          zIndex: 20,
          backgroundColor: "rgba(0,0,0,0.5)",
          borderRadius: 20,
          paddingHorizontal: 14,
          paddingVertical: 8,
        }}
      >
        <Text style={{ color: "white", fontSize: 14, fontWeight: "600" }}>← Volver</Text>
      </TouchableOpacity>

      {loading && (
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
          <ActivityIndicator size="large" color="#ec4899" />
        </View>
      )}

      {!loading && error && (
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: 24 }}>
          <Text style={{ color: "white", textAlign: "center", fontSize: 16, marginBottom: 16 }}>
            {error}
          </Text>
          <TouchableOpacity
            onPress={loadProfile}
            style={{
              backgroundColor: "#ec4899",
              paddingHorizontal: 24,
              paddingVertical: 12,
              borderRadius: 999,
            }}
          >
            <Text style={{ color: "white", fontWeight: "600" }}>Reintentar</Text>
          </TouchableOpacity>
        </View>
      )}

      {!loading && !error && !profile && (
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: 24 }}>
          <Text style={{ color: "#9ca3af", textAlign: "center", fontSize: 16 }}>
            Anfitriona no encontrada.
          </Text>
        </View>
      )}

      {!loading && !error && profile && (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: insets.bottom + 20 }}
        >
          <ProfileHeader
            name={profile.name}
            avatar={profile.avatar}
            coverImage={profile.coverImage}
            isOnline={profile.isOnline}
          />

          {/* Botones de acción: Chat / Llamada / Video */}
          <View className="px-4 mt-3 gap-2">
            {/* Chat */}
            <Pressable
              onPress={() =>
                router.push({
                  pathname: '/(cliente)/chat/[conversationId]' as any,
                  params: {
                    conversationId: 'new',
                    otherUserId: id,
                    otherUserName: profile.name,
                    otherUserAvatar: profile.avatar ?? '',
                  },
                })
              }
              className="bg-red-500 w-full p-4 rounded-xl items-center active:bg-red-600"
            >
              <Text className="text-white font-bold text-base">💬 Chatear ahora</Text>
            </Pressable>

            {/* Fila llamada + video */}
            <View className="flex-row gap-2">
              {/* Llamada de voz */}
              <TouchableOpacity
                onPress={() => handleCall('CALL')}
                disabled={callPrice === null}
                style={{ flex: 1 }}
                className={`rounded-xl p-4 items-center ${callPrice !== null ? 'bg-green-700 active:bg-green-800' : 'bg-gray-800'}`}
              >
                <Text className="text-2xl mb-1">📞</Text>
                <Text className="text-white font-semibold text-sm">Llamada</Text>
                {callPrice !== null ? (
                  <Text className="text-green-300 text-xs mt-0.5">{callPrice} cr/min</Text>
                ) : (
                  <Text className="text-gray-500 text-xs mt-0.5">No disponible</Text>
                )}
              </TouchableOpacity>

              {/* Video llamada */}
              <TouchableOpacity
                onPress={() => handleCall('VIDEO_CALL')}
                disabled={videoPrice === null}
                style={{ flex: 1 }}
                className={`rounded-xl p-4 items-center ${videoPrice !== null ? 'bg-violet-700 active:bg-violet-800' : 'bg-gray-800'}`}
              >
                <Text className="text-2xl mb-1">📹</Text>
                <Text className="text-white font-semibold text-sm">Video</Text>
                {videoPrice !== null ? (
                  <Text className="text-violet-300 text-xs mt-0.5">{videoPrice} cr/min</Text>
                ) : (
                  <Text className="text-gray-500 text-xs mt-0.5">No disponible</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>

          <HighlightStoriesRow stories={profile.highlightedStories} />
          <GallerySection images={profile.galleryImages} />
          <IntroCard message={profile.introMessage} />
          <TrustSection items={profile.trustItems} />
        </ScrollView>
      )}
    </View>
  );
}
