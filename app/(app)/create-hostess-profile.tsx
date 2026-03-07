import React, { useState } from "react";
import { Pressable, ScrollView, Text, TextInput, View } from "react-native";
import Screen from "@/components/Screen";

type HostessForm = {
  firstName: string;
  lastName: string;
  phone: string;
  dateOfBirth: string;
  identityNumber: string;
  email: string;
  password: string;
  username: string;
  identityImage: string | null;
};

export default function CreateHostessProfile() {
  const [form, setForm] = useState<HostessForm>({
    firstName: "",
    lastName: "",
    phone: "",
    dateOfBirth: "",
    identityNumber: "",
    email: "",
    password: "",
    username: "",
    identityImage: null,
  });

  const handleChange = (key: keyof HostessForm, value: string) => {
    setForm((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  return (
    <Screen>
      <ScrollView>
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
                placeholder="DD/MM/AAAA"
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
            onPress={() => console.log(form)}
          >
            <Text className="text-white text-center font-bold">Subir DNI</Text>
          </Pressable>
        </View>
      </ScrollView>
    </Screen>
  );
}
