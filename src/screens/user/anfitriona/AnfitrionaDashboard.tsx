import React, { useEffect, useState, useCallback, useRef } from 'react';
import {
  ScrollView, View, Text, Image, TouchableOpacity, FlatList,
  ActivityIndicator, RefreshControl, Alert, Animated, Easing, AppState, Linking,
} from 'react-native';
import notifee from '@notifee/react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Link, useRouter } from 'expo-router';
import { useAuth } from '@/src/context/AuthContext';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import CreateHistoryModal from '@/src/components/user/CreateHistoryModal';
import { HistoryViewer } from '@/src/components/user/HistoryViewer';
import { apiCreateHistory, apiDeleteHistory, apiGetMyStories } from '@/src/api/anfitrionaHistory';
import { apiGetMyProfile, apiUpdateMyProfile, type MyProfileData } from '@/src/api/anfitrionaProfile';
import { apiGetMyEarnings, type EarningsData } from '@/src/api/wallet';
import { getMyServicePrices, type ServicePrice } from '@/src/api/messages';
import { apiGetMyGallery, apiDeleteGalleryImage, apiSetFeaturedGalleryImage } from '@/src/api/anfitrionaGallery';
import type { HistoryItem } from '@/src/types/anfitrionaHistory';
import type { GalleryItem } from '@/src/types/gallery';
import { useGalleryPublish } from '@/src/hooks/useGalleryPublish';
import GalleryGrid from '@/src/components/anfitriona/gallery/GalleryGrid';
import PublishGalleryModal from '@/src/components/anfitriona/gallery/PublishGalleryModal';
import GalleryItemViewer from '@/src/components/anfitriona/gallery/GalleryItemViewer';
import EditGalleryImageModal from '@/src/components/anfitriona/gallery/EditGalleryImageModal';

// ─── Helpers ──────────────────────────────────────────────────────────────────

const CREDITS_TO_SOLES = 0.1;
const toSoles = (credits: number) => (credits * CREDITS_TO_SOLES).toFixed(2);

const GOLD_BORDER = [
  '#F6C16A', '#FFE5A0', '#F6C16A', '#C9933A',
  '#8B5E1A', '#C9933A', '#FFE5A0', '#F6C16A', '#F6C16A',
] as const;

const RED_BORDER = [
  '#D11B1B', '#FF5A5A', '#D11B1B', '#8B0000',
  '#5a0000', '#8B0000', '#FF5A5A', '#D11B1B', '#D11B1B',
] as const;

// ─── AnimatedBorderCard ───────────────────────────────────────────────────────

function AnimatedBorderCard({
  children, borderRadius = 16, borderColors = GOLD_BORDER, style,
}: {
  children: React.ReactNode;
  borderRadius?: number;
  borderColors?: readonly string[];
  style?: object;
}) {
  const spin = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.loop(
      Animated.timing(spin, { toValue: 1, duration: 3000, easing: Easing.linear, useNativeDriver: true })
    ).start();
  }, [spin]);
  const rotate = spin.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });
  return (
    <View style={[{ borderRadius, padding: 2, overflow: 'hidden' }, style]}>
      <Animated.View style={{
        position: 'absolute', width: 600, height: 600,
        top: '50%', left: '50%', marginTop: -300, marginLeft: -300,
        transform: [{ rotate }],
      }}>
        <LinearGradient colors={borderColors as any} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={{ flex: 1 }} />
      </Animated.View>
      {children}
    </View>
  );
}

// ─── Dashboard ────────────────────────────────────────────────────────────────

export default function AnfitrionaDashboard() {
  const { logout } = useAuth();
  const router = useRouter();
  const [stories, setStories] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [profile, setProfile] = useState<MyProfileData | null>(null);
  const [earnings, setEarnings] = useState<EarningsData | null>(null);
  const [servicePrices, setServicePrices] = useState<ServicePrice[]>([]);

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
  const [notificationsEnabled, setNotificationsEnabled] = useState<boolean | null>(null);

  const galleryPublish = useGalleryPublish({ onSuccess: loadGallery });

  function loadGallery() {
    apiGetMyGallery().then(setGallery).catch(() => {});
  }

  const loadAll = useCallback(async () => {
    try {
      const [storiesData, profileData, earningsData, pricesData] = await Promise.allSettled([
        apiGetMyStories(),
        apiGetMyProfile(),
        apiGetMyEarnings(),
        getMyServicePrices(),
      ]);
      if (storiesData.status === 'fulfilled') setStories(storiesData.value);
      if (profileData.status === 'fulfilled') setProfile(profileData.value);
      if (earningsData.status === 'fulfilled') setEarnings(earningsData.value);
      if (pricesData.status === 'fulfilled') setServicePrices(pricesData.value);
      loadGallery();
    } catch {}
    finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { void loadAll(); }, [loadAll]);

  useEffect(() => {
    const checkPermissions = async () => {
      const settings = await notifee.getNotificationSettings();
      setNotificationsEnabled(settings.authorizationStatus >= 1);
    };
    checkPermissions();
    const sub = AppState.addEventListener('change', (state) => {
      if (state === 'active') checkPermissions();
    });
    return () => sub.remove();
  }, []);

  const handleNotificationsPress = () => {
    Alert.alert(
      'Notificaciones',
      notificationsEnabled
        ? '¿Quieres desactivar las notificaciones?'
        : 'Las notificaciones están desactivadas. ¿Quieres activarlas?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Ir a Ajustes', onPress: () => Linking.openSettings() },
      ]
    );
  };

  const onRefresh = () => { setRefreshing(true); void loadAll(); };

  const handleToggleOnline = async () => {
    if (!profile || togglingOnline) return;
    const next = !profile.isOnline;
    setTogglingOnline(true);
    setProfile((prev) => prev ? { ...prev, isOnline: next } : prev);
    try {
      await apiUpdateMyProfile({ isOnline: next });
    } catch {
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
      apiGetMyStories().then(setStories).catch(() => {});
    } catch (error) {
      Alert.alert('Error', String(error));
    } finally {
      setUploading(false);
    }
  };

  const handleSetFeatured = async (item: GalleryItem) => {
    try {
      const updated = await apiSetFeaturedGalleryImage(item.id);
      setGallery((prev) => prev.map((img) => ({ ...img, sortOrder: img.id === updated.id ? 0 : 1 })));
      setSelectedGalleryItem(null);
      Alert.alert('¡Listo!', 'Esta foto aparecerá primero en el feed.');
    } catch (error) {
      Alert.alert('Error', String(error));
    }
  };

  const handleDeleteGalleryImage = (item: GalleryItem) => {
    Alert.alert('Eliminar foto', '¿Estás segura de que quieres borrar esta foto permanentemente?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Eliminar', style: 'destructive', onPress: async () => {
        try {
          await apiDeleteGalleryImage(item.id);
          setSelectedGalleryItem(null);
          loadGallery();
          Alert.alert('Eliminada', 'La foto ha sido borrada.');
        } catch (error) { Alert.alert('Error', String(error)); }
      }},
    ]);
  };

  const handleGalleryImageSaved = (updated: GalleryItem) => {
    setGallery((prev) => prev.map((img) => (img.id === updated.id ? updated : img)));
    setSelectedGalleryItem(null);
  };

  const handleDelete = async (id: string) => {
    Alert.alert('Eliminar historia', '¿Estás segura de que quieres borrar esta historia permanentemente?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Eliminar', style: 'destructive', onPress: async () => {
        try {
          await apiDeleteHistory(id);
          setViewerVisible(false);
          apiGetMyStories().then(setStories).catch(() => {});
          Alert.alert('Eliminado', 'La historia ha sido borrada.');
        } catch (error) { Alert.alert('Error', String(error)); }
      }},
    ]);
  };

  // Helpers para precios
  const getPrice = (type: string) =>
    servicePrices.find((p) => p.serviceType === type)?.price ?? null;

  const profileName = profile
    ? [profile.firstName, profile.lastName].filter(Boolean).join(' ') || profile.username
    : '...';

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: '#25060E', justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#F6C16A" />
      </View>
    );
  }

  return (
    <>
      <ScrollView
        style={{ flex: 1, backgroundColor: '#25060E' }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#F6C16A" />}
      >

        {/* ── Header: avatar + nombre + stats ── */}
        <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingTop: 24, paddingBottom: 20 }}>
          {/* Avatar con borde dorado animado */}
          <View style={{ position: 'relative' }}>
            <AnimatedBorderCard borderRadius={70} borderColors={GOLD_BORDER} style={{ width: 120, height: 120 }}>
              <View style={{ width: '100%', height: '100%', borderRadius: 68, overflow: 'hidden', backgroundColor: '#3d0010' }}>
                <Image
                  source={profile?.avatarUrl ? { uri: profile.avatarUrl } : require('../../../../assets/no_image.jpg')}
                  style={{ width: '100%', height: '100%' }}
                  resizeMode="cover"
                />
              </View>
            </AnimatedBorderCard>
            {/* Indicador online */}
            <View style={{
              position: 'absolute', bottom: 6, right: 6,
              width: 22, height: 22, borderRadius: 11,
              backgroundColor: profile?.isOnline ? '#22c55e' : '#6b7280',
              borderWidth: 2, borderColor: '#25060E',
            }} />
          </View>

          {/* Nombre y stats */}
          <View style={{ flex: 1, marginLeft: 16 }}>
            <Text style={{ color: 'white', fontSize: 22, fontWeight: '800' }}>{profileName}</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 6, gap: 12 }}>
              <Text style={{ color: 'rgba(255,255,255,0.55)', fontSize: 13 }}>0 clientes</Text>
              <Text style={{ color: 'rgba(255,255,255,0.55)', fontSize: 13 }}>
                {profile?.likesCount ?? 0} 💎
              </Text>
            </View>
          </View>
        </View>

        <View style={{ paddingHorizontal: 16, gap: 12 }}>

          {/* ── Card ganancias ── */}
          <AnimatedBorderCard borderColors={RED_BORDER} borderRadius={14}>
            <LinearGradient
              colors={['#1a0208', '#2d0510']}
              style={{ borderRadius: 12, paddingVertical: 14, paddingHorizontal: 18, flexDirection: 'row', alignItems: 'center' }}
            >
              <Text className='text-center' style={{ color: '#F6C16A', fontSize: 15, fontWeight: '700', flex: 1 }}>
                🔥 Ganaste hoy: {'\n'} <Text style={{ color: '#FFEE00' }}>S/{toSoles(earnings?.today ?? 0)}</Text>
              </Text>
              <View style={{ width: 1, height: 20, backgroundColor: 'rgba(255,255,255,0.15)', marginHorizontal: 12 }} />
              <Text style={{ color: 'rgba(255,255,255,0.75)', fontSize: 14, fontWeight: '600' }}>
                Esta semana: <Text style={{ color: '#FFEE00', fontWeight: '800' }}>S/{toSoles(earnings?.thisWeek ?? 0)}</Text>
              </Text>
            </LinearGradient>
          </AnimatedBorderCard>

          {/* ── Card precios + bio ── */}
          <AnimatedBorderCard borderColors={RED_BORDER} borderRadius={14}>
            <View style={{ backgroundColor: '#1a0208', borderRadius: 12, paddingVertical: 14, paddingHorizontal: 16, gap: 6 }}>
              {getPrice('MESSAGE') !== null && (
                <Text style={{ color: 'rgba(255,255,255,0.85)', fontSize: 13 }}>
                  💬 <Text style={{ fontWeight: '700' }}>Chat:</Text> {getPrice('MESSAGE')} crédito
                </Text>
              )}
              {getPrice('CALL') !== null && (
                <Text style={{ color: 'rgba(255,255,255,0.85)', fontSize: 13 }}>
                  📞 <Text style={{ fontWeight: '700' }}>Voz:</Text> {getPrice('CALL')} créditos/min
                </Text>
              )}
              {getPrice('VIDEO_CALL') !== null && (
                <Text style={{ color: 'rgba(255,255,255,0.85)', fontSize: 13 }}>
                  🎥 <Text style={{ fontWeight: '700' }}>Video:</Text> {getPrice('VIDEO_CALL')} créditos/min
                </Text>
              )}
              {servicePrices.length === 0 && (
                <Text style={{ color: 'rgba(255,255,255,0.4)', fontSize: 13 }}>Sin precios configurados</Text>
              )}
              {!!profile?.bio && (
                <Text style={{ color: 'rgba(255,255,255,0.6)', fontSize: 12, marginTop: 4 }} numberOfLines={2}>
                  🔥 {profile.bio}
                </Text>
              )}
            </View>
          </AnimatedBorderCard>

          {/* ── Botones de acción ── */}
          <View style={{ flexDirection: 'row', gap: 10 }}>
            <Link href="/editar-perfil" asChild style={{ flex: 1 }}>
              <TouchableOpacity activeOpacity={0.8} style={{
                backgroundColor: '#D11B1B', borderRadius: 12,
                flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
                paddingVertical: 14, gap: 8,
              }}>
                <MaterialCommunityIcons name="cog" size={18} color="white" />
                <Text style={{ color: 'white', fontWeight: '700', fontSize: 14 }}>Editar perfil</Text>
              </TouchableOpacity>
            </Link>

            <Link href="/(anfitriona)/vista-previa" asChild style={{ flex: 1 }}>
              <TouchableOpacity activeOpacity={0.8} style={{
                backgroundColor: '#2a0010', borderRadius: 12, borderWidth: 1, borderColor: 'rgba(255,255,255,0.12)',
                flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
                paddingVertical: 14, gap: 8,
              }}>
                <MaterialCommunityIcons name="eye-outline" size={18} color="rgba(255,255,255,0.7)" />
                <Text style={{ color: 'rgba(255,255,255,0.7)', fontWeight: '700', fontSize: 14 }}>Ver mi perfil</Text>
              </TouchableOpacity>
            </Link>
          </View>

          <View style={{ flexDirection: 'row', gap: 10 }}>
            {/* Toggle online = "Activar modo venta" */}
            <AnimatedBorderCard borderColors={RED_BORDER} borderRadius={12} style={{ flex: 1 }}>
              <TouchableOpacity
                onPress={handleToggleOnline}
                disabled={togglingOnline}
                activeOpacity={0.8}
                style={{
                  backgroundColor: '#1a0208',
                  borderRadius: 10, paddingVertical: 14,
                  flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6,
                }}
              >
                <Text style={{ fontSize: 16 }}>🔥</Text>
                <Text style={{ color: profile?.isOnline ? '#F6C16A' : 'rgba(255,255,255,0.55)', fontWeight: '700', fontSize: 14 }}>
                  {profile?.isOnline ? 'En línea' : 'Estar en línea'}
                </Text>
                {!profile?.isOnline && <Text style={{ fontSize: 16 }}>🔥</Text>}
              </TouchableOpacity>
            </AnimatedBorderCard>

            <TouchableOpacity
              onPress={() => Alert.alert('Cerrar sesión', '¿Estás segura de que quieres salir?', [
                { text: 'Cancelar', style: 'cancel' },
                { text: 'Salir', style: 'destructive', onPress: async () => {
                  await logout();
                  router.replace('/(auth)/choose-access');
                }},
              ])}
              activeOpacity={0.8}
              style={{
                backgroundColor: 'transparent', borderRadius: 12,
                borderWidth: 1, borderColor: 'rgba(255,255,255,0.12)',
                paddingVertical: 14, paddingHorizontal: 24,
                alignItems: 'center', justifyContent: 'center',
              }}
            >
              <Text style={{ color: 'rgba(255,255,255,0.4)', fontWeight: '600', fontSize: 14 }}>Salir</Text>
            </TouchableOpacity>
          </View>

          {/* Botón notificaciones */}
          <TouchableOpacity
            onPress={handleNotificationsPress}
            activeOpacity={0.8}
            style={{
              backgroundColor: '#1a0208', borderRadius: 12,
              borderWidth: 1, borderColor: 'rgba(255,255,255,0.12)',
              paddingVertical: 14, paddingHorizontal: 16,
              flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
            }}
          >
            <MaterialCommunityIcons
              name={notificationsEnabled ? 'bell' : 'bell-off'}
              size={18}
              color={notificationsEnabled ? '#F6C16A' : 'rgba(255,255,255,0.4)'}
            />
            <Text style={{ color: notificationsEnabled ? '#F6C16A' : 'rgba(255,255,255,0.4)', fontWeight: '600', fontSize: 14 }}>
              Notificaciones {notificationsEnabled ? '✅' : '❌'}
            </Text>
          </TouchableOpacity>

        </View>

        {/* ── Historias ── */}
        <View style={{ paddingHorizontal: 16, paddingTop: 24, paddingBottom: 8 }}>
          <Text style={{ color: 'white', fontSize: 11, fontWeight: '700', letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 12 }}>
            Historias (24h)
          </Text>
          <FlatList
            horizontal
            showsHorizontalScrollIndicator={false}
            data={stories}
            keyExtractor={(item) => item.id}
            contentContainerStyle={{ gap: 16 }}
            ListHeaderComponent={
              <View style={{ alignItems: 'center' }}>
                <AnimatedBorderCard borderRadius={36} borderColors={GOLD_BORDER} style={{ width: 72, height: 72 }}>
                  <TouchableOpacity
                    onPress={pickHistoryImage}
                    style={{ width: '100%', height: '100%', borderRadius: 34, backgroundColor: '#1a0208', alignItems: 'center', justifyContent: 'center' }}
                  >
                    <Text style={{ color: 'white', fontSize: 28, lineHeight: 30 }}>+</Text>
                  </TouchableOpacity>
                </AnimatedBorderCard>
              </View>
            }
            ListEmptyComponent={
              <View style={{ justifyContent: 'center', paddingLeft: 16, height: 88, width: 260, marginTop: -12 }}>
                <Text style={{ color: 'gray', fontSize: 13, marginBottom: 6 }}>
                  Sube una historia y gana más 💰
                </Text>
                <View style={{ height: 1, backgroundColor: 'gray' }} />
              </View>
            }
            renderItem={({ item }) => {
              const isVideo = item.mediaType?.toUpperCase() === 'VIDEO';
              const thumbUri = isVideo
                ? item.mediaUrl.replace('/video/upload/', '/video/upload/so_1/').replace('.mp4', '.jpg')
                : item.mediaUrl;
              return (
                <View style={{ alignItems: 'center' }}>
                  <TouchableOpacity onPress={() => handleViewHistory(item)} activeOpacity={0.8}>
                    <View style={{ padding: 3, borderRadius: 36, borderWidth: 2, borderColor: '#D11B1B' }}>
                      <View style={{ width: 64, height: 64, borderRadius: 32, overflow: 'hidden', backgroundColor: '#1a0208' }}>
                        <Image source={{ uri: thumbUri }} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
                        {item.priceCredits > 0 && (
                          <View style={{ position: 'absolute', inset: 0, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.3)' }}>
                            <Text>🔒</Text>
                          </View>
                        )}
                      </View>
                    </View>
                    <Text style={{ color: 'rgba(255,255,255,0.4)', fontSize: 10, marginTop: 6, textAlign: 'center', width: 64 }} numberOfLines={1}>
                      {item.priceCredits > 0 ? `${item.priceCredits} cr` : 'Gratis'}
                    </Text>
                  </TouchableOpacity>
                </View>
              );
            }}
          />
        </View>

        {/* ── Galería ── */}
        <View style={{ paddingHorizontal: 16, paddingTop: 16, paddingBottom: 8 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Text style={{ color: 'white', fontSize: 11, fontWeight: '700', letterSpacing: 1.5, textTransform: 'uppercase' }}>
              Mi Galería
            </Text>
            <View style={{ flex: 1, height: 1, backgroundColor: 'white', marginLeft: 12 }} />
          </View>
        </View>

        <GalleryGrid
          items={gallery}
          onPressItem={(item) => setSelectedGalleryItem(item)}
        />

      </ScrollView>

      {/* ── Botón fijo agregar foto ── */}
      <TouchableOpacity
        onPress={galleryPublish.pickImage}
        style={{
          position: 'absolute', bottom: 15, right: 15,
          width: 56, height: 56, borderRadius: 28,
          backgroundColor: '#dc2626',
          alignItems: 'center', justifyContent: 'center',
          borderWidth: 2, borderColor: 'rgba(255,255,255,0.2)',
          shadowColor: '#dc2626', shadowOpacity: 0.6,
          shadowRadius: 10, shadowOffset: { width: 0, height: 0 },
          elevation: 8,
        }}
      >
        <Text style={{ color: 'white', fontSize: 32, lineHeight: 28 }}>+</Text>
        <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: 9 }}>imágenes</Text>
      </TouchableOpacity>

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
        onChangeForm={(patch) => galleryPublish.setForm((prev) => ({ ...prev, ...patch }))}
        onClose={galleryPublish.handleClose}
        onPublish={galleryPublish.handlePublish}
      />
    </>
  );
}
