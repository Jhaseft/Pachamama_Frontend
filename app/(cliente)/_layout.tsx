import { Stack, usePathname } from "expo-router";
import { View } from "react-native";
import BottomNav from "@/components/Menu/BottomNav";
import { useAuth } from "@/src/context/AuthContext";
import { useSocket } from "@/hooks/useSocket";

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
  const hideNav =
    pathname.includes("/chat/") ||
    pathname.includes("story-viewer") ||
    pathname.includes("/call");

  return (
    <View style={{ flex: 1 }}>
      <ClientePresence />
      <Stack screenOptions={{ headerShown: false }} />
      {!hideNav && <BottomNav role="cliente" />}
    </View>
  );
}
