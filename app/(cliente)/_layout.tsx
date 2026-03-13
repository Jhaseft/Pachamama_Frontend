import { Stack } from "expo-router";
import { View } from "react-native";
import BottomNav from "@/components/Menu/BottomNav";

export default function ClienteLayout() {
  return (
    <View style={{ flex: 1 }}>
      <Stack screenOptions={{headerShown: false}}/>
      <BottomNav role="cliente" />
    </View>
  );
}
