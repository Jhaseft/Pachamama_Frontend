import React from 'react';
import { View, Text, ActivityIndicator, FlatList } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import type { SocialLink } from '@/src/types/socialNetwork';
import SocialNetworkItem from './SocialNetworkItem';

interface SocialNetworkListProps {
  links: SocialLink[];
  loading: boolean;
  onEdit: (link: SocialLink) => void;
  onDelete: (id: string) => void;
}

export default function SocialNetworkList({
  links,
  loading,
  onEdit,
  onDelete,
}: SocialNetworkListProps) {
  return (
    <View>
      <Text style={{ color: '#a844f2', fontSize: 16, fontWeight: '600', marginBottom: 12 }}>
        Mis redes sociales ({links.length})
      </Text>

      {loading ? (
        <ActivityIndicator color="#a844f2" size="large" style={{ marginVertical: 20 }} />
      ) : links.length === 0 ? (
        <View style={{ alignItems: 'center', paddingVertical: 24 }}>
          <MaterialCommunityIcons name="link-off" size={40} color="rgba(255,255,255,0.2)" />
          <Text style={{ color: 'rgba(255,255,255,0.4)', marginTop: 8 }}>
            No tienes redes sociales agregadas
          </Text>
        </View>
      ) : (
        <FlatList
          scrollEnabled={false}
          data={links}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <SocialNetworkItem item={item} onEdit={onEdit} onDelete={onDelete} />
          )}
        />
      )}
    </View>
  );
}
