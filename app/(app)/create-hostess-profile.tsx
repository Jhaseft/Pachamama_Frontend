import React, { useState } from "react";
import { ScrollView, Text, TextInput, View } from "react-native";
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
          <Text className="text-white font-bold text-2xl mt-4 mb-5">Crear perfil anfitriona</Text>
          <Text className="text-white font-bold text-lg text-center mb-4">Datos de la Anfitriona</Text>
          <Text className="text-white"> Nombre </Text>
          <TextInput>  
            placeholder="Nombre"
          </TextInput>
        </View>
      </ScrollView>
    </Screen>
  );
}
