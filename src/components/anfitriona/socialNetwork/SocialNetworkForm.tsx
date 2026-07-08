import React from 'react';
import { View, Text, TouchableOpacity, TextInput, ActivityIndicator } from 'react-native';
import type { SocialNetwork } from '@/src/types/socialNetwork';
import SocialNetworkSelector from './SocialNetworkSelector';

interface SocialNetworkFormProps {
  networks: SocialNetwork[];
  selectedNetworkId: string | null;
  url: string;
  editingId: string | null;
  submitting: boolean;
  onNetworkSelect: (networkId: string) => void;
  onUrlChange: (url: string) => void;
  onSubmit: () => void;
  onCancel: () => void;
}

export default function SocialNetworkForm({
  networks,
  selectedNetworkId,
  url,
  editingId,
  submitting,
  onNetworkSelect,
  onUrlChange,
  onSubmit,
  onCancel,
}: SocialNetworkFormProps) {
  return (
    <View style={{ marginBottom: 24 }}>
      <Text style={{ color: '#a844f2', fontSize: 16, fontWeight: '600', marginBottom: 12 }}>
        {editingId ? 'Editar red social' : 'Agregar nueva red social'}
      </Text>

      <SocialNetworkSelector
        networks={networks}
        selectedNetworkId={selectedNetworkId}
        onSelect={onNetworkSelect}
      />

      <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: 12, marginBottom: 8, marginTop: 16 }}>
        URL o usuario
      </Text>
      <TextInput
        placeholder="https://instagram.com/tuusuario"
        placeholderTextColor="rgba(255,255,255,0.3)"
        value={url}
        onChangeText={onUrlChange}
        style={{
          backgroundColor: '#0f0f1e',
          borderWidth: 1,
          borderColor: 'rgba(255,255,255,0.2)',
          borderRadius: 8,
          paddingHorizontal: 12,
          paddingVertical: 10,
          color: 'white',
          marginBottom: 16,
        }}
      />

      <View style={{ flexDirection: 'row', gap: 10 }}>
        <TouchableOpacity
          onPress={onCancel}
          disabled={submitting}
          style={{
            flex: 1,
            paddingVertical: 12,
            borderRadius: 8,
            borderWidth: 1,
            borderColor: '#a844f2',
            alignItems: 'center',
          }}
        >
          <Text style={{ color: '#a844f2', fontWeight: '600' }}>
            {editingId ? 'Cancelar' : 'Deshacer'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={onSubmit}
          disabled={submitting}
          style={{
            flex: 1,
            paddingVertical: 12,
            borderRadius: 8,
            backgroundColor: '#a844f2',
            alignItems: 'center',
          }}
        >
          {submitting ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text style={{ color: 'white', fontWeight: '700' }}>
              {editingId ? 'Actualizar' : 'Agregar'}
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}
