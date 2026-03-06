import { useState } from "react";
import {
  View,
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

export default function LoginHost() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSend = () => {
    router.replace("/(app)/home-host");
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
            Bienvenida de nuevo
          </Text>
          <Text className="text-white/70 text-lg mt-2 mb-6">
            Ingresa a tu panel de control.
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

          <View className="mt-4 rounded-2xl border border-white/20 bg-[#D9D9D9] px-4 py-3">
            <Text className="text-black text-base font-semibold text-center">
              Solo cuentas aprobadas
            </Text>
            <Text className="text-black text-sm text-center mt-2">
              Acceso exclusivo para anfitrionas verificadas y aprobadas por la
              administración.
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
}
