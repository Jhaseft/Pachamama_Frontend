import { useState } from "react";
import {
  Text,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { router } from "expo-router";
import Screen from "../../components/Screen";
import TextField from "../../components/TextField";
import PrimaryButton from "../../components/PrimaryButton";
import CheckboxRow from "../../components/CheckboxRow";

export default function Profile() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [accepted, setAccepted] = useState(false);

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
          <Text className="text-white text-3xl font-semibold">Tu perfil</Text>
          <Text className="text-white/70 mt-2 mb-6">
            Completa tu informacion para continuar.
          </Text>

          <TextField
            label="Nombre"
            placeholder="Tu nombre"
            value={name}
            onChangeText={setName}
            autoCapitalize="words"
            textContentType="name"
          />

          <TextField
            label="Email"
            placeholder="correo@ejemplo.com"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            textContentType="emailAddress"
          />

          <TextField
            label="Contrasena"
            placeholder="********"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            textContentType="password"
          />

          <TextField
            label="Confirmar contrasena"
            placeholder="********"
            value={confirm}
            onChangeText={setConfirm}
            secureTextEntry
            textContentType="password"
          />

          <CheckboxRow
            checked={accepted}
            onToggle={() => setAccepted((prev) => !prev)}
            label="He leido y acepto los terminos y condiciones."
          />

          <PrimaryButton
            title="Continuar"
            onPress={() => router.replace("/(app)/home-client")}
            disabled={!accepted}
            className="mt-6"
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
}