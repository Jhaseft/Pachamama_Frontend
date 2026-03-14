import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import {
  apiGetMyProfile,
  apiUpdateMyProfile,
  type MyProfileData,
} from '@/src/api/anfitrionaProfile';

export default function EditarPerfil() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Campos del formulario
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [username, setUsername] = useState('');
  const [bio, setBio] = useState('');
  const [rateCredits, setRateCredits] = useState('');
  const [avatarUri, setAvatarUri] = useState<string | null>(null);
  const [avatarChanged, setAvatarChanged] = useState(false);

  useEffect(() => {
    void loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const data = await apiGetMyProfile();
      setFirstName(data.firstName ?? '');
      setLastName(data.lastName ?? '');
      setUsername(data.username);
      setBio(data.bio);
      setRateCredits(String(data.rateCredits));
      setAvatarUri(data.avatarUrl);
    } catch (e) {
      Alert.alert('Error', 'No se pudo cargar el perfil.');
    } finally {
      setLoading(false);
    }
  };

  const pickAvatar = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (!result.canceled) {
      setAvatarUri(result.assets[0].uri);
      setAvatarChanged(true);
    }
  };

  const handleSave = async () => {
    if (!username.trim()) {
      Alert.alert('Validación', 'El nombre de usuario no puede estar vacío.');
      return;
    }

    setSaving(true);
    try {
      const avatarFile = avatarChanged && avatarUri
        ? {
            uri: avatarUri,
            name: `avatar_${Date.now()}.jpg`,
            type: 'image/jpeg',
          }
        : undefined;

      await apiUpdateMyProfile(
        {
          firstName: firstName.trim() || undefined,
          lastName: lastName.trim() || undefined,
          username: username.trim(),
          bio: bio.trim(),
          rateCredits: parseInt(rateCredits) || 0,
        },
        avatarFile,
      );

      Alert.alert('¡Listo!', 'Perfil actualizado correctamente.', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch (e: any) {
      Alert.alert('Error', typeof e === 'string' ? e : e?.message ?? 'No se pudo guardar.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: '#111', justifyContent: 'center', alignItems: 'center' }}>
        <Stack.Screen options={{ headerShown: false }} />
        <ActivityIndicator size="large" color="#ef4444" />
      </View>
    );
  }

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
          Editar perfil
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
        {/* Avatar */}
        <View style={{ alignItems: 'center', marginBottom: 28 }}>
          <TouchableOpacity onPress={pickAvatar} style={{ position: 'relative' }}>
            {avatarUri ? (
              <Image
                source={{ uri: avatarUri }}
                style={{
                  width: 100,
                  height: 100,
                  borderRadius: 50,
                  borderWidth: 3,
                  borderColor: '#dc2626',
                }}
              />
            ) : (
              <View
                style={{
                  width: 100,
                  height: 100,
                  borderRadius: 50,
                  backgroundColor: '#27272a',
                  justifyContent: 'center',
                  alignItems: 'center',
                  borderWidth: 3,
                  borderColor: '#dc2626',
                }}
              >
                <MaterialCommunityIcons name="account" size={48} color="#71717a" />
              </View>
            )}
            <View
              style={{
                position: 'absolute',
                bottom: 0,
                right: 0,
                backgroundColor: '#dc2626',
                borderRadius: 16,
                padding: 6,
                borderWidth: 2,
                borderColor: '#111',
              }}
            >
              <MaterialCommunityIcons name="camera" size={16} color="white" />
            </View>
          </TouchableOpacity>
          <Text style={{ color: '#71717a', fontSize: 13, marginTop: 8 }}>
            Toca para cambiar foto
          </Text>
        </View>

        {/* Campos */}
        <Field label="Nombre" value={firstName} onChangeText={setFirstName} placeholder="Tu nombre" />
        <Field label="Apellido" value={lastName} onChangeText={setLastName} placeholder="Tu apellido" />
        <Field
          label="Nombre de usuario"
          value={username}
          onChangeText={setUsername}
          placeholder="@usuario"
          autoCapitalize="none"
        />
        <Field
          label="Descripción (bio)"
          value={bio}
          onChangeText={setBio}
          placeholder="Cuéntale algo a tus clientes..."
          multiline
          numberOfLines={4}
        />
        <Field
          label="Créditos por conversación"
          value={rateCredits}
          onChangeText={setRateCredits}
          placeholder="0"
          keyboardType="numeric"
        />

        {/* Info sobre campos no editables */}
        <View
          style={{
            marginTop: 16,
            padding: 14,
            backgroundColor: '#18181b',
            borderRadius: 10,
            borderWidth: 1,
            borderColor: '#3f3f46',
          }}
        >
          <Text style={{ color: '#71717a', fontSize: 12, lineHeight: 18 }}>
            ℹ️ El número de teléfono, cédula y fecha de nacimiento no son editables.
            Para cambiar datos de identidad contacta al administrador.
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

type FieldProps = {
  label: string;
  value: string;
  onChangeText: (v: string) => void;
  placeholder?: string;
  multiline?: boolean;
  numberOfLines?: number;
  keyboardType?: 'default' | 'numeric' | 'email-address';
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
};

function Field({
  label,
  value,
  onChangeText,
  placeholder,
  multiline,
  numberOfLines,
  keyboardType = 'default',
  autoCapitalize = 'words',
}: FieldProps) {
  return (
    <View style={{ marginBottom: 18 }}>
      <Text style={{ color: '#e4e4e7', fontSize: 13, fontWeight: '600', marginBottom: 6 }}>
        {label}
      </Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#52525b"
        keyboardType={keyboardType}
        autoCapitalize={autoCapitalize}
        multiline={multiline}
        numberOfLines={numberOfLines}
        style={{
          backgroundColor: '#18181b',
          borderWidth: 1,
          borderColor: '#3f3f46',
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
