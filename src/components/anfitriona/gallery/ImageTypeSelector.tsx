import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

type Props = {
  isPremium: boolean;
  onChange: (value: boolean) => void;
};

export default function ImageTypeSelector({ isPremium, onChange }: Props) {
  return (
    <View style={{ flexDirection: 'row', gap: 12, width: '100%', marginTop: 16 }}>
      <TouchableOpacity
        onPress={() => onChange(false)}
        style={{
          flex: 1,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 8,
          paddingVertical: 12,
          borderRadius: 12,
          borderWidth: 1,
          backgroundColor: !isPremium ? '#132673' : 'rgba(19, 38, 115, 0.1)',
          borderColor: !isPremium ? '#132673' : 'rgba(19, 38, 115, 0.3)'
        }}
      >
        <MaterialCommunityIcons name="image-outline" size={18} color="white" />
        <Text style={{ color: 'white', fontWeight: '600' }}>Normal</Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => onChange(true)}
        style={{
          flex: 1,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 8,
          paddingVertical: 12,
          borderRadius: 12,
          borderWidth: 1,
          backgroundColor: isPremium ? '#a844f2' : 'rgba(168, 68, 242, 0.1)',
          borderColor: isPremium ? '#a844f2' : 'rgba(168, 68, 242, 0.3)'
        }}
      >
        <MaterialCommunityIcons name="lock" size={18} color="white" />
        <Text style={{ color: 'white', fontWeight: '600' }}>Exclusiva</Text>
      </TouchableOpacity>
    </View>
  );
}
