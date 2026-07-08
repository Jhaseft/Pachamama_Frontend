import React from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import type { SocialLink } from '@/src/types/socialNetwork';

interface SocialNetworkItemProps {
  item: SocialLink;
  onEdit: (link: SocialLink) => void;
  onDelete: (id: string) => void;
}

export default function SocialNetworkItem({ item, onEdit, onDelete }: SocialNetworkItemProps) {
  const network = item.socialNetwork;

  return (
    <LinearGradient
      colors={['#1a0a1f', '#0f0f1e']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={{
        borderRadius: 10,
        marginBottom: 10,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: '#a844f240',
      }}
    >
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          paddingHorizontal: 12,
          paddingVertical: 12,
          gap: 12,
        }}
      >
        <View
          style={{
            width: 40,
            height: 40,
            borderRadius: 8,
            backgroundColor: '#a844f220',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {network?.iconPublicId ? (
            <Image
              source={{ uri: network.icon }}
              style={{ width: 40, height: 40 }}
              resizeMode="contain"
            />
          ) : (
            <MaterialCommunityIcons name="link" size={20} color="#a844f2" />
          )}
        </View>

        <View style={{ flex: 1 }}>
          <Text style={{ color: 'white', fontWeight: '600', fontSize: 13 }}>
            {network?.name || 'Red social'}
          </Text>
          <Text
            style={{
              color: 'rgba(255,255,255,0.5)',
              fontSize: 11,
              marginTop: 2,
            }}
            numberOfLines={1}
          >
            {item.url}
          </Text>
        </View>

        <TouchableOpacity onPress={() => onEdit(item)} style={{ padding: 8 }}>
          <MaterialCommunityIcons name="pencil" size={18} color="#a844f2" />
        </TouchableOpacity>

        <TouchableOpacity onPress={() => onDelete(item.id)} style={{ padding: 8 }}>
          <MaterialCommunityIcons name="trash-can" size={18} color="#f03eb3" />
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );
}
