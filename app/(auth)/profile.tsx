import { useEffect, useState } from "react";
import {
  Text,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Pressable,
} from "react-native";
import { router } from "expo-router";
import Screen from "../../components/Screen";
import TextField from "../../components/TextField";
import PrimaryButton from "../../components/PrimaryButton";
import CheckboxRow from "../../components/CheckboxRow";
import { completeRegistration } from "../../src/services/auth";
import { useAuth } from "../../src/context/AuthContext";
import { getTempToken, removeTempToken } from "../../src/storage/authStorage";

export default function Profile() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [accepted, setAccepted] = useState(false);
  const [tempToken, setTempToken] = useState<string | null>(null);
  const [checkingToken, setCheckingToken] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const { setSession } = useAuth();

  useEffect(() => {
    const loadToken = async () => {
      const token = await getTempToken();
      setTempToken(token);
      setCheckingToken(false);
    };
    void loadToken();
  }, []);

  const handleContinue = async () => {
    if (!tempToken) {
      setError("No se encontr\u00f3 el token temporal.");
      return;
    }

    const trimmedName = name.trim();
    if (!trimmedName) {
      setError("Ingresa tu nombre.");
      return;
    }

    const trimmedEmail = email.trim().toLowerCase();
    if (!trimmedEmail) {
      setError("Ingresa tu correo electronico.");
      return;
    }

    const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail);
    if (!isEmail) {
      setError("Ingresa un correo válido.");
      return;
    }

    if (!password || password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres.");
      return;
    }

    if (password !== confirm) {
      setError("Las contraseñas no coinciden.");
      return;
    }

    const [firstName, ...rest] = trimmedName.split(/\s+/);
    const lastName = rest.join(" ");

    try {
      setLoading(true);
      setError("");
      const response = await completeRegistration({
        tempToken,
        firstName,
        lastName,
        email: trimmedEmail,
        password,
        confirmPassword: confirm,
      });
      await setSession(response.access_token, response.user);
      await removeTempToken();
      router.replace("/(app)/home-client");
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "No se pudo completar el registro.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  if (!checkingToken && !tempToken) {
    return (
      <Screen>
        <Text className="text-white text-2xl font-semibold mt-8">
          Token temporal no encontrado
        </Text>
        <Text className="text-white/70 text-base mt-4">
          Vuelve a iniciar sesion para solicitar un nuevo codigo.
        </Text>
        <PrimaryButton
          title="Volver a login"
          onPress={() => router.replace("/(auth)/client-access")}
          className="mt-6"
        />
      </Screen>
    );
  }

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
          <Text className="text-white text-3xl font-semibold mt-8">Tu perfil</Text>
          <Text className="text-white/70 text-lg mt-5 mb-6">
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
            label="He leido y acepto los Terminos y Condiciones de uso."
          />

          {error ? (
            <Text className="text-red-400 text-sm mt-2">{error}</Text>
          ) : null}

          <PrimaryButton
            title={loading ? "Guardando..." : "Continuar"}
            onPress={handleContinue}
            disabled={!accepted || loading}
            className="mt-6"
          />

          <Pressable
            onPress={() => router.replace("/(auth)/client-access")}
            className="mt-4"
          >
            <Text className="text-white/60 text-center underline">
              Volver al login
            </Text>
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
}
