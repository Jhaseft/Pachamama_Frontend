import ScreenHeader from "@/components/Menu/ScreenHeader";
import { View, Text } from "react-native";

export default function AnfitrianaPerfil() {
  return (
    <View className="flex-1 items-center justify-center bg-white px-6">
      <ScreenHeader title="Perfil" role="anfitriona"/>
      <Text className="text-2xl font-bold text-gray-800">Perfil</Text>
      <Text className="text-base text-gray-500 mt-2">
        Tu información personal
      </Text>
    </View>
  );
}
