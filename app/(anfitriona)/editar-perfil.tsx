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
import { LinearGradient } from 'expo-linear-gradient';
import {
  apiGetMyProfile,
  apiUpdateMyProfile,
  type MyProfileData,
} from '@/src/api/anfitrionaProfile';
import { useAuth } from '@/src/context/AuthContext';

export default function EditarPerfil() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Campos del formulario
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [username, setUsername] = useState('');
  const [bio, setBio] = useState('');
  const [avatarUri, setAvatarUri] = useState<string | null>(null);
  const [avatarChanged, setAvatarChanged] = useState(false);
  const [coverUri, setCoverUri] = useState<string | null>(null);
  const [coverChanged, setCoverChanged] = useState(false);

  useEffect(() => {
    void loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const data = await apiGetMyProfile();
      setFirstName(data.firstName ?? '');
      setLastName(data.lastName ?? '');
      setUsername(data.username ?? '');
      setBio(data.bio ?? '');
      setAvatarUri(data.avatarUrl ?? null);
      setCoverUri(data.coverUrl ?? null);
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

  const pickCover = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [16, 9],
      quality: 0.8,
    });
    if (!result.canceled) {
      setCoverUri(result.assets[0].uri);
      setCoverChanged(true);
    }
  };

  const handleSave = async () => {
    if (!username.trim()) {
      Alert.alert(
        'Nombre de usuario requerido',
        'Este campo es obligatorio. Por favor ingresa un nombre de usuario único para tu perfil.',
      );
      return;
    }

    setSaving(true);
    try {
      const avatarFile = avatarChanged && avatarUri
        ? { uri: avatarUri, name: `avatar_${Date.now()}.jpg`, type: 'image/jpeg' }
        : undefined;

      const coverFile = coverChanged && coverUri
        ? { uri: coverUri, name: `cover_${Date.now()}.jpg`, type: 'image/jpeg' }
        : undefined;

      await apiUpdateMyProfile(
        {
          firstName: firstName.trim() || undefined,
          lastName: lastName.trim() || undefined,
          username: username.trim(),
          bio: bio.trim(),
        },
        avatarFile,
        coverFile,
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
      <View style={{ flex: 1, backgroundColor: '#000000', justifyContent: 'center', alignItems: 'center' }}>
        <Stack.Screen options={{ headerShown: false }} />
        <ActivityIndicator size="large" color="#a844f2" />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: '#000000' }}
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
          borderBottomColor: 'rgba(168, 68, 242, 0.2)',
        }}
      >
        <TouchableOpacity onPress={() => router.back()} style={{ marginRight: 12 }}>
          <MaterialCommunityIcons name="arrow-left" size={24} color="#a844f2" />
        </TouchableOpacity>
        <Text style={{ color: 'white', fontSize: 18, fontWeight: '800', flex: 1, letterSpacing: 0.5 }}>
          Editar perfil
        </Text>
        <TouchableOpacity
          onPress={handleSave}
          disabled={saving}
          style={{ opacity: saving ? 0.6 : 1 }}
        >
          <LinearGradient
            colors={['#f03eb3', '#a844f2']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{
              paddingHorizontal: 16,
              paddingVertical: 8,
              borderRadius: 10,
            }}
          >
            {saving ? (
              <ActivityIndicator size="small" color="white" />
            ) : (
              <Text style={{ color: 'white', fontWeight: '800', fontSize: 13 }}>Guardar</Text>
            )}
          </LinearGradient>
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={{ padding: 16, paddingBottom: insets.bottom + 32 }}
        keyboardShouldPersistTaps="handled"
      >
        {/* Banner / Cover */}
        <View style={{ marginBottom: 24 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10 }}>
            <MaterialCommunityIcons name="image-multiple" size={16} color="#a844f2" style={{ marginRight: 6 }} />
            <Text style={{ color: '#a844f2', fontSize: 12, fontWeight: '700', letterSpacing: 0.5, textTransform: 'uppercase' }}>
              Foto de portada
            </Text>
          </View>
          <TouchableOpacity onPress={pickCover} activeOpacity={0.85} style={{ position: 'relative' }}>
            <Image
              source={coverUri ? { uri: coverUri } : require('../../assets/no_image.jpg')}
              style={{ width: '100%', height: 160, borderRadius: 14, borderWidth: 1, borderColor: 'rgba(168, 68, 242, 0.3)' }}
              resizeMode="cover"
            />
            <View style={{
              position: 'absolute', bottom: 10, right: 10,
              backgroundColor: '#a844f2', borderRadius: 20, padding: 8,
              borderWidth: 2, borderColor: '#000000',
            }}>
              <MaterialCommunityIcons name="camera" size={18} color="white" />
            </View>
          </TouchableOpacity>
          <Text style={{ color: 'rgba(255,255,255,0.4)', fontSize: 11, marginTop: 6 }}>
            Toca para cambiar el banner (16:9)
          </Text>
        </View>

        {/* Avatar */}
        <View style={{ alignItems: 'center', marginBottom: 32 }}>
          <TouchableOpacity onPress={pickAvatar} style={{ position: 'relative' }}>
            <View style={{ borderRadius: 60, borderWidth: 3, borderColor: '#f03eb3', padding: 2 }}>
              <Image
                source={avatarUri ? { uri: avatarUri } : require('../../assets/no_image.jpg')}
                style={{
                  width: 100,
                  height: 100,
                  borderRadius: 50,
                }}
                resizeMode="cover"
              />
            </View>
            <View
              style={{
                position: 'absolute',
                bottom: 0,
                right: 0,
                backgroundColor: '#f03eb3',
                borderRadius: 16,
                padding: 6,
                borderWidth: 2,
                borderColor: '#000000',
              }}
            >
              <MaterialCommunityIcons name="camera" size={16} color="white" />
            </View>
          </TouchableOpacity>
          <Text style={{ color: 'rgba(255,255,255,0.6)', fontSize: 13, marginTop: 10, fontWeight: '500' }}>
            Toca para cambiar foto de perfil
          </Text>
        </View>

        {/* Campos */}
        <Field label="Nombre" value={firstName} onChangeText={setFirstName} placeholder="Tu nombre" />
        <Field label="Apellido" value={lastName} onChangeText={setLastName} placeholder="Tu apellido" />
        <Field
          label={`Nombre de usuario${!username.trim() ? '  ⚠️ Obligatorio' : ''}`}
          value={username}
          onChangeText={setUsername}
          placeholder="Ej: maria_g (requerido)"
          autoCapitalize="none"
          highlight={!username.trim()}
        />
        <Field
          label="Descripción (bio)"
          value={bio}
          onChangeText={setBio}
          placeholder="Cuéntale algo a tus clientes..."
          multiline
          numberOfLines={4}
        />

        {/* Email — solo lectura */}
        <View style={{ marginBottom: 18 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
            <MaterialCommunityIcons name="email" size={16} color="#132673" style={{ marginRight: 6 }} />
            <Text style={{ color: '#e4e4e7', fontSize: 12, fontWeight: '700', letterSpacing: 0.5, textTransform: 'uppercase' }}>
              Correo electrónico
            </Text>
          </View>
          <View style={{
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: 'rgba(19, 38, 115, 0.1)',
            borderWidth: 1,
            borderColor: '#132673',
            borderRadius: 10,
            paddingHorizontal: 14,
            paddingVertical: 12,
          }}>
            <MaterialCommunityIcons name="lock-outline" size={16} color="#132673" style={{ marginRight: 8 }} />
            <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: 14, flex: 1 }}>
              {user?.email ?? '—'}
            </Text>
          </View>
          <Text style={{ color: 'rgba(255,255,255,0.4)', fontSize: 11, marginTop: 5 }}>
            No es posible cambiar el correo desde aquí.
          </Text>
        </View>

        {/* Info sobre campos no editables */}
        <View
          style={{
            marginTop: 20,
            padding: 12,
            backgroundColor: 'rgba(168, 68, 242, 0.1)',
            borderRadius: 10,
            borderLeftWidth: 3,
            borderLeftColor: '#a844f2',
          }}
        >
          <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: 11, lineHeight: 16 }}>
            <Text style={{ fontWeight: '700', color: '#a844f2' }}>ℹ️</Text> El número de teléfono, cédula y fecha de nacimiento no son editables. Contacta al administrador para cambios de identidad.
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
  highlight?: boolean;
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
  highlight = false,
}: FieldProps) {
  return (
    <View style={{ marginBottom: 18 }}>
      <Text style={{ color: highlight ? '#f03eb3' : '#a844f2', fontSize: 12, fontWeight: '700', marginBottom: 6, letterSpacing: 0.5, textTransform: 'uppercase' }}>
        {label}
      </Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="rgba(255,255,255,0.3)"
        keyboardType={keyboardType}
        autoCapitalize={autoCapitalize}
        multiline={multiline}
        numberOfLines={numberOfLines}
        style={{
          backgroundColor: 'rgba(168, 68, 242, 0.05)',
          borderWidth: 1,
          borderColor: highlight ? '#f03eb3' : 'rgba(168, 68, 242, 0.3)',
          borderRadius: 10,
          paddingHorizontal: 14,
          paddingVertical: 12,
          color: 'white',
          fontSize: 14,
          textAlignVertical: multiline ? 'top' : 'center',
          minHeight: multiline ? 100 : undefined,
        }}
      />
    </View>
  );
}
