import { View, Text, ScrollView } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import ScreenHeader from "@/components/Menu/ScreenHeader";

export default function Terminos() {
  const insets = useSafeAreaInsets();

  return (
    <View style={{ flex: 1, backgroundColor: "#0f0f0f" }}>
      <ScreenHeader title="Términos y condiciones" role="cliente" showBackButton />

      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingTop: 24,
          paddingBottom: insets.bottom + 24,
        }}
      >
        <Text style={{ color: "#9ca3af", fontSize: 14, lineHeight: 22 }}>
          Los términos y condiciones del servicio Pachamama estarán disponibles próximamente.
        </Text>
      </ScrollView>
    </View>
  );
}
