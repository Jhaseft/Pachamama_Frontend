import React from 'react';
import { View, Text, TextInput } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

type Props = {
  value: string;
  onChange: (v: string) => void;
};

export default function CreditsInput({ value, onChange }: Props) {
  return (
    <View className="w-full mt-3">
      <Text className="text-zinc-400 text-xs mb-1 uppercase tracking-widest">
        Créditos para desbloquear
      </Text>
      <View className="flex-row items-center bg-zinc-800 border border-zinc-600 rounded-xl px-4 py-3 gap-2">
        <MaterialCommunityIcons name="diamond-stone" size={18} color="#ef4444" />
        <TextInput
          className="flex-1 text-white p-0"
          keyboardType="numeric"
          placeholder="Ej: 30"
          placeholderTextColor="#52525b"
          value={value}
          onChangeText={onChange}
          returnKeyType="done"
        />
      </View>
    </View>
  );
}
