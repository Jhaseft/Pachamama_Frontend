import { useState } from "react";
import {
  Text,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
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
          <Pressable
            onPress={() => router.back()}
            className="mt-6 mb-6 flex-row items-center"
          >
            <Ionicons name="arrow-back" size={20} color="white" />
            <Text className="text-white text-base ml-2">Volver</Text>
          </Pressable>

          <Text className="text-white text-3xl font-bold">Ingresar</Text>
          <Text className="text-white/70 text-lg mt-2 mb-6">
            Te enviaremos un codigo de verificacion. {"\n"} {"\n"}
            Si es tu primera vez, se creara una cuenta automaticamente.
          </Text>

          <TextField
            label="Número de celular"
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
