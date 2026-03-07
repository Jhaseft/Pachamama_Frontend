import React, { useState } from "react";
import { Alert, Pressable, Text, TextInput, View } from "react-native";
import * as DocumentPicker from "expo-document-picker";
import Screen from "@/components/Screen";
import PrimaryButton from "@/components/PrimaryButton";
import { useAuth } from "../../src/context/AuthContext";
import { createAnfitriona } from "../../src/services/anfitrionas";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { HostessForm, IdentityFile } from "../../src/types/hostess";
import { validateHostessForm } from "../../src/utils/hostessValidation";

export default function CreateHostessProfile() {
  const { accessToken } = useAuth();
  const [form, setForm] = useState<HostessForm>({
    firstName: "",
    lastName: "",
    phone: "",
    dateOfBirth: "",
    identityNumber: "",
    email: "",
    password: "",
    username: "",
  });
  const [idDocFile, setIdDocFile] = useState<IdentityFile | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = (key: keyof HostessForm, value: string) => {
    setForm((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handlePickIdDoc = async () => {
    const result = await DocumentPicker.getDocumentAsync({
      type: ["image/*", "application/pdf"],
      copyToCacheDirectory: true,
      multiple: false,
    });

    if (result.canceled) return;

    const asset = result.assets?.[0];
    if (!asset?.uri) return;

    setIdDocFile({
      uri: asset.uri,
      name: asset.name ?? "id_doc",
      type: asset.mimeType ?? "application/octet-stream",
    });
  };

  const handleSubmit = async () => {
    const validation = validateHostessForm(form);

    if (!validation.ok) {
      Alert.alert("Formulario incompleto", validation.message);
      return;
    }

    if (!accessToken) {
      setError("No hay sesion admin activa.");
      setSuccess("");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");
    
  };

  return (
    <Screen>
      <KeyboardAwareScrollView
        enableOnAndroid
        keyboardShouldPersistTaps="handled"
        extraScrollHeight={24}
        contentContainerStyle={{ paddingBottom: 24 }}
      >
        <View>
          <Text className="text-white font-bold text-2xl mt-4 mb-5">
            Crear perfil anfitriona
          </Text>
          <Text className="text-white font-bold text-lg text-center mb-4">
            Datos de la Anfitriona
          </Text>
          <Text className="text-white"> Nombre </Text>
          <TextInput
            className="bg-[#460202] rounded-lg p-3 mt-1 mb-4 text-white"
            placeholder="Nombre"
            placeholderTextColor="#d1b3b3"
            value={form.firstName}
            onChangeText={(text) => handleChange("firstName", text)}
          />

          <Text className="text-white"> Apellidos </Text>
          <TextInput
            className="bg-[#460202] rounded-lg p-3 mt-1 mb-4 text-white"
            placeholder="Apellidos"
            placeholderTextColor="#d1b3b3"
            value={form.lastName}
            onChangeText={(text) => handleChange("lastName", text)}
          />

          <View className="flex-row gap-3">
            <View className="flex-1">
              <Text className="text-white"> Teléfon </Text>
              <TextInput
                className="bg-[#460202] rounded-lg p-3 mt-1 mb-4 text-white"
                placeholder="Teléfono"
                placeholderTextColor="#d1b3b3"
                keyboardType="phone-pad"
                value={form.phone}
                onChangeText={(text) => handleChange("phone", text)}
              />
            </View>

            <View className="flex-1">
              <Text className="text-white"> Fecha de Nacimiento </Text>
              <TextInput
                className="bg-[#460202] rounded-lg p-3 mt-1 mb-4 text-white"
                placeholder="YYYY-MM-DD"
                placeholderTextColor="#d1b3b3"
                value={form.dateOfBirth}
                onChangeText={(text) => handleChange("dateOfBirth", text)}
              />
            </View>
          </View>

          <Text className="text-white"> Nombre de Usuario </Text>
          <TextInput
            className="bg-[#460202] rounded-lg p-3 mt-1 mb-4 text-white"
            placeholder="Nombre de Usuario"
            placeholderTextColor="#d1b3b3"
            value={form.username}
            onChangeText={(text) => handleChange("username", text)}
          />

          <Text className="text-white"> Documento de {"\n"} Identidad </Text>
          <TextInput
            className="bg-[#460202] rounded-lg p-3 mt-1 mb-4 text-white"
            placeholder="DNI"
            placeholderTextColor="#d1b3b3"
            value={form.identityNumber}
            onChangeText={(text) => handleChange("identityNumber", text)}
          />

          <Pressable
            className="bg-[#8B0000] rounded-lg p-3 mt-4 mb-4"
            onPress={handlePickIdDoc}
          >
            <Text className="text-white text-center font-bold">Subir DNI</Text>
          </Pressable>

          {idDocFile ? (
            <Text className="text-white/70 text-sm mb-4">
              Archivo seleccionado: {idDocFile.name}
            </Text>
          ) : null}

          {error ? (
            <Text className="text-red-400 text-sm mt-2">{error}</Text>
          ) : null}

          {success ? (
            <Text className="text-green-400 text-sm mt-2">{success}</Text>
          ) : null}

          <PrimaryButton
            title={loading ? "Creando..." : "Crear anfitriona"}
            onPress={handleSubmit}
            disabled={loading}
            className="mt-4"
          />
        </View>
      </KeyboardAwareScrollView>
    </Screen>
  );
}
