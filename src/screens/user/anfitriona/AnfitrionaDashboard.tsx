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
import { apiGetMyProfile, type MyProfileData } from '@/src/api/anfitrionaProfile';
import { apiGetMyGallery } from '@/src/api/anfitrionaGallery';
import type { HistoryItem } from '@/src/types/anfitrionaHistory';
import type { GalleryItem } from '@/src/types/gallery';
import { useGalleryPublish } from '@/src/hooks/useGalleryPublish';
import GalleryGrid from '@/src/components/anfitriona/gallery/GalleryGrid';
import PublishGalleryModal from '@/src/components/anfitriona/gallery/PublishGalleryModal';
import GalleryItemViewer from '@/src/components/anfitriona/gallery/GalleryItemViewer';

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
            diamonds: 0,
            avatar: profile?.avatarUrl ?? 'https://randomuser.me/api/portraits/women/44.jpg',
            cover: FALLBACK_COVER,
          }}
        />

        <View className="px-6 pt-6 flex-row justify-center gap-3">
          <Link href="/editar-perfil" asChild>
            <TouchableOpacity className="bg-red-600 flex-row items-center justify-center gap-2 px-4 py-3 rounded-xl mb-6">
              <MaterialCommunityIcons name="account-edit" size={20} color="white" />
              <Text className="text-white font-semibold text-base">Editar perfil</Text>
            </TouchableOpacity>
          </Link>
          <TouchableOpacity
            onPress={() => {
              Alert.alert('Cerrar sesión', '¿Estás segura de que quieres salir?', [
                { text: 'Cancelar', style: 'cancel' },
                {
                  text: 'Salir',
                  style: 'destructive',
                  onPress: async () => {
                    await logout();
                    router.replace('/');
                  },
                },
              ]);
            }}
            className="bg-zinc-800 flex-row items-center justify-center gap-2 px-4 py-3 rounded-xl mb-6"
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
