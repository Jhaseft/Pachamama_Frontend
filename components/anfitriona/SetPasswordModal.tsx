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
import { apiSetPassword } from "../../src/api/googleAuth";
import { useAuth } from "../../src/context/AuthContext";

interface Props {
  visible: boolean;
  onDone: () => void;
}

export default function SetPasswordModal({ visible, onDone }: Props) {
  const { accessToken } = useAuth();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSave = async () => {
    if (!password || password.length < 6) return setError("La contraseña debe tener al menos 6 caracteres.");
    if (password !== confirm) return setError("Las contraseñas no coinciden.");
    if (!accessToken) return setError("Sesión no encontrada.");

    try {
      setLoading(true);
      setError("");
      await apiSetPassword({ password, confirmPassword: confirm }, accessToken);
      onDone();
    } catch (err: any) {
      setError(err?.response?.data?.message ?? "No se pudo guardar la contraseña.");
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
        <View style={{ backgroundColor: "#0f0f0f", borderRadius: 28, overflow: "hidden", borderWidth: 1, borderColor: "rgba(160, 68, 242, 0.2)" }}>

          {/* Header */}
          <LinearGradient
            colors={["#1a0a2e", "#0f0f1e"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{ paddingHorizontal: 24, paddingTop: 28, paddingBottom: 20 }}
          >
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <View style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: "rgba(160, 68, 242, 0.25)", alignItems: "center", justifyContent: "center", marginRight: 12 }}>
                <Ionicons name="lock-closed" size={18} color="#a844f2" />
              </View>
              <View>
                <Text style={{ color: "white", fontSize: 20, fontWeight: "700", letterSpacing: 0.3 }}>
                  Crea tu contraseña
                </Text>
                <Text style={{ color: "rgba(255,255,255,0.35)", fontSize: 12, marginTop: 1 }}>
                  Necesaria para iniciar sesión sin Google
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
            <View style={{ flexDirection: "row", alignItems: "flex-start", backgroundColor: "rgba(160, 68, 242, 0.07)", borderRadius: 12, padding: 14, marginBottom: 22, borderWidth: 1, borderColor: "rgba(160, 68, 242, 0.15)", borderLeftWidth: 4, borderLeftColor: "#a844f2" }}>
              <Ionicons name="shield-checkmark-outline" size={16} color="#a844f2" style={{ marginRight: 10, marginTop: 1 }} />
              <Text style={{ color: "rgba(255,255,255,0.5)", fontSize: 13, flex: 1, lineHeight: 19 }}>
                Podrás usar esta contraseña junto a tu correo para ingresar sin necesidad de Google.
              </Text>
            </View>

            <Text style={{ color: "#a844f2", fontSize: 11, fontWeight: "700", letterSpacing: 1.5, marginBottom: 12, textTransform: "uppercase" }}>
              Nueva contraseña
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
              <View style={{ flexDirection: "row", alignItems: "center", backgroundColor: "rgba(240, 62, 179, 0.1)", borderRadius: 10, padding: 12, marginBottom: 14, borderWidth: 1, borderColor: "rgba(240, 62, 179, 0.3)", borderLeftWidth: 4, borderLeftColor: "#f03eb3" }}>
                <Ionicons name="alert-circle-outline" size={16} color="#f03eb3" style={{ marginRight: 8 }} />
                <Text style={{ color: "#f03eb3", fontSize: 13, flex: 1 }}>{error}</Text>
              </View>
            ) : null}

            <Pressable
              onPress={handleSave}
              disabled={loading}
              style={({ pressed }) => ({ opacity: pressed || loading ? 0.8 : 1, marginTop: 4 })}
            >
              <LinearGradient
                colors={["#f03eb3", "#a844f2"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={{ borderRadius: 14, paddingVertical: 16, alignItems: "center", flexDirection: "row", justifyContent: "center", gap: 8 }}
              >
                {loading ? (
                  <ActivityIndicator color="white" size="small" />
                ) : (
                  <>
                    <Ionicons name="lock-closed" size={16} color="white" />
                    <Text style={{ color: "white", fontSize: 16, fontWeight: "700", letterSpacing: 0.3 }}>
                      GUARDAR CONTRASEÑA
                    </Text>
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
