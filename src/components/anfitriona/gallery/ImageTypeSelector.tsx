import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

type Props = {
  isPremium: boolean;
  onChange: (value: boolean) => void;
};

export default function ImageTypeSelector({ isPremium, onChange }: Props) {
  return (
    <View className="flex-row gap-3 w-full mt-4">
      <TouchableOpacity
        onPress={() => onChange(false)}
        className={`flex-1 flex-row items-center justify-center gap-2 py-3 rounded-xl border ${
          !isPremium ? 'bg-zinc-700 border-white/40' : 'bg-transparent border-zinc-600'
        }`}
      >
        <MaterialCommunityIcons name="image-outline" size={18} color="white" />
        <Text className="text-white font-semibold">Normal</Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => onChange(true)}
        className={`flex-1 flex-row items-center justify-center gap-2 py-3 rounded-xl border ${
          isPremium ? 'bg-red-600 border-red-400' : 'bg-transparent border-zinc-600'
        }`}
      >
        <MaterialCommunityIcons name="lock" size={18} color="white" />
        <Text className="text-white font-semibold">Exclusiva</Text>
      </TouchableOpacity>
    </View>
  );
}
