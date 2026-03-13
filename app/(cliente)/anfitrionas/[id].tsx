import GallerySection from "@/components/cliente/profile/GallerySection";
import HighlightStoriesRow from "@/components/cliente/profile/HighlightStoriesRow";
import IntroCard from "@/components/cliente/profile/IntroCard";
import ProfileHeader from "@/components/cliente/profile/ProfileHeader";
import TrustSection from "@/components/cliente/profile/TrustSection";
import { getPublicHostessProfile } from "@/src/services/hostesses";
import type { AnfitrioneProfileDetail } from "@/src/types/anfitrionaProfile";
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

export default function AnfitrioneProfileScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();

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

  return (
    <View style={{ flex: 1, backgroundColor: "#111" }}>
      <Stack.Screen options={{ headerShown: false }} />
      {/* Back button */}
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

      {/* Loading */}
      {loading && (
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
          <ActivityIndicator size="large" color="#E30708" />
        </View>
      )}

      {/* Error */}
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

      {/* Not found */}
      {!loading && !error && !profile && (
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: 24 }}>
          <Text style={{ color: "#9ca3af", textAlign: "center", fontSize: 16 }}>
            Anfitriona no encontrada.
          </Text>
        </View>
      )}

      {/* Profile content */}
      {!loading && !error && profile && (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: insets.bottom + 20 }}
        >
          <ProfileHeader
            username={profile.username}
            avatar={profile.avatar}
            coverImage={profile.coverImage}
            isOnline={profile.isOnline}
          />

          <HighlightStoriesRow stories={profile.highlightedStories} />

          <GallerySection images={profile.galleryImages} />

          <IntroCard message={profile.introMessage} />

          <TrustSection items={profile.trustItems} />
        </ScrollView>
      )}
    </View>
  );
}
