
import GallerySection from "@/components/cliente/profile/GallerySection";
import HighlightStoriesRow from "@/components/cliente/profile/HighlightStoriesRow";
import IntroCard from "@/components/cliente/profile/IntroCard";
import ProfileHeader from "@/components/cliente/profile/ProfileHeader";
import TrustSection from "@/components/cliente/profile/TrustSection";
import { getPublicHostessProfile } from "@/src/services/hostesses";
import type { AnfitrioneProfileDetail } from "@/src/types/anfitrionaProfile";
import { useAuth } from "@/src/context/AuthContext";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { MaterialCommunityIcons } from "@expo/vector-icons";

export default function AnfitrioneProfileScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();

  const [profile, setProfile] = useState<AnfitrioneProfileDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void loadProfile();
  }, [id]);

  const loadProfile = async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const data = await getPublicHostessProfile(id);
      setProfile(data);
    } catch {
      setError("No se pudo cargar el perfil. Verifica tu conexión.");
    } finally {
      setLoading(false);
    }
  };

  /** Actualiza el estado local tras desbloquear una imagen premium. */
  const handleImageUnlocked = (imageId: string) => {
    setProfile((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        galleryImages: prev.galleryImages.map((img) =>
          img.id === imageId ? { ...img, isUnlockedByViewer: true } : img,
        ),
      };
    });
  };

  const handleChat = () => {
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

  return (
    <View style={{ flex: 1, backgroundColor: "#111" }}>
      <Stack.Screen options={{ headerShown: false }} />

      {/* Botón volver */}
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

      {/* Estado: cargando */}
      {loading && (
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
          <ActivityIndicator size="large" color="#ec4899" />
        </View>
      )}

      {/* Estado: error */}
      {!loading && error && (
        <View
          style={{
            flex: 1,
            alignItems: "center",
            justifyContent: "center",
            paddingHorizontal: 24,
          }}
        >
          <MaterialCommunityIcons name="wifi-off" size={48} color="#4b5563" style={{ marginBottom: 16 }} />
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

      {/* Estado: no encontrada */}
      {!loading && !error && !profile && (
        <View
          style={{
            flex: 1,
            alignItems: "center",
            justifyContent: "center",
            paddingHorizontal: 24,
          }}
        >
          <Text style={{ color: "#9ca3af", textAlign: "center", fontSize: 16 }}>
            Anfitriona no encontrada.
          </Text>
        </View>
      )}

      {/* Contenido principal */}
      {!loading && !error && profile && (
        <>
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: insets.bottom + 90 }}
          >
            <ProfileHeader
              name={profile.name}
              avatar={profile.avatar}
              coverImage={profile.coverImage}
              isOnline={profile.isOnline}
              likesCount={profile.likesCount}
              rateCredits={profile.rateCredits}
            />

            {/* Historias destacadas: solo si hay datos */}
            {profile.highlightedStories.length > 0 && (
              <HighlightStoriesRow stories={profile.highlightedStories} />
            )}

            {/* Galería: galleryImages es la fuente principal */}
            <GallerySection
              images={profile.galleryImages}
              anfitrionaId={id!}
              onImageUnlocked={handleImageUnlocked}
            />

            {/* Bio: IntroCard se oculta sola si está vacía */}
            <IntroCard message={profile.introMessage} />

            <TrustSection items={profile.trustItems} />
          </ScrollView>

          {/* Botón "Chatear ahora" fijo en la parte inferior */}
          <View
            style={{
              position: "absolute",
              bottom: 0,
              left: 0,
              right: 0,
              paddingHorizontal: 16,
              paddingBottom: insets.bottom + 12,
              paddingTop: 10,
              backgroundColor: "rgba(17,17,17,0.95)",
              borderTopWidth: 1,
              borderTopColor: "#1f1f1f",
            }}
          >
            <TouchableOpacity
              onPress={handleChat}
              activeOpacity={0.85}
              style={{
                backgroundColor: "#e11d48",
                borderRadius: 14,
                paddingVertical: 15,
                alignItems: "center",
                flexDirection: "row",
                justifyContent: "center",
                gap: 8,
              }}
            >
              <MaterialCommunityIcons name="chat" size={20} color="white" />
              <Text style={{ color: "white", fontWeight: "700", fontSize: 16 }}>
                Chatear ahora
              </Text>
            </TouchableOpacity>
          </View>
        </>
      )}
    </View>
  );
}
