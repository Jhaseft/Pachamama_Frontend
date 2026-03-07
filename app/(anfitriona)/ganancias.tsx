import ScreenHeader from "@/components/Menu/ScreenHeader";
import { View, Text } from "react-native";

export default function AnfitrianaGanancias() {
  return (
    <View className="flex-1 items-center justify-center bg-white px-6">
      <ScreenHeader title="Ganancias" role="anfitriona" />
      <Text className="text-2xl font-bold text-gray-800">Ganancias</Text>
      <Text className="text-base text-gray-500 mt-2">
        Tu historial de ganancias
      </Text>
    </View>
  );
}
