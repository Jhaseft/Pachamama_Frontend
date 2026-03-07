import { Stack } from "expo-router";
import { View } from "react-native";
import BottomNav from "@/components/Menu/BottomNav";

export default function AnfitrianaLayout() {
  return (
    <View style={{ flex: 1 }}>
      <Stack />
      <BottomNav role="anfitriona" />
    </View>
  );
}
