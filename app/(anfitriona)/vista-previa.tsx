import { Stack, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator, ScrollView, Text, TouchableOpacity, View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import ProfileHeader from '@/components/cliente/profile/ProfileHeader';
import GallerySection from '@/components/cliente/profile/GallerySection';
import IntroCard from '@/components/cliente/profile/IntroCard';
import { apiGetMyProfile } from '@/src/api/anfitrionaProfile';
import { apiGetMyGallery } from '@/src/api/anfitrionaGallery';
import type { GalleryItemPublic } from '@/src/types/gallery';

export default function VistaPrevia() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [loading, setLoading] = useState(true);
  const [name, setName] = useState('');
  const [avatar, setAvatar] = useState<string | null>(null);
  const [isOnline, setIsOnline] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [rateCredits, setRateCredits] = useState<number | null>(null);
  const [bio, setBio] = useState('');
  const [coverUrl, setCoverUrl] = useState<string | null>(null);
  const [galleryImages, setGalleryImages] = useState<GalleryItemPublic[]>([]);

  useEffect(() => {
    const load = async () => {
      try {
        const [profile, gallery] = await Promise.all([
          apiGetMyProfile(),
          apiGetMyGallery(),
        ]);

        setName(
          [profile.firstName, profile.lastName].filter(Boolean).join(' ') ||
          profile.username,
        );
        setAvatar(profile.avatarUrl);
        setCoverUrl(profile.coverUrl);
        setIsOnline(profile.isOnline);
        setLikesCount(profile.likesCount);
        setRateCredits(profile.rateCredits);
        setBio(profile.bio);

        // Solo imágenes visibles; traducir al shape que espera GallerySection
        const publicImages: GalleryItemPublic[] = gallery
          .filter((img) => img.isVisible)
          .map((img) => ({
            id: img.id,
            imageUrl: img.imageUrl,
            isPremium: img.isPremium,
            unlockCredits: img.unlockCredits,
            isUnlockedByViewer: false, // en preview siempre bloqueadas
          }));
        setGalleryImages(publicImages);
      } catch {
        // silencioso — se muestra vacío
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, []);

  return (
    <View style={{ flex: 1, backgroundColor: '#000000' }}>
      <Stack.Screen options={{ headerShown: false }} />

      {loading ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator size="large" color="#a844f2" />
        </View>
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: insets.bottom + 24 }}
        >
          {/* Header: Vista previa */}
          <LinearGradient
            colors={['#1a0a2e', '#0f0f1e']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{
              paddingTop: insets.top + 12,
              paddingBottom: 14,
              paddingHorizontal: 16,
              borderBottomWidth: 1,
              borderBottomColor: 'rgba(168, 68, 242, 0.2)',
            }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
              <TouchableOpacity onPress={() => router.back()} style={{ padding: 4 }}>
                <MaterialCommunityIcons name="arrow-left" size={24} color="#a844f2" />
              </TouchableOpacity>
              <View style={{ flex: 1 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <MaterialCommunityIcons name="eye" size={18} color="#f03eb3" />
                  <Text style={{ color: '#a844f2', fontWeight: '800', fontSize: 15, letterSpacing: 0.5 }}>
                    Vista previa
                  </Text>
                </View>
                <Text style={{ color: 'rgba(255,255,255,0.5)', fontSize: 11, marginTop: 2 }}>
                  Así te ve un cliente en tu perfil
                </Text>
              </View>
              <View style={{ backgroundColor: 'rgba(168, 68, 242, 0.2)', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 }}>
                <Text style={{ color: '#a844f2', fontSize: 10, fontWeight: '700' }}>DEMO</Text>
              </View>
            </View>
          </LinearGradient>

          {/* Info box */}
          <View style={{ marginHorizontal: 16, marginTop: 16, marginBottom: 12, padding: 12, backgroundColor: 'rgba(168, 68, 242, 0.1)', borderRadius: 10, borderLeftWidth: 3, borderLeftColor: '#a844f2' }}>
            <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: 11, lineHeight: 16 }}>
              <Text style={{ fontWeight: '700', color: '#a844f2' }}>💡</Text> Esta es una vista previa de cómo los clientes ven tu perfil. Los cambios se reflejan en tiempo real.
            </Text>
          </View>

          <ProfileHeader
            name={name}
            avatar={avatar ?? ''}
            coverImage={coverUrl ?? galleryImages[0]?.imageUrl ?? avatar ?? ''}
            isOnline={isOnline}
            likesCount={likesCount}
            rateCredits={rateCredits}
          />

          <GallerySection
            images={galleryImages}
            readOnly
          />

          <IntroCard message={bio} />

        </ScrollView>
      )}
    </View>
  );
}
