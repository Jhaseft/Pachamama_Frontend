import { Stack, usePathname } from "expo-router";
import { View } from "react-native";
import BottomNav from "@/components/Menu/BottomNav";

export default function AnfitrianaLayout() {
  const pathname = usePathname();
  const hideNav =
  pathname.includes("/chat/") ||
  pathname.includes("/precios") ||
  pathname.includes("/vista-previa");

  return (
    <View style={{ flex: 1 }}>
      <Stack screenOptions={{ headerShown: false }} />
      {!hideNav && <BottomNav role="anfitriona" />}
    </View>
  );
}
