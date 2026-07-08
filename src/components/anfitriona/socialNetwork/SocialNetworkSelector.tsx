import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, Image } from 'react-native';
import type { SocialNetwork } from '@/src/types/socialNetwork';

interface SocialNetworkSelectorProps {
  networks: SocialNetwork[];
  selectedNetworkId: string | null;
  onSelect: (networkId: string) => void;
}

export default function SocialNetworkSelector({
  networks,
  selectedNetworkId,
  onSelect,
}: SocialNetworkSelectorProps) {
  return (
    <View>
      <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: 12, marginBottom: 8 }}>
        Red social
      </Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ gap: 8 }}
      >
        {networks.map((network) => (
          <TouchableOpacity
            key={network.id}
            onPress={() => onSelect(network.id)}
            style={{
              paddingHorizontal: 12,
              paddingVertical: 5,
              borderRadius: 8,
              borderWidth: 2,
              borderColor:
                selectedNetworkId === network.id ? '#a844f2' : 'rgba(255,255,255,0.2)',
              backgroundColor:
                selectedNetworkId === network.id ? '#a844f220' : 'transparent',
              flexDirection: 'row',
              alignItems: 'center',
              gap: 6,
            }}
          >
            {network.iconPublicId && (
              <Image
                source={{ uri: network.icon }}
                style={{ width: 30, height: 30 }}
                resizeMode="contain"
              />
            )}
            <Text
              style={{
                color: selectedNetworkId === network.id ? '#a844f2' : 'rgba(255,255,255,0.5)',
                fontSize: 12,
                fontWeight: '600',
              }}
            >
              {network.name}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}
