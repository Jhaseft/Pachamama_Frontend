import { View, Text, KeyboardAvoidingView, Platform, ScrollView, Pressable } from "react-native";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import TextField from "../../components/TextField";
import PrimaryButton from "../../components/PrimaryButton";
import IdDocPicker from "../../components/auth/IdDocPicker";
import TermsCheckbox from "../../components/auth/TermsCheckbox";
import { useAnfitrioneRegister } from "../../src/hooks/useAnfitrioneRegister";

export default function ProfileAnfitriona() {
  const {
    tempToken, checkingToken,
    firstName, setFirstName,
    lastName, setLastName,
    email, setEmail,
    password, setPassword,
    confirm, setConfirm,
    username, setUsername,
    dateOfBirth, setDateOfBirth,
    cedula, setCedula,
    idDoc, handlePickIdDoc, clearIdDoc,
    accepted, setAccepted,
    loading, error,
    handleSubmit,
  } = useAnfitrioneRegister();

  const insets = useSafeAreaInsets();

  if (!checkingToken && !tempToken) {
    return (
      <View style={{ flex: 1, backgroundColor: "#000", paddingHorizontal: 24, paddingTop: 40 }}>
        <Text className="text-white text-2xl font-semibold mt-8">
          Token temporal no encontrado
        </Text>
        <Text className="text-white/70 text-base mt-4">
          Vuelve a iniciar sesión para solicitar un nuevo código.
        </Text>
        <PrimaryButton
          title="Volver"
          onPress={() => router.replace("/(auth)/register-anfitriona")}
          className="mt-6"
        />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      style={{ flex: 1, backgroundColor: "#000" }}
    >
      <ScrollView
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ flexGrow: 1, paddingHorizontal: 24, paddingTop: 40, paddingBottom: insets.bottom + 24 }}
      >
        <Text className="text-white text-3xl font-semibold mt-8">Tu perfil</Text>
        <Text className="text-white/70 text-lg mt-2 mb-6">
          Completa tu información para registrarte como anfitriona.
        </Text>

        <TextField label="Nombre" placeholder="Camila" value={firstName} onChangeText={setFirstName} autoCapitalize="words" textContentType="givenName" />
        <TextField label="Apellido" placeholder="Sanches" value={lastName} onChangeText={setLastName} autoCapitalize="words" textContentType="familyName" />
        <TextField label="Nombre de usuario" placeholder="camila_princ" value={username} onChangeText={setUsername} />
        <TextField label="Cédula" placeholder="12345678" value={cedula} onChangeText={setCedula} keyboardType="numeric" maxLength={15} />
        <TextField label="Fecha de nacimiento" placeholder="1995-06-15" value={dateOfBirth} onChangeText={setDateOfBirth} keyboardType="numeric" />
        <TextField label="Email" placeholder="camila@gmail.com" value={email} onChangeText={setEmail} keyboardType="email-address" textContentType="emailAddress" />
        <TextField label="Contraseña" placeholder="********" value={password} onChangeText={setPassword} secureTextEntry textContentType="newPassword" />
        <TextField label="Confirmar contraseña" placeholder="********" value={confirm} onChangeText={setConfirm} secureTextEntry textContentType="newPassword" />

        <IdDocPicker idDoc={idDoc} onPick={handlePickIdDoc} onClear={clearIdDoc} />

        {error ? <Text className="text-red-400 text-sm mb-2">{error}</Text> : null}

        <TermsCheckbox accepted={accepted} onToggle={() => setAccepted((p) => !p)} />

        <PrimaryButton
          title={loading ? "Creando..." : "Crear cuenta"}
          onPress={handleSubmit}
          disabled={!accepted || loading}
          className="mt-2"
        />

        <Pressable onPress={() => router.replace("/(auth)/register-anfitriona")} className="mt-4">
          <Text className="text-white/60 text-center underline">Volver al inicio</Text>
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
