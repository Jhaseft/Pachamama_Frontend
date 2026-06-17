import { useState } from "react";
import {
  Modal,
  View,
  Text,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Pressable,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import TextField from "../TextField";
import { apiCompleteGoogleClientProfile } from "../../src/api/googleAuth";
import { useAuth } from "../../src/context/AuthContext";

interface Props {
  visible: boolean;
  onCompleted: (newToken: string, newUser: any) => void;
}

export default function CompleteProfileModal({ visible, onCompleted }: Props) {
  const { accessToken } = useAuth();
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSave = async () => {
    const trimmedName = name.trim();
    if (!trimmedName) return setError("Ingresa tu nombre.");
    if (!password || password.length < 6) return setError("La contraseña debe tener al menos 6 caracteres.");
    if (password !== confirm) return setError("Las contraseñas no coinciden.");
    if (!accessToken) return setError("Sesión no encontrada.");

    const [firstName, ...rest] = trimmedName.split(/\s+/);
    const lastName = rest.join(" ") || undefined;

    try {
      setLoading(true);
      setError("");
      const response = await apiCompleteGoogleClientProfile(
        { firstName, lastName, password, confirmPassword: confirm },
        accessToken,
      );
      onCompleted(response.access_token, response.user);
    } catch (err: any) {
      setError(err?.response?.data?.message ?? "No se pudo completar el perfil.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="fade" statusBarTranslucent>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1, justifyContent: "center", backgroundColor: "rgba(0,0,0,0.8)", paddingHorizontal: 20 }}
      >
        <View style={{ backgroundColor: "#0f0f0f", borderRadius: 28, maxHeight: "90%", overflow: "hidden", borderWidth: 1, borderColor: "rgba(196,24,24,0.2)" }}>

          {/* Header */}
          <LinearGradient
            colors={["#1a0208", "#6B0A0A", "#0f0f0f"]}
            style={{ paddingHorizontal: 24, paddingTop: 28, paddingBottom: 20 }}
          >
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <View style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: "rgba(196,24,24,0.25)", alignItems: "center", justifyContent: "center", marginRight: 12 }}>
                <Ionicons name="person-circle-outline" size={20} color="#C41818" />
              </View>
              <View>
                <Text style={{ color: "white", fontSize: 20, fontWeight: "700", letterSpacing: 0.3 }}>
                  Completa tu perfil
                </Text>
                <Text style={{ color: "rgba(255,255,255,0.35)", fontSize: 12, marginTop: 1 }}>
                  Solo se muestra una vez
                </Text>
              </View>
            </View>
          </LinearGradient>

          <ScrollView
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={{ paddingHorizontal: 24, paddingTop: 20, paddingBottom: 28 }}
            showsVerticalScrollIndicator={false}
          >
            {/* Info box */}
            <View style={{ flexDirection: "row", alignItems: "flex-start", backgroundColor: "rgba(196,24,24,0.07)", borderRadius: 12, padding: 14, marginBottom: 22, borderWidth: 1, borderColor: "rgba(196,24,24,0.15)" }}>
              <Ionicons name="information-circle-outline" size={16} color="rgba(196,24,24,0.8)" style={{ marginRight: 10, marginTop: 1 }} />
              <Text style={{ color: "rgba(255,255,255,0.5)", fontSize: 13, flex: 1, lineHeight: 19 }}>
                Agrega tu nombre y una contraseña para poder iniciar sesión sin Google en el futuro.
              </Text>
            </View>

            <Text style={{ color: "rgba(196,24,24,0.9)", fontSize: 11, fontWeight: "700", letterSpacing: 1.5, marginBottom: 12, textTransform: "uppercase" }}>
              Tus datos
            </Text>

            <TextField
              label="Nombre"
              placeholder="Tu nombre completo"
              value={name}
              onChangeText={setName}
              autoCapitalize="words"
              textContentType="name"
            />

            <Text style={{ color: "rgba(196,24,24,0.9)", fontSize: 11, fontWeight: "700", letterSpacing: 1.5, marginBottom: 12, marginTop: 8, textTransform: "uppercase" }}>
              Contraseña
            </Text>

            <TextField
              label="Contraseña"
              placeholder="Mínimo 6 caracteres"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              textContentType="newPassword"
            />
            <TextField
              label="Confirmar contraseña"
              placeholder="Repite la contraseña"
              value={confirm}
              onChangeText={setConfirm}
              secureTextEntry
              textContentType="newPassword"
            />

            {error ? (
              <View style={{ flexDirection: "row", alignItems: "center", backgroundColor: "rgba(248,113,113,0.1)", borderRadius: 10, padding: 12, marginBottom: 14, borderWidth: 1, borderColor: "rgba(248,113,113,0.2)" }}>
                <Ionicons name="alert-circle-outline" size={16} color="#f87171" style={{ marginRight: 8 }} />
                <Text style={{ color: "#f87171", fontSize: 13, flex: 1 }}>{error}</Text>
              </View>
            ) : null}

            <Pressable
              onPress={handleSave}
              disabled={loading}
              style={({ pressed }) => ({ opacity: pressed || loading ? 0.8 : 1, marginTop: 4 })}
            >
              <LinearGradient
                colors={["#1a0208", "#6B0A0A", "#C41818"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={{ borderRadius: 14, paddingVertical: 16, alignItems: "center", flexDirection: "row", justifyContent: "center", gap: 8 }}
              >
                {loading ? (
                  <ActivityIndicator color="white" size="small" />
                ) : (
                  <>
                    <Text style={{ color: "white", fontSize: 16, fontWeight: "700", letterSpacing: 0.3 }}>
                      Continuar
                    </Text>
                    <Ionicons name="arrow-forward" size={18} color="white" />
                  </>
                )}
              </LinearGradient>
            </Pressable>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}
