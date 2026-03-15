import {
    ScrollView, View, Text, TouchableOpacity, FlatList, ActivityIndicator, RefreshControl, Alert,
    Modal, TextInput, Image
} from 'react-native';
import { ProfileHeader } from '../../../components/user/ProfileHeader';
import { HistoryCard } from '../../../components/user/HistoryCard';
import { Link } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import CreateHistoryModal from '@/src/components/user/CreateHistoryModal';

import { apiCreateHistory, apiDeleteHistory, apiGetMyStories } from '@/src/api/anfitrionaHistory';
import { HistoryItem } from '@/src/types/anfitrionaHistory';

import { HistoryViewer } from '@/src/components/user/HistoryViewer';

import * as ImagePicker from 'expo-image-picker';

const PROFILE_DATA = {
    name: "Maria Gonzalez",
    clients: 323,
    diamonds: 1233,
    avatar: "https://randomuser.me/api/portraits/women/44.jpg",
    cover: "https://res.cloudinary.com/dcyx3nqj5/image/upload/v1772893219/WhatsApp_Image_2026-03-06_at_7.19.57_va3q9n.jpg",
};

export default function AnfitrionaDashboard() {
    const [stories, setStories] = useState<HistoryItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const [modalVisible, setModalVisible] = useState(false);
    const [selectedMedia, setSelectedMedia] = useState<any>(null);
    const [credits, setCredits] = useState('0');
    const [uploading, setUploading] = useState(false);

    const [selectedHistory, setSelectedHistory] = useState<HistoryItem | null>(null);
    const [viewerVisible, setViewerVisible] = useState(false);

    // Función para abrir el visor
    const handleViewHistory = (item: HistoryItem) => {
        setSelectedHistory(item);
        setViewerVisible(true);
    };

    // Función para abrir la galería
    const pickImage = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images', 'videos'],
            allowsEditing: false,
            //aspect: [4, 5],
            quality: 0.8,
        });

        if (!result.canceled) {
            setSelectedMedia(result.assets[0]);
            setModalVisible(true);
        }
    };

    // Función para subir al Backend
    const handlePublish = async () => {
        if (!selectedMedia) return;

        setUploading(true);
        try {
            const file = {
                uri: selectedMedia.uri,
                type: selectedMedia.type === 'video' ? 'video/mp4' : 'image/jpeg',
                name: selectedMedia.fileName || `upload_${Date.now()}`,
            };

            await apiCreateHistory({ priceCredits: parseInt(credits) }, file);

            Alert.alert("¡Éxito!", "Tu historia ha sido publicada.");
            setModalVisible(false);
            setSelectedMedia(null);
            setCredits('0');
            loadStories();
        } catch (error) {
            Alert.alert("Error", String(error));
        } finally {
            setUploading(false);
        }
    };

    // Función para cargar historias desde el backend
    const loadStories = async () => {
        try {
            const data = await apiGetMyStories();
            setStories(data);
        } catch (error) {
            console.error("Error cargando historias:", error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    // Cargar al montar el componente
    useEffect(() => {
        loadStories();
    }, []);

    // Función para el gesto de "palar" hacia abajo
    const onRefresh = () => {
        setRefreshing(true);
        loadStories();
    };

    //funcion para eliminar una historia
    const handleDelete = async (id: string) => {
        Alert.alert(
            "Eliminar historia",
            "¿Estás segura de que quieres borrar esta historia permanentemente?",
            [
                { text: "Cancelar", style: "cancel" },
                {
                    text: "Eliminar",
                    style: "destructive",
                    onPress: async () => {
                        try {
                            await apiDeleteHistory(id);
                            setViewerVisible(false); // Cierra el visor
                            loadStories(); // Recarga la lista
                            Alert.alert("Eliminado", "La historia ha sido borrada.");
                        } catch (error) {
                            Alert.alert("Error", String(error));
                        }
                    }
                }
            ]
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
                <ProfileHeader profile={PROFILE_DATA} />

                {/* Acciones */}
                <View className="px-6 py-6 items-center">

                    <Link href="/editar-perfil" asChild>
                        <TouchableOpacity className="bg-red-600 flex-row items-center justify-center gap-2 w-[140px] py-3 rounded-xl mb-6">

                            <MaterialCommunityIcons
                                name="account-edit"
                                size={20}
                                color="white"
                            />

                            <Text className="text-white font-semibold text-base">
                                Editar perfil
                            </Text>

                        </TouchableOpacity>
                    </Link>

                    <View className="flex-row w-full items-center">
                        <View className="items-center mr-6">
                            <TouchableOpacity
                                onPress={pickImage} 
                                className="w-16 h-16 bg-red-600 rounded-full justify-center items-center border-2 border-white/20"
                            >
                                <Text className="text-white text-3xl">+</Text>
                            </TouchableOpacity>
                            <Text className="text-white mt-2 font-medium">Nueva</Text>
                        </View>
                        <View className="h-[1px] flex-1 bg-zinc-800" />
                    </View>
                </View>

                {/* Grid de Historias */}
                <FlatList
                    data={stories}
                    renderItem={({ item }) => (
                        <HistoryCard
                            item={{
                                ...item,
                                isLocked: item.priceCredits > 0 // Lógica para mostrar candado si tiene precio
                            }}
                            onPress={() => handleViewHistory(item)}
                            onDelete={() => handleDelete(item.id)}
                        />
                    )}
                    keyExtractor={item => item.id}
                    numColumns={2}
                    scrollEnabled={false}
                    className="px-0.5"
                    contentContainerStyle={{ paddingBottom: 20 }}
                    ListEmptyComponent={
                        <View className="py-10 items-center">
                            <Text className="text-zinc-500">No tienes historias publicadas</Text>
                        </View>
                    }
                />
            </ScrollView>

            <CreateHistoryModal
                visible={modalVisible}
                selectedMedia={selectedMedia}
                credits={credits}
                uploading={uploading}
                onChangeCredits={setCredits}
                onClose={() => setModalVisible(false)}
                onPublish={handlePublish}
            />

            <HistoryViewer
                isVisible={viewerVisible}
                item={selectedHistory}
                onClose={() => setViewerVisible(false)}
                onDelete={handleDelete}
            />
        </>
    );
}