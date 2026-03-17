import ScreenHeader from "@/components/Menu/ScreenHeader";
import { Link } from "expo-router";
import { View, Text, TouchableOpacity } from "react-native";

export default function AnfitrianaGanancias() {
  return (
    <View className="flex-1 items-center justify-center bg-white px-6">
      <ScreenHeader title="Ganancias" role="anfitriona" />
      <Text className="text-2xl font-bold text-gray-800">Ganancias</Text>
      <Text className="text-base text-gray-500 mt-2">
        Tu historial de ganancias
      </Text>

      {/* Enlace a la pantalla principal de anfitriona */}
      <Link href="/(auth)/choose-access" asChild>
        <TouchableOpacity className="mt-6 bg-black py-3 px-8 rounded-xl">
          <Text className="text-white font-bold">Ir a Panel login</Text>
        </TouchableOpacity>
      </Link>
    </View>
  );
}
