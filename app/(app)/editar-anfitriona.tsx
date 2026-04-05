import { apiAdminUpdateAnfitrionaProfile } from '@/src/api/anfitriona';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function EditarAnfitriona() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { id, firstName: initFirst, lastName: initLast, username: initUser, bio: initBio } =
    useLocalSearchParams<{
      id: string;
      firstName?: string;
      lastName?: string;
      username?: string;
      bio?: string;
    }>();

  const [firstName, setFirstName] = useState(initFirst ?? '');
  const [lastName, setLastName] = useState(initLast ?? '');
  const [username, setUsername] = useState(initUser ?? '');
  const [bio, setBio] = useState(initBio ?? '');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!username.trim()) {
      Alert.alert('Error', 'El nombre de usuario es obligatorio.');
      return;
    }
    setSaving(true);
    try {
      await apiAdminUpdateAnfitrionaProfile(id, {
        firstName: firstName.trim() || undefined,
        lastName: lastName.trim() || undefined,
        username: username.trim(),
        bio: bio.trim(),
      });
      Alert.alert('Listo', 'Perfil actualizado correctamente.', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch (e: any) {
      Alert.alert('Error', e?.response?.data?.message ?? 'No se pudo guardar.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: '#111' }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <Stack.Screen options={{ headerShown: false }} />

      {/* Header */}
      <View
        style={{
          paddingTop: insets.top + 8,
          paddingHorizontal: 16,
          paddingBottom: 12,
          flexDirection: 'row',
          alignItems: 'center',
          borderBottomWidth: 1,
          borderBottomColor: '#27272a',
        }}
      >
        <TouchableOpacity onPress={() => router.back()} style={{ marginRight: 12 }}>
          <MaterialCommunityIcons name="arrow-left" size={24} color="white" />
        </TouchableOpacity>
        <Text style={{ color: 'white', fontSize: 18, fontWeight: '700', flex: 1 }}>
          Editar anfitriona
        </Text>
        <TouchableOpacity
          onPress={handleSave}
          disabled={saving}
          style={{
            backgroundColor: '#dc2626',
            paddingHorizontal: 16,
            paddingVertical: 8,
            borderRadius: 8,
            opacity: saving ? 0.6 : 1,
          }}
        >
          {saving ? (
            <ActivityIndicator size="small" color="white" />
          ) : (
            <Text style={{ color: 'white', fontWeight: '700' }}>Guardar</Text>
          )}
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={{ padding: 20, paddingBottom: insets.bottom + 32 }}
        keyboardShouldPersistTaps="handled"
      >
        <Field label="Nombre" value={firstName} onChangeText={setFirstName} placeholder="Nombre" />
        <Field label="Apellido" value={lastName} onChangeText={setLastName} placeholder="Apellido" />
        <Field
          label={`Nombre de usuario${!username.trim() ? '  ⚠️ Obligatorio' : ''}`}
          value={username}
          onChangeText={setUsername}
          placeholder="Ej: maria_g"
          autoCapitalize="none"
          highlight={!username.trim()}
        />
        <Field
          label="Descripción (bio)"
          value={bio}
          onChangeText={setBio}
          placeholder="Bio de la anfitriona..."
          multiline
          numberOfLines={4}
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function Field({
  label,
  value,
  onChangeText,
  placeholder,
  multiline,
  numberOfLines,
  autoCapitalize = 'words',
  highlight = false,
}: {
  label: string;
  value: string;
  onChangeText: (v: string) => void;
  placeholder?: string;
  multiline?: boolean;
  numberOfLines?: number;
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  highlight?: boolean;
}) {
  return (
    <View style={{ marginBottom: 18 }}>
      <Text style={{ color: highlight ? '#fca5a5' : '#e4e4e7', fontSize: 13, fontWeight: '600', marginBottom: 6 }}>
        {label}
      </Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#52525b"
        autoCapitalize={autoCapitalize}
        multiline={multiline}
        numberOfLines={numberOfLines}
        style={{
          backgroundColor: '#18181b',
          borderWidth: 1,
          borderColor: highlight ? '#dc2626' : '#3f3f46',
          borderRadius: 10,
          paddingHorizontal: 14,
          paddingVertical: 12,
          color: 'white',
          fontSize: 15,
          textAlignVertical: multiline ? 'top' : 'center',
          minHeight: multiline ? 100 : undefined,
        }}
      />
    </View>
  );
}
