import { useMemo, useRef, useState } from "react";
import {
  View,
  Text,
  Pressable,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import Screen from "../../components/Screen";
import PrimaryButton from "../../components/PrimaryButton";

export default function Otp() {
  const { role, phone } = useLocalSearchParams();
  const roleValue = Array.isArray(role) ? role[0] : role || "client";
  const phoneValue = Array.isArray(phone) ? phone[0] : phone || "999999999";

  const [code, setCode] = useState("");
  const inputRef = useRef(null);

  const digits = useMemo(() => {
    const padded = (code + "      ").slice(0, 6);
    return padded.split("");
  }, [code]);

  const handleChange = (text) => {
    const onlyNumbers = text.replace(/\D/g, "").slice(0, 6);
    setCode(onlyNumbers);
  };

  const handleVerify = () => {
    if (roleValue === "host") {
      router.replace("/(app)/home-host");
      return;
    }
    router.replace("/(auth)/profile");
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

          <Text className="text-white text-3xl font-semibold">Codigo OTP</Text>
          <Text className="text-white/70 mt-2">
            Enviado al +51 {phoneValue}
          </Text>

          <Pressable
            onPress={() => inputRef.current?.focus()}
            className="flex-row justify-between mt-8"
          >
            {digits.map((digit, index) => (
              <View
                key={`digit-${index}`}
                className={`w-12 h-12 rounded-xl border border-neutral-700 items-center justify-center ${
                  digit.trim() ? "border-white" : ""
                }`}
              >
                <Text className="text-white text-xl">
                  {digit.trim()}
                </Text>
              </View>
            ))}
          </Pressable>

          <TextInput
            ref={inputRef}
            value={code}
            onChangeText={handleChange}
            keyboardType="number-pad"
            maxLength={6}
            className="absolute opacity-0"
          />

          <PrimaryButton
            title="Verificar"
            onPress={handleVerify}
            className="mt-8"
          />

          <Pressable
            onPress={() => Alert.alert("Reenviar", "Codigo reenviado")}
            className="mt-4"
          >
            <Text className="text-white/60 text-center underline">
              Reenviar codigo
            </Text>
          </Pressable>

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