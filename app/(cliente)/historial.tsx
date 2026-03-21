import { View, Text } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import ScreenHeader from "@/components/Menu/ScreenHeader";

export default function Historial() {
  return (
    <View style={{ flex: 1, backgroundColor: "#0f0f0f" }}>
      <ScreenHeader title="Historial" role="cliente" showBackButton />

      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: 24 }}>
        <MaterialCommunityIcons name="history" size={48} color="#3f3f46" style={{ marginBottom: 16 }} />
        <Text style={{ color: "#9ca3af", fontSize: 16, textAlign: "center" }}>
          Tu historial de actividad aparecerá aquí
        </Text>
      </View>
    </View>
  );
}
