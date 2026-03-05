import { View, Text, TextInput } from "react-native";

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
}) {
  return (
    <View className="mb-4">
      {label ? (
        <Text className="text-white/80 text-sm mb-2">{label}</Text>
      ) : null}
      <View className="flex-row items-center bg-neutral-900 border border-neutral-800 rounded-xl px-4 py-3">
        {prefix ? (
          <Text className="text-white/70 mr-3">{prefix}</Text>
        ) : null}
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor="#666666"
          keyboardType={keyboardType}
          secureTextEntry={secureTextEntry}
          autoCapitalize={autoCapitalize}
          textContentType={textContentType}
          maxLength={maxLength}
          className="flex-1 text-white"
        />
      </View>
    </View>
  );
}