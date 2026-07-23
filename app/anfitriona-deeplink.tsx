import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, View, Text, TouchableOpacity, Linking } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { getPublicHostessProfileByUsername } from "@/src/services/hostesses";

export default function AnfitrionaDeepLink() {
  const { username } = useLocalSearchParams<{ username: string }>();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    resolveProfile();
  }, [username]);

  const resolveProfile = async () => {
    if (!username) {
      setError("Username no válido");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const profile = await getPublicHostessProfileByUsername(username);
      
      router.replace({
        pathname: "/(cliente)/anfitrionas/[id]/verperfil",
        params: { id: profile.id },
      });
    } catch (err: any) {
      const message = err?.response?.data?.message || "Creador de contenido no encontrado";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoToWeb = () => {
    Linking.openURL("https://monetizalab.vip").catch(() => {
      setError("No se pudo abrir Monetiza Lab");
    });
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#0a0000", alignItems: "center", justifyContent: "center", paddingHorizontal: 24 }}>
      {loading && (
        <>
          <ActivityIndicator size="large" color="#D11B1B" />
          <Text style={{ color: "rgba(255,255,255,0.5)", marginTop: 16, fontSize: 14 }}>
            Cargando perfil...
          </Text>
        </>
      )}

      {!loading && error && (
        <>
          <MaterialCommunityIcons name="alert-circle-outline" size={48} color="#f87171" style={{ marginBottom: 16 }} />
          <Text style={{ color: "white", textAlign: "center", fontSize: 16, marginBottom: 8, fontWeight: "600" }}>
            {error}
          </Text>
          <Text style={{ color: "rgba(255,255,255,0.5)", textAlign: "center", fontSize: 13, marginBottom: 24 }}>
            Explora más perfiles en Monetiza Lab
          </Text>
          <TouchableOpacity
            onPress={handleGoToWeb}
            style={{ backgroundColor: "#D11B1B", paddingHorizontal: 24, paddingVertical: 12, borderRadius: 999 }}
          >
            <Text style={{ color: "white", fontWeight: "600" }}>Ir a Monetiza Lab</Text>
          </TouchableOpacity>
        </>
      )}
    </View>
  );
}
