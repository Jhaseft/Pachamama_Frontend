import { Alert, ScrollView, View } from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import ScreenHeader from "@/components/Menu/ScreenHeader";
import ProfileSummary from "@/components/cliente/perfil/ProfileSummary";
import ProfileMenuSection from "@/components/cliente/perfil/ProfileMenuSection";
import LogoutButton from "@/components/cliente/perfil/LogoutButton";
import { useAuth } from "@/src/context/AuthContext";

export default function ClientePerfil() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const handleLogout = () => {
    Alert.alert(
      "Cerrar sesión",
      "¿Estás seguro de que quieres salir?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Salir",
          style: "destructive",
          onPress: async () => {
            await logout();
            router.replace("/(auth)/choose-access");
          },
        },
      ],
    );
  };

  const mainItems = [
    {
      label: "Mis datos",
      onPress: () => router.push("/(cliente)/mis-datos" as any),
    },
    {
      label: "Billetera",
      onPress: () => router.push("/(cliente)/credito" as any),
    },
    {
      label: "Historial",
      onPress: () => router.push("/(cliente)/historial" as any),
    },
  ];

  const secondaryItems = [
    {
      label: "Ayuda",
      onPress: () => router.push("/(cliente)/ayuda" as any),
    },
    {
      label: "Terminos y condiciones",
      onPress: () => router.push("/(cliente)/terminos" as any),
    },
  ];

  return (
    <View style={{ flex: 1, backgroundColor: "#0d0000" }}>
      <ScreenHeader title="Perfil" role="cliente" />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: 16,
          paddingTop: 20,
          paddingBottom: insets.bottom + 24,
          gap: 14,
        }}
      >
        {/* Resumen del usuario */}
        {user && <ProfileSummary user={user} />}

        {/* Sección principal: Mis datos, Billetera, Historial */}
        <ProfileMenuSection items={mainItems} />

        {/* Sección secundaria: Ayuda, Términos */}
        <ProfileMenuSection items={secondaryItems} />

        <View style={{ marginTop: 8 }}>
          <LogoutButton onPress={handleLogout} />
        </View>
      </ScrollView>
    </View>
  );
}
