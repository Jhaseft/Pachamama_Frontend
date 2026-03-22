import React, { useEffect, useState, useCallback } from 'react';
import {
  ScrollView, View, Text, TouchableOpacity, FlatList,
  ActivityIndicator, RefreshControl, Alert, // Alert sigue en uso (historias)
} from 'react-native';
import { Link, useRouter } from 'expo-router';
import { useAuth } from '@/src/context/AuthContext';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { ProfileHeader } from '../../../components/user/ProfileHeader';
import { HistoryCard } from '../../../components/user/HistoryCard';
import CreateHistoryModal from '@/src/components/user/CreateHistoryModal';
import { HistoryViewer } from '@/src/components/user/HistoryViewer';
import { apiCreateHistory, apiDeleteHistory, apiGetMyStories } from '@/src/api/anfitrionaHistory';
import { apiGetMyProfile, apiUpdateMyProfile, type MyProfileData } from '@/src/api/anfitrionaProfile';
import { apiGetMyGallery, apiDeleteGalleryImage, apiSetFeaturedGalleryImage } from '@/src/api/anfitrionaGallery';
import type { HistoryItem } from '@/src/types/anfitrionaHistory';
import type { GalleryItem } from '@/src/types/gallery';
import { useGalleryPublish } from '@/src/hooks/useGalleryPublish';
import GalleryGrid from '@/src/components/anfitriona/gallery/GalleryGrid';
import PublishGalleryModal from '@/src/components/anfitriona/gallery/PublishGalleryModal';
import GalleryItemViewer from '@/src/components/anfitriona/gallery/GalleryItemViewer';
import EditGalleryImageModal from '@/src/components/anfitriona/gallery/EditGalleryImageModal';

const FALLBACK_COVER =
  'https://res.cloudinary.com/dcyx3nqj5/image/upload/v1772893219/WhatsApp_Image_2026-03-06_at_7.19.57_va3q9n.jpg';

export default function AnfitrionaDashboard() {
  const { logout } = useAuth();
  const router = useRouter();
  const [stories, setStories] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [profile, setProfile] = useState<MyProfileData | null>(null);

  const [modalVisible, setModalVisible] = useState(false);
  const [selectedMedia, setSelectedMedia] = useState<any>(null);
  const [credits, setCredits] = useState('0');
  const [uploading, setUploading] = useState(false);

  const [selectedHistory, setSelectedHistory] = useState<HistoryItem | null>(null);
  const [viewerVisible, setViewerVisible] = useState(false);

  const [gallery, setGallery] = useState<GalleryItem[]>([]);
  const [selectedGalleryItem, setSelectedGalleryItem] = useState<GalleryItem | null>(null);
  const [editingGalleryItem, setEditingGalleryItem] = useState<GalleryItem | null>(null);
  const [togglingOnline, setTogglingOnline] = useState(false);

  const loadGallery = useCallback(async () => {
    try {
      const data = await apiGetMyGallery();
      setGallery(data);
    } catch (error) {
      console.error('Error cargando galería:', error);
    }
  }, []);

  const galleryPublish = useGalleryPublish({ onSuccess: loadGallery });

  const loadStories = async () => {
    try {
      const data = await apiGetMyStories();
      setStories(data);
    } catch (error) {
      console.error('Error cargando historias:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const loadProfile = async () => {
    try {
      const data = await apiGetMyProfile();
      setProfile(data);
    } catch (error) {
      console.error('Error cargando perfil:', error);
    }
  };

  useEffect(() => {
    loadStories();
    loadProfile();
    loadGallery();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    loadStories();
    loadProfile();
    loadGallery();
  };

  const handleToggleOnline = async () => {
    if (!profile || togglingOnline) return;
    const next = !profile.isOnline;
    setTogglingOnline(true);
    // optimistic update
    setProfile((prev) => prev ? { ...prev, isOnline: next } : prev);
    try {
      await apiUpdateMyProfile({ isOnline: next });
    } catch {
      // revert on error
      setProfile((prev) => prev ? { ...prev, isOnline: !next } : prev);
    } finally {
      setTogglingOnline(false);
    }
  };

  const handleViewHistory = (item: HistoryItem) => {
    setSelectedHistory(item);
    setViewerVisible(true);
  };

  const pickHistoryImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images', 'videos'],
      allowsEditing: false,
      quality: 0.8,
    });
    if (!result.canceled) {
      setSelectedMedia(result.assets[0]);
      setModalVisible(true);
    }
  };

  const handlePublishHistory = async () => {
    if (!selectedMedia) return;
    setUploading(true);
    try {
      const file = {
        uri: selectedMedia.uri,
        type: selectedMedia.type === 'video' ? 'video/mp4' : 'image/jpeg',
        name: selectedMedia.fileName || `upload_${Date.now()}`,
      };
      await apiCreateHistory({ priceCredits: parseInt(credits) }, file);
      Alert.alert('¡Éxito!', 'Tu historia ha sido publicada.');
      setModalVisible(false);
      setSelectedMedia(null);
      setCredits('0');
      loadStories();
    } catch (error) {
      Alert.alert('Error', String(error));
    } finally {
      setUploading(false);
    }
  };

  const handlePickCover = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [16, 9],
      quality: 0.85,
    });
    if (result.canceled) return;
    const asset = result.assets[0];
    try {
      const coverFile = {
        uri: asset.uri,
        type: 'image/jpeg',
        name: asset.fileName || `cover_${Date.now()}.jpg`,
      };
      const updated = await apiUpdateMyProfile({}, undefined, coverFile);
      setProfile(updated);
    } catch (error) {
      Alert.alert('Error', 'No se pudo actualizar el banner.');
    }
  };

  const handleSetFeatured = async (item: GalleryItem) => {
    try {
      const updated = await apiSetFeaturedGalleryImage(item.id);
      setGallery((prev) =>
        prev.map((img) => ({ ...img, sortOrder: img.id === updated.id ? 0 : 1 })),
      );
      setSelectedGalleryItem(null);
      Alert.alert('¡Listo!', 'Esta foto aparecerá primero en el feed.');
    } catch (error) {
      Alert.alert('Error', String(error));
    }
  };

  const handleDeleteGalleryImage = (item: GalleryItem) => {
    Alert.alert(
      'Eliminar foto',
      '¿Estás segura de que quieres borrar esta foto permanentemente?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            try {
              await apiDeleteGalleryImage(item.id);
              setSelectedGalleryItem(null);
              loadGallery();
              Alert.alert('Eliminada', 'La foto ha sido borrada.');
            } catch (error) {
              Alert.alert('Error', String(error));
            }
          },
        },
      ],
    );
  };

  const handleGalleryImageSaved = (updated: GalleryItem) => {
    setGallery((prev) => prev.map((img) => (img.id === updated.id ? updated : img)));
    setSelectedGalleryItem(null);
  };

  const handleDelete = async (id: string) => {
    Alert.alert(
      'Eliminar historia',
      '¿Estás segura de que quieres borrar esta historia permanentemente?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            try {
              await apiDeleteHistory(id);
              setViewerVisible(false);
              loadStories();
              Alert.alert('Eliminado', 'La historia ha sido borrada.');
            } catch (error) {
              Alert.alert('Error', String(error));
            }
          },
        },
      ],
    );
  };

  if (loading) {
    return (
      <View className="flex-1 bg-black justify-center items-center">
        <ActivityIndicator size="large" color="#ef4444" />
      </View>
    );
  }

  return (
    <>
      <ScrollView
        className="flex-1 bg-black"
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#ef4444" />
        }
      >
        <ProfileHeader
          profile={{
            name: profile
              ? [profile.firstName, profile.lastName].filter(Boolean).join(' ') || profile.username
              : '...',
            clients: 0,
            diamonds: profile?.likesCount ?? 0,
            avatar: profile?.avatarUrl ?? 'https://randomuser.me/api/portraits/women/44.jpg',
            cover: profile?.coverUrl ?? FALLBACK_COVER,
          }}
          onCoverPress={handlePickCover}
        />

        <View className="px-6 pt-6 flex-row justify-center gap-3 flex-wrap">
          <Link href="/editar-perfil" asChild>
            <TouchableOpacity className="bg-red-600 flex-row items-center justify-center gap-2 px-4 py-3 rounded-xl mb-3">
              <MaterialCommunityIcons name="account-edit" size={20} color="white" />
              <Text className="text-white font-semibold text-base">Editar perfil</Text>
            </TouchableOpacity>
          </Link>

          {/* Vista previa del perfil */}
          <Link href="/(anfitriona)/vista-previa" asChild>
            <TouchableOpacity className="bg-zinc-800 flex-row items-center justify-center gap-2 px-4 py-3 rounded-xl mb-3">
              <MaterialCommunityIcons name="eye-outline" size={20} color="#a1a1aa" />
              <Text className="text-zinc-400 font-semibold text-base">Ver mi perfil</Text>
            </TouchableOpacity>
          </Link>

          {/* Toggle online/offline */}
          <TouchableOpacity
            onPress={handleToggleOnline}
            disabled={togglingOnline}
            className="flex-row items-center justify-center gap-2 px-4 py-3 rounded-xl mb-3"
            style={{ backgroundColor: profile?.isOnline ? '#166534' : '#3f3f46' }}
          >
            <MaterialCommunityIcons
              name={profile?.isOnline ? 'circle' : 'circle-outline'}
              size={14}
              color={profile?.isOnline ? '#4ade80' : '#a1a1aa'}
            />
            <Text
              className="font-semibold text-base"
              style={{ color: profile?.isOnline ? '#4ade80' : '#a1a1aa' }}
            >
              {profile?.isOnline ? 'En línea' : 'Desconectada'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => {
              Alert.alert('Cerrar sesión', '¿Estás segura de que quieres salir?', [
                { text: 'Cancelar', style: 'cancel' },
                {
                  text: 'Salir',
                  style: 'destructive',
                  onPress: async () => {
                    await logout();
                    router.replace('/(auth)/choose-access');
                  },
                },
              ]);
            }}
            className="bg-zinc-800 flex-row items-center justify-center gap-2 px-4 py-3 rounded-xl mb-3"
          >
            <MaterialCommunityIcons name="logout" size={20} color="#a1a1aa" />
            <Text className="text-zinc-400 font-semibold text-base">Salir</Text>
          </TouchableOpacity>
        </View>

        <View className="px-6 pb-4">
          <Text className="text-zinc-400 text-xs font-bold uppercase tracking-widest mb-3">
            Historias (24h)
          </Text>
          <View className="flex-row w-full items-center">
            <View className="items-center mr-6">
              <TouchableOpacity
                onPress={pickHistoryImage}
                className="w-16 h-16 bg-zinc-800 rounded-full justify-center items-center border-2 border-zinc-600"
              >
                <Text className="text-white text-3xl">+</Text>
              </TouchableOpacity>
              <Text className="text-white mt-2 font-medium text-xs">Nueva historia</Text>
            </View>
            <View className="h-[1px] flex-1 bg-zinc-800" />
          </View>
        </View>

        <FlatList
          data={stories}
          renderItem={({ item }) => (
            <HistoryCard
              item={{ ...item, isLocked: item.priceCredits > 0 }}
              onPress={() => handleViewHistory(item)}
              onDelete={() => handleDelete(item.id)}
            />
          )}
          keyExtractor={(item) => item.id}
          numColumns={2}
          scrollEnabled={false}
          className="px-0.5"
          contentContainerStyle={{ paddingBottom: 8 }}
          ListEmptyComponent={
            <View className="py-6 items-center px-6">
              <Text className="text-zinc-500 text-sm">No tienes historias publicadas</Text>
            </View>
          }
        />

        <View className="px-6 pt-6 pb-3">
          <Text className="text-zinc-400 text-xs font-bold uppercase tracking-widest mb-3">
            Mi Galería
          </Text>
          <View className="flex-row w-full items-center">
            <View className="items-center mr-6">
              <TouchableOpacity
                onPress={galleryPublish.pickImage}
                className="w-16 h-16 bg-red-600 rounded-full justify-center items-center border-2 border-white/20"
              >
                <Text className="text-white text-3xl">+</Text>
              </TouchableOpacity>
              <Text className="text-white mt-2 font-medium text-xs">Nueva foto</Text>
            </View>
            <View className="h-[1px] flex-1 bg-zinc-800" />
          </View>
        </View>

        <GalleryGrid
          items={gallery}
          onPressItem={(item) => setSelectedGalleryItem(item)}
        />
      </ScrollView>


      <CreateHistoryModal
        visible={modalVisible}
        selectedMedia={selectedMedia}
        credits={credits}
        uploading={uploading}
        onChangeCredits={setCredits}
        onClose={() => setModalVisible(false)}
        onPublish={handlePublishHistory}
      />

      <HistoryViewer
        isVisible={viewerVisible}
        item={selectedHistory}
        onClose={() => setViewerVisible(false)}
        onDelete={handleDelete}
      />

      <GalleryItemViewer
        item={selectedGalleryItem}
        visible={selectedGalleryItem !== null}
        onClose={() => setSelectedGalleryItem(null)}
        onEdit={(item) => { setSelectedGalleryItem(null); setEditingGalleryItem(item); }}
        onDelete={handleDeleteGalleryImage}
        onSetFeatured={handleSetFeatured}
      />

      <EditGalleryImageModal
        item={editingGalleryItem}
        visible={editingGalleryItem !== null}
        onClose={() => setEditingGalleryItem(null)}
        onSaved={handleGalleryImageSaved}
      />

      <PublishGalleryModal
        visible={galleryPublish.modalVisible}
        selectedMedia={galleryPublish.selectedMedia}
        form={galleryPublish.form}
        uploading={galleryPublish.uploading}
        onChangeForm={(patch) =>
          galleryPublish.setForm((prev) => ({ ...prev, ...patch }))
        }
        onClose={galleryPublish.handleClose}
        onPublish={galleryPublish.handlePublish}
      />
    </>
  );
}
