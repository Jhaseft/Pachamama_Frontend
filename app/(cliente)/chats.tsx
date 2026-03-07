import ScreenHeader from "@/components/Menu/ScreenHeader";
import { View, Text } from "react-native";

export default function ClienteChats() {
  return (
    <View className="flex-1 items-center justify-center bg-white px-6">
      <ScreenHeader title="Chats" role="cliente"/>
      <Text className="text-2xl font-bold text-gray-800">Chats</Text>
      <Text className="text-base text-gray-500 mt-2">
        Tus conversaciones
      </Text>
    </View>
  );
}
