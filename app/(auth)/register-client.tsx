import { useState } from "react";
import {
  Text,
  Pressable,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import Screen from "../../components/Screen";
import PrimaryButton from "../../components/PrimaryButton";
import GoogleButton from "../../components/GoogleButton";
import { sendOtp } from "../../src/services/auth";
import { useGoogleSignIn } from "../../src/hooks/useGoogleSignIn";
import { apiGoogleLoginCliente } from "../../src/api/googleAuth";
import { useAuth } from "../../src/context/AuthContext";

export default function LoginClient() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { setSession } = useAuth();
  const { getIdToken, loading: googleLoading, error: googleError, setError: setGoogleError } = useGoogleSignIn();

  const handleGoogleSignIn = async () => {
    setError("");
    setGoogleError("");
    const idToken = await getIdToken();
    if (!idToken) return;
    try {
      const result = await apiGoogleLoginCliente(idToken);
      await setSession(result.access_token, result.user);
      router.replace("/(cliente)");
    } catch (err: any) {
      setError(err?.response?.data?.message ?? "Error al iniciar sesión con Google.");
    }
  };

  const handleSend = async () => {
    const trimmedEmail = email.trim().toLowerCase();
    if (!trimmedEmail) {
      setError("Ingresa tu correo Gmail.");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      setError("Ingresa un correo válido.");
      return;
    }

    try {
      setLoading(true);
      setError("");
      await sendOtp(trimmedEmail);
      router.push({
        pathname: "/(auth)/otp",
        params: {
          role: "client",
          email: trimmedEmail,
        },
      });
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "No se pudo enviar el codigo.";
      setError(message);
    } finally {
      setLoading(false);
    }
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

          <Text className="text-white text-3xl font-bold">Crear cuenta</Text>
          <Text className="text-white/70 text-lg mt-2 mb-6">
            Te enviaremos un codigo de verificacion a tu correo Gmail. {"\n"} {"\n"}
            Completa tu registro para crear tu cuenta.
          </Text>

          <View className="mt-1">
            <Text className="text-white text-base mb-2">Correo Gmail</Text>
            <View className="h-14 rounded-2xl border border-white/20 bg-white/5 px-3 flex-row items-center">
              <TextInput
                className="flex-1 text-white text-lg"
                placeholder="tucorreo@gmail.com"
                placeholderTextColor="rgba(255,255,255,0.45)"
                keyboardType="email-address"
                autoCapitalize="none"
                value={email}
                onChangeText={setEmail}
                textContentType="emailAddress"
              />
            </View>
          </View>

          {error ? (
            <Text className="text-red-400 text-sm mt-2">{error}</Text>
          ) : null}

          <View className="mt-6">
            <PrimaryButton
              title={loading ? "Enviando..." : "Enviar codigo"}
              onPress={handleSend}
              disabled={loading}
            />
          </View>

          {(error || googleError) ? (
            <Text className="text-red-400 text-sm mt-2 text-center">{error || googleError}</Text>
          ) : null}

          <View className="flex-row items-center my-6">
            <View className="flex-1 h-px bg-white/20" />
            <Text className="text-white/40 mx-4">o</Text>
            <View className="flex-1 h-px bg-white/20" />
          </View>

          <GoogleButton onPress={handleGoogleSignIn} loading={googleLoading} />

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
