import { useEffect, useState } from "react";
import { Text } from "react-native";
import { router } from "expo-router";
import Screen from "../../components/Screen";
import { useAuth } from "../../src/context/AuthContext";
import { getProfile } from "../../src/services/auth";

export default function HomeAdmin() {
  const { accessToken, user, isHydrated, setSession, logout } = useAuth();
  const [error, setError] = useState("");

  useEffect(() => {
    const validate = async () => {
      if (!accessToken) {
        router.replace("/(auth)/choose-access");
        return;
      }
      try {
        const profile = await getProfile();
        if (profile.role !== "ADMIN") {
          setError("Acceso solo para administradores.");
          await logout();
          router.replace("/(auth)/choose-access");
          return;
        }
        await setSession(accessToken, profile);
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Sesión expirada.";
        setError(message);
        await logout();
        router.replace("/(auth)/choose-access");
      }
    };

    if (isHydrated) {
      void validate();
    }
  }, [accessToken, isHydrated, logout, setSession]);

  return (
    <Screen>
      <Text className="text-white text-3xl font-extrabold mt-8 mb-6">Crear perfil Anfitriona</Text>
      <Text className="text-white text-xl text-center">Datos de la Anfitriona</Text>
      
    </Screen>
  );
}
