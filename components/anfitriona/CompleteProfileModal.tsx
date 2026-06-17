import { useRef, useState } from "react";
import {
  Modal,
  View,
  Text,
  TextInput,
  ScrollView,
  Pressable,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import TextField from "../TextField";
import PrimaryButton from "../PrimaryButton";
import { apiCompleteGoogleAnfitrioneProfile } from "../../src/api/googleAuth";
import { useAuth } from "../../src/context/AuthContext";

interface Props {
  visible: boolean;
  onCompleted: (newToken: string, newUser: any) => void;
}

export default function CompleteProfileModal({ visible, onCompleted }: Props) {
  const { accessToken } = useAuth();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [username, setUsername] = useState("");
  const [cedula, setCedula] = useState("");
  const [referralCode, setReferralCode] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [idDoc, setIdDoc] = useState<{ uri: string; name: string; type: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const monthRef = useRef<TextInput>(null);
  const dayRef = useRef<TextInput>(null);

  const dobParts = dateOfBirth.split("-");
  const dobYear = dobParts[0] ?? "";
  const dobMonth = dobParts[1] ?? "";
  const dobDay = dobParts[2] ?? "";

  const handleYearChange = (text: string) => {
    const d = text.replace(/[^0-9]/g, "").slice(0, 4);
    setDateOfBirth([d, dobMonth, dobDay].filter(Boolean).join("-"));
    if (d.length === 4) monthRef.current?.focus();
  };
  const handleMonthChange = (text: string) => {
    const d = text.replace(/[^0-9]/g, "").slice(0, 2);
    setDateOfBirth([dobYear, d, dobDay].filter(Boolean).join("-"));
    if (d.length === 2) dayRef.current?.focus();
  };
  const handleDayChange = (text: string) => {
    const d = text.replace(/[^0-9]/g, "").slice(0, 2);
    setDateOfBirth([dobYear, dobMonth, d].filter(Boolean).join("-"));
  };

  const handlePickDoc = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
    });
    if (!result.canceled && result.assets[0]) {
      const asset = result.assets[0];
      const name = asset.uri.split("/").pop() ?? "idDoc.jpg";
      const type = asset.mimeType ?? "image/jpeg";
      setIdDoc({ uri: asset.uri, name, type });
    }
  };

  const handleSubmit = async () => {
    if (!firstName.trim()) return setError("Ingresa tu nombre.");
    if (!lastName.trim()) return setError("Ingresa tu apellido.");
    if (!username.trim()) return setError("Ingresa un nombre de usuario.");
    if (!cedula.trim()) return setError("Ingresa tu cédula.");
    if (!dobYear || !dobMonth || !dobDay) return setError("Ingresa tu fecha de nacimiento completa.");
    if (!accessToken) return setError("Sesión no encontrada.");

    try {
      setLoading(true);
      setError("");
      const result = await apiCompleteGoogleAnfitrioneProfile(
        {
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          username: username.trim(),
          cedula: cedula.trim(),
          dateOfBirth,
          referralCode: referralCode.trim() || undefined,
        },
        idDoc,
        accessToken,
      );
      onCompleted(result.access_token, result.user);
    } catch (err: any) {
      setError(err?.response?.data?.message ?? "No se pudo completar el perfil.");
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = {
    backgroundColor: "#1e1e1e",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
    borderRadius: 12,
    color: "#fff",
    fontSize: 15,
    paddingHorizontal: 14,
    paddingVertical: 13,
    textAlign: "center" as const,
  };

  return (
    <Modal visible={visible} transparent animationType="fade" statusBarTranslucent>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1, justifyContent: "center", backgroundColor: "rgba(0,0,0,0.8)", paddingHorizontal: 20 }}
      >
        <View style={{ backgroundColor: "#0f0f0f", borderRadius: 28, maxHeight: "90%", overflow: "hidden", borderWidth: 1, borderColor: "rgba(196,24,24,0.2)" }}>

          {/* Header con gradiente */}
          <LinearGradient
            colors={["#1a0208", "#6B0A0A", "#0f0f0f"]}
            style={{ paddingHorizontal: 24, paddingTop: 28, paddingBottom: 20 }}
          >
            <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 6 }}>
              <View style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: "rgba(196,24,24,0.25)", alignItems: "center", justifyContent: "center", marginRight: 12 }}>
                <Ionicons name="person-add" size={18} color="#C41818" />
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
            contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 28 }}
            showsVerticalScrollIndicator={false}
          >
            {/* Sección: Datos personales */}
            <Text style={{ color: "rgba(196,24,24,0.9)", fontSize: 11, fontWeight: "700", letterSpacing: 1.5, marginBottom: 12, textTransform: "uppercase" }}>
              Datos personales
            </Text>

            <View style={{ flexDirection: "row", gap: 10, marginBottom: 4 }}>
              <View style={{ flex: 1 }}>
                <TextField label="Nombre" placeholder="Camila" value={firstName} onChangeText={setFirstName} autoCapitalize="words" />
              </View>
              <View style={{ flex: 1 }}>
                <TextField label="Apellido" placeholder="Sanches" value={lastName} onChangeText={setLastName} autoCapitalize="words" />
              </View>
            </View>

            <TextField label="Nombre de usuario" placeholder="camila_princ" value={username} onChangeText={setUsername} />
            <TextField label="Cédula de identidad" placeholder="12345678" value={cedula} onChangeText={setCedula} keyboardType="numeric" maxLength={15} />

            {/* Fecha de nacimiento */}
            <Text style={{ color: "rgba(255,255,255,0.5)", fontSize: 13, marginBottom: 8, marginTop: 4 }}>
              Fecha de nacimiento
            </Text>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 16 }}>
              <View style={{ flex: 2 }}>
                <Text style={{ color: "rgba(255,255,255,0.25)", fontSize: 10, marginBottom: 5, textAlign: "center", textTransform: "uppercase", letterSpacing: 1 }}>Año</Text>
                <TextInput value={dobYear} onChangeText={handleYearChange} placeholder="AAAA" placeholderTextColor="rgba(255,255,255,0.2)" keyboardType="number-pad" maxLength={4} style={inputStyle} />
              </View>
              <Text style={{ color: "rgba(255,255,255,0.2)", fontSize: 22, marginTop: 18 }}>—</Text>
              <View style={{ flex: 1 }}>
                <Text style={{ color: "rgba(255,255,255,0.25)", fontSize: 10, marginBottom: 5, textAlign: "center", textTransform: "uppercase", letterSpacing: 1 }}>Mes</Text>
                <TextInput ref={monthRef} value={dobMonth} onChangeText={handleMonthChange} placeholder="MM" placeholderTextColor="rgba(255,255,255,0.2)" keyboardType="number-pad" maxLength={2} style={inputStyle} />
              </View>
              <Text style={{ color: "rgba(255,255,255,0.2)", fontSize: 22, marginTop: 18 }}>—</Text>
              <View style={{ flex: 1 }}>
                <Text style={{ color: "rgba(255,255,255,0.25)", fontSize: 10, marginBottom: 5, textAlign: "center", textTransform: "uppercase", letterSpacing: 1 }}>Día</Text>
                <TextInput ref={dayRef} value={dobDay} onChangeText={handleDayChange} placeholder="DD" placeholderTextColor="rgba(255,255,255,0.2)" keyboardType="number-pad" maxLength={2} style={inputStyle} />
              </View>
            </View>

            {/* Separador */}
            <View style={{ height: 1, backgroundColor: "rgba(255,255,255,0.05)", marginVertical: 16 }} />

            {/* Sección: Extras */}
            <Text style={{ color: "rgba(196,24,24,0.9)", fontSize: 11, fontWeight: "700", letterSpacing: 1.5, marginBottom: 12, textTransform: "uppercase" }}>
              Extras
            </Text>

            <TextField
              label="Código de referido"
              placeholder="Opcional"
              value={referralCode}
              onChangeText={setReferralCode}
              autoCapitalize="characters"
            />

            {/* Botón subir documento */}
            <Text style={{ color: "rgba(255,255,255,0.5)", fontSize: 13, marginBottom: 8, marginTop: 4 }}>
              Documento de identidad
            </Text>
            <Pressable
              onPress={handlePickDoc}
              style={({ pressed }) => ({
                borderWidth: 1.5,
                borderColor: idDoc ? "rgba(196,24,24,0.5)" : "rgba(255,255,255,0.08)",
                borderRadius: 16,
                borderStyle: idDoc ? "solid" : "dashed",
                marginBottom: 20,
                backgroundColor: idDoc ? "rgba(196,24,24,0.07)" : "rgba(255,255,255,0.02)",
                overflow: "hidden",
                opacity: pressed ? 0.75 : 1,
              })}
            >
              {idDoc ? (
                /* Estado: archivo seleccionado */
                <View style={{ flexDirection: "row", alignItems: "center", padding: 14 }}>
                  <View style={{ width: 42, height: 42, borderRadius: 12, backgroundColor: "rgba(196,24,24,0.15)", alignItems: "center", justifyContent: "center", marginRight: 14 }}>
                    <Ionicons name="document-text" size={22} color="#C41818" />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ color: "#fff", fontSize: 14, fontWeight: "600" }} numberOfLines={1}>
                      {idDoc.name}
                    </Text>
                    <Text style={{ color: "rgba(196,24,24,0.8)", fontSize: 11, marginTop: 2, fontWeight: "500" }}>
                      Documento listo · Toca para cambiar
                    </Text>
                  </View>
                  <Pressable
                    onPress={() => setIdDoc(null)}
                    hitSlop={10}
                    style={{ padding: 4 }}
                  >
                    <View style={{ width: 24, height: 24, borderRadius: 12, backgroundColor: "rgba(255,255,255,0.08)", alignItems: "center", justifyContent: "center" }}>
                      <Ionicons name="close" size={14} color="rgba(255,255,255,0.5)" />
                    </View>
                  </Pressable>
                </View>
              ) : (
                /* Estado: sin archivo */
                <View style={{ alignItems: "center", paddingVertical: 24, paddingHorizontal: 16 }}>
                  <View style={{ width: 52, height: 52, borderRadius: 16, backgroundColor: "rgba(255,255,255,0.05)", alignItems: "center", justifyContent: "center", marginBottom: 12 }}>
                    <Ionicons name="cloud-upload-outline" size={26} color="rgba(255,255,255,0.3)" />
                  </View>
                  <Text style={{ color: "rgba(255,255,255,0.7)", fontSize: 14, fontWeight: "600", marginBottom: 4 }}>
                    Subir documento
                  </Text>
                  <Text style={{ color: "rgba(255,255,255,0.3)", fontSize: 12 }}>
                    Cédula o pasaporte · JPG, PNG
                  </Text>
                </View>
              )}
            </Pressable>

            {error ? (
              <View style={{ flexDirection: "row", alignItems: "center", backgroundColor: "rgba(248,113,113,0.1)", borderRadius: 10, padding: 12, marginBottom: 14, borderWidth: 1, borderColor: "rgba(248,113,113,0.2)" }}>
                <Ionicons name="alert-circle-outline" size={16} color="#f87171" style={{ marginRight: 8 }} />
                <Text style={{ color: "#f87171", fontSize: 13, flex: 1 }}>{error}</Text>
              </View>
            ) : null}

            <Pressable
              onPress={handleSubmit}
              disabled={loading}
              style={({ pressed }) => ({ opacity: pressed || loading ? 0.8 : 1 })}
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
                    <Text style={{ color: "white", fontSize: 16, fontWeight: "700", letterSpacing: 0.3 }}>Continuar</Text>
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
