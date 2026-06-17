import { Stack, usePathname } from "expo-router";
import { useEffect, useState } from "react";
import { View } from "react-native";
import BottomNav from "@/components/Menu/BottomNav";
import { useAuth } from "@/src/context/AuthContext";
import { useSocket } from "@/hooks/useSocket";
import CompleteProfileModal from "@/components/cliente/CompleteProfileModal";

// Mantiene un socket activo para todo el área cliente, de modo que
// la presencia del usuario se registre desde que entra a la sección,
// sin necesidad de abrir un chat.
function ClientePresence() {
  const { user } = useAuth();
  useSocket(user?.id ?? null);
  return null;
}

export default function ClienteLayout() {
  const pathname = usePathname();
  const { user, setSession } = useAuth();
  const [showProfileModal, setShowProfileModal] = useState(false);

  const hideNav =
    pathname.includes("/chat/") ||
    pathname.includes("story-viewer") ||
    pathname.includes("/call");

  useEffect(() => {
    if (user && !user.isProfileComplete) {
      setShowProfileModal(true);
    }
  }, [user?.isProfileComplete]);

  return (
    <View style={{ flex: 1 }}>
      <ClientePresence />
      <Stack screenOptions={{ headerShown: false }} />
      {!hideNav && <BottomNav role="cliente" />}
      <CompleteProfileModal
        visible={showProfileModal}
        onCompleted={(newToken, newUser) => {
          setSession(newToken, newUser);
          setShowProfileModal(false);
        }}
      />
    </View>
  );
}
