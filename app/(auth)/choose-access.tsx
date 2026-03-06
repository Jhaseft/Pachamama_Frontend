import { View, Text, Pressable, Alert } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import Screen from "../../components/Screen";

export default function ChooseAccess() {
  return (
    <Screen>
      <View className="mt-7">
        <Text className="text-white text-3xl font-semibold text-center">
          Bienvenido
        </Text>
        <Text className="text-white mt-2 text-center">
          Elige como quieres ingresar a la app
        </Text>
      </View>

      <View className="mt-8">
        <Pressable
          onPress={() => router.push("/(auth)/client-access")}
          className="bg-[#D9D9D9] border border-neutral-800 rounded-2xl p-5 py-14 mb-4 items-center"
        >
          <Ionicons name="person" size={50} color="black" />
          <View className="items-center mb-3">
            <Text className="text-black text-2xl font-semibold text-center">
              Cliente
            </Text>
          </View>
          <Text className="text-black text-lg text-center">
            Entrar / Crear cuenta
          </Text>
        </Pressable>

        <Pressable
          onPress={() => router.push("/(auth)/login-host")}
          className="bg-[#D9D9D9] border border-neutral-800 rounded-2xl p-5 py-14 mb-4 items-center"
        >
          <Ionicons name="person" size={50} color="black" />
          <View className="flex-row items-center mb-3">
            <Text className="text-black text-2xl font-semibold">Anfitriona</Text>
          </View>
          <Text className="text-black text-sm text-center">
            Ingresar (solo cuentas aprobadas) {"\n"}
            Las anfitrionas no pueden 
            registrase libremente Solo cuentas aprobadas por el administrador.
          </Text>
        </Pressable>
      </View>

      <Pressable
        onPress={() => router.push("/(auth)/login-admin")}
        className="mt-8"
      >
        <Text className="text-white text-lg text-center underline">
          Acceso Admin
        </Text>
      </Pressable>
    </Screen>
  );
}
