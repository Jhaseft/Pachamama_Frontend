import { View, Text, Pressable, Alert } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import Screen from "../../components/Screen";

export default function ChooseAccess() {
  return (
    <Screen>
      <View className="mt-2">
        <Text className="text-white text-3xl font-semibold">Bienvenido</Text>
        <Text className="text-white/70 mt-2">
          Elige como quieres ingresar a la app
        </Text>
      </View>

      <View className="mt-8">
        <Pressable
          onPress={() => router.push("/(auth)/login-client")}
          className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5 mb-4"
        >
          <View className="flex-row items-center mb-3">
            <View className="w-10 h-10 rounded-full bg-red-600 items-center justify-center mr-3">
              <Ionicons name="person" size={20} color="white" />
            </View>
            <Text className="text-white text-lg font-semibold">Cliente</Text>
          </View>
          <Text className="text-white/60 text-sm">
            Accede a tus chats, pagos y historial.
          </Text>
        </Pressable>

        <Pressable
          onPress={() => router.push("/(auth)/login-host")}
          className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5"
        >
          <View className="flex-row items-center mb-3">
            <View className="w-10 h-10 rounded-full bg-red-600 items-center justify-center mr-3">
              <Ionicons name="people" size={20} color="white" />
            </View>
            <Text className="text-white text-lg font-semibold">Anfitriona</Text>
          </View>
          <Text className="text-white/60 text-sm">
            Gestiona tus clientes y tu agenda.
          </Text>
        </Pressable>
      </View>

      <Pressable
        onPress={() => Alert.alert("Acceso Admin", "Placeholder")}
        className="mt-8"
      >
        <Text className="text-white/50 text-center underline">
          Acceso Admin
        </Text>
      </Pressable>
    </Screen>
  );
}
