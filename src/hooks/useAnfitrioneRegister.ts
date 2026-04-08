import { useEffect, useState } from "react";
import * as ImagePicker from "expo-image-picker";
import { router } from "expo-router";
import { apiCompleteAnfitrioneRegistration } from "../api/registerAnfitriona";
import { useAuth } from "../context/AuthContext";
import { getTempToken, removeTempToken } from "../storage/authStorage";

export type IdDoc = { uri: string; name: string; type: string };

export function useAnfitrioneRegister() {
  const [tempToken, setTempTokenState] = useState<string | null>(null);
  const [checkingToken, setCheckingToken] = useState(true);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [username, setUsername] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [cedula, setCedula] = useState("");
  const [idDoc, setIdDoc] = useState<IdDoc | null>(null);
  const [accepted, setAccepted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const { setSession } = useAuth();

  useEffect(() => {
    getTempToken().then((token) => {
      setTempTokenState(token);
      setCheckingToken(false);
    });
  }, []);

  const handlePickIdDoc = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      quality: 0.8,
    });
    if (!result.canceled && result.assets[0]) {
      const asset = result.assets[0];
      setIdDoc({
        uri: asset.uri,
        name: asset.uri.split("/").pop() ?? "id_doc.jpg",
        type: asset.mimeType ?? "image/jpeg",
      });
    }
  };

  const validate = (): string | null => {
    if (!firstName.trim()) return "Ingresa tu nombre.";
    if (!lastName.trim()) return "Ingresa tu apellido.";
    if (!username.trim()) return "Ingresa un nombre de usuario.";
    if (!cedula.trim()) return "Ingresa tu cédula.";
    if (!dateOfBirth.trim()) return "Ingresa tu fecha de nacimiento (YYYY-MM-DD).";
    if (!/^\d{4}-\d{2}-\d{2}$/.test(dateOfBirth.trim())) return "Formato de fecha inválido. Usa YYYY-MM-DD.";
    if (!password || password.length < 6) return "La contraseña debe tener al menos 6 caracteres.";
    if (password !== confirm) return "Las contraseñas no coinciden.";
    if (!email.trim()) return "Ingresa tu correo electrónico.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) return "Ingresa un correo válido.";
    if (!idDoc) return "Debes subir una imagen de tu documento de identidad.";
    return null;
  };

  const handleSubmit = async () => {
    if (!tempToken) { setError("No se encontró el token temporal."); return; }
    const validationError = validate();
    if (validationError) { setError(validationError); return; }

    try {
      setLoading(true);
      setError("");
      const result = await apiCompleteAnfitrioneRegistration({
        tempToken,
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.trim().toLowerCase(),
        password,
        confirmPassword: confirm,
        username: username.trim(),
        dateOfBirth: dateOfBirth.trim(),
        cedula: cedula.trim(),
        idDoc: idDoc ?? undefined,
      });
      await setSession(result.access_token, result.user);
      await removeTempToken();
      router.replace("/(anfitriona)");
    } catch (err: any) {
      setError(typeof err === "string" ? err : "No se pudo completar el registro.");
    } finally {
      setLoading(false);
    }
  };

  return {
    // token state
    tempToken, checkingToken,
    // fields
    firstName, setFirstName,
    lastName, setLastName,
    email, setEmail,
    password, setPassword,
    confirm, setConfirm,
    username, setUsername,
    dateOfBirth, setDateOfBirth,
    cedula, setCedula,
    idDoc, handlePickIdDoc, clearIdDoc: () => setIdDoc(null),
    // form state
    accepted, setAccepted,
    loading, error,
    handleSubmit,
  };
}
