import { useState } from "react";
import { View, Text, TextInput, TouchableOpacity } from "react-native";
import type { TextInputProps } from "react-native";
import { Ionicons } from "@expo/vector-icons";

type TextFieldProps = {
  label?: string;
  value?: string;
  onChangeText?: (text: string) => void;
  placeholder?: string;
  keyboardType?: TextInputProps["keyboardType"];
  secureTextEntry?: boolean;
  autoCapitalize?: TextInputProps["autoCapitalize"];
  prefix?: string;
  textContentType?: TextInputProps["textContentType"];
  maxLength?: number;
  editable?: boolean;
};

export default function TextField({
  label,
  value,
  onChangeText,
  placeholder,
  keyboardType,
  secureTextEntry,
  autoCapitalize = "none",
  prefix,
  textContentType,
  maxLength,
  editable = true,
}: TextFieldProps) {
  const [hidden, setHidden] = useState(true);

  return (
    <View className="mb-4">
      {label ? (
        <Text className="text-white text-xl font-bold mb-2">{label}</Text>
      ) : null}
      <View
        className={`flex-row items-center border rounded-xl px-4 py-3 ${
          editable ? "bg-neutral-900 border-white" : "bg-neutral-800 border-white/20"
        }`}
      >
        {prefix ? (
          <Text className="text-white/70 mr-3">{prefix}</Text>
        ) : null}
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor="#666666"
          keyboardType={keyboardType}
          secureTextEntry={secureTextEntry ? hidden : false}
          autoCapitalize={autoCapitalize}
          textContentType={textContentType}
          maxLength={maxLength}
          editable={editable}
          className={`flex-1 ${editable ? "text-white" : "text-white/50"}`}
        />
        {!editable ? (
          <Ionicons name="lock-closed" size={16} color="#666" style={{ marginLeft: 8 }} />
        ) : null}
        {secureTextEntry ? (
          <TouchableOpacity onPress={() => setHidden((h) => !h)} className="ml-2">
            <Ionicons
              name={hidden ? "eye-off-outline" : "eye-outline"}
              size={20}
              color="#999"
            />
          </TouchableOpacity>
        ) : null}
      </View>
    </View>
  );
}
