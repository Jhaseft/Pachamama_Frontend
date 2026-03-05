import { useState } from "react";
import {
  Text,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { router } from "expo-router";
import Screen from "../../components/Screen";
import TextField from "../../components/TextField";
import PrimaryButton from "../../components/PrimaryButton";

export default function LoginClient() {
  const [phone, setPhone] = useState("");

  const handleSend = () => {
    const value = phone.trim() || "999999999";
    router.push({
      pathname: "/(auth)/otp",
      params: { role: "client", phone: value },
    });
  };

  return (
    <Screen>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        className="flex-1"
      >
        <ScrollView
          keyboardShouldPersistTaps="handled"
          contentContainerClassName="flex-grow"
        >
          <Pressable onPress={() => router.back()} className="mb-6">
            <Text className="text-white text-base">? Volver</Text>
          </Pressable>

          <Text className="text-white text-3xl font-semibold">Ingresar</Text>
          <Text className="text-white/70 mt-2 mb-6">
            Ingresa como cliente para continuar.
          </Text>

          <TextField
            label="Numero de celular"
            placeholder="999 999 999"
            keyboardType="phone-pad"
            value={phone}
            onChangeText={setPhone}
            prefix="PE +51"
            textContentType="telephoneNumber"
            maxLength={15}
          />

          <PrimaryButton title="Enviar codigo" onPress={handleSend} />

          <Pressable
            onPress={() => router.push("/(auth)/code-help")}
            className="mt-6"
          >
            <Text className="text-white/60 text-center underline">
              Problemas con el codigo
            </Text>
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
}
