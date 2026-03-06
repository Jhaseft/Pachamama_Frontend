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
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSend = () => {
    router.replace("/(app)/home-admin");
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

          <Text className="text-white text-3xl text-center font-bold mb-5">
            Bienvenido de nuevo
          </Text>
          <Text className="text-white/70 text-lg mt-2 mb-6">
            Ingresa tus credenciales para continuar.
          </Text>

          <TextField
            label="Email"
            placeholder="correo@ejemplo.com"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            textContentType="emailAddress"
          />

          <TextField
            label="Contraseña"
            placeholder="********"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            textContentType="password"
          />

          <PrimaryButton title="Iniciar sesión" onPress={handleSend} />

        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
}
