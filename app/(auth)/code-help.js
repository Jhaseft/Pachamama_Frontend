import { Text } from "react-native";
import { router } from "expo-router";
import Screen from "../../components/Screen";
import PrimaryButton from "../../components/PrimaryButton";

export default function CodeHelp() {
  return (
    <Screen className="items-center justify-center">
      <Text className="text-white text-2xl font-semibold mb-3">
        Problemas con el codigo
      </Text>
      <Text className="text-white/70 text-center mb-6">
        Si no recibes el codigo, intenta reenviarlo o contacta soporte.
      </Text>
      <PrimaryButton title="Volver" onPress={() => router.back()} />
    </Screen>
  );
}