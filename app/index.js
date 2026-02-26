import { View, Text } from "react-native";

export default function Home() {
  return (
    <View className="flex-1 items-center justify-center bg-white">
      <Text className="text-2xl font-bold text-gray-800">Hola Mundo</Text>
      <Text className="text-base text-gray-500 mt-2">Página de inicio</Text>
    </View>
  );
}
