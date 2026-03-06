import { Pressable, Text } from "react-native";
import { router } from "expo-router";
import Screen from "../../components/Screen";
import PrimaryButton from "../../components/PrimaryButton";
import Ionicons from "@expo/vector-icons/build/Ionicons";

export default function CodeHelp() {
  return (
    <Screen className="items-center justify-center">
      <Pressable
        onPress={() => router.back()}
        className="mt-6 mb-6 flex-row items-center"
      >
        <Ionicons name="arrow-back" size={20} color="white" />
        <Text className="text-white text-base ml-2">Volver</Text>
      </Pressable>

      <Text className="text-white text-3xl font-bold">
        ¿No recibiste el código?
      </Text>
      <Text className="text-white/70 text-center mb-6">
        Seleccione una opción para ayudarte.
      </Text>
      <PrimaryButton
        title="Reenviar código OTP"
        onPress={() => router.back()}
      />
      <PrimaryButton
        title="Cambiar número."
        onPress={() => router.back()}
      />
      <PrimaryButton
        title="Contactar soporte"
        onPress={() => router.back()}
      />

      <Pressable
            onPress={() => router.back()}
            className="mt-6 mb-6 flex-row items-center"
          >
            <Text className="text-white text-base ml-2">Volver al Inicio</Text>
          </Pressable>
    </Screen>
  );
}
