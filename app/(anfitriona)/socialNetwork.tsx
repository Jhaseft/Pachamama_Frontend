import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import {
    apiGetAllSocialNetworks,
    apiGetAnfitrioneProfileSocialLinks,
    apiAddSocialLink,
    apiUpdateSocialLink,
    apiDeleteSocialLink,
} from '@/src/api/socialNetwork';
import type { SocialNetwork, SocialLink } from '@/src/types/socialNetwork';
import SocialNetworkForm from '@/src/components/anfitriona/socialNetwork/SocialNetworkForm';
import SocialNetworkList from '@/src/components/anfitriona/socialNetwork/SocialNetworkList';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from 'expo-router';

export default function SocialNetworkPage() {
    const router = useRouter();
    const { userId } = useLocalSearchParams<{ userId: string }>();
    const insets = useSafeAreaInsets();

    const [links, setLinks] = useState<SocialLink[]>([]);
    const [networks, setNetworks] = useState<SocialNetwork[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedNetworkId, setSelectedNetworkId] = useState<string | null>(null);
    const [url, setUrl] = useState('');
    const [editingId, setEditingId] = useState<string | null>(null);
    const [submitting, setSubmitting] = useState(false);

    useFocusEffect(
        React.useCallback(() => {
            if (userId) {
                loadData();
            }
        }, [userId])
    );


    const loadData = async () => {
        if (!userId) return;
        try {
            const [networksData, linksData] = await Promise.all([
                apiGetAllSocialNetworks(),
                apiGetAnfitrioneProfileSocialLinks(userId),
            ]);
            setNetworks(networksData);
            setLinks(linksData);
        } catch (error) {
            Alert.alert('Error', 'No se pudieron cargar las redes sociales');
        } finally {
            setLoading(false);
        }
    };

    const handleAddOrUpdate = async () => {
        if (!selectedNetworkId || !url.trim()) {
            Alert.alert('Error', 'Por favor completa todos los campos');
            return;
        }

        setSubmitting(true);
        try {
            if (editingId) {
                await apiUpdateSocialLink(userId!, editingId, { url });
                setLinks((prev) =>
                    prev.map((link) =>
                        link.id === editingId ? { ...link, url } : link
                    )
                );
                Alert.alert('¡Éxito!', 'Red social actualizada');
            } else {
                const newLink = await apiAddSocialLink(userId!, {
                    socialNetworkId: selectedNetworkId,
                    url,
                });
                setLinks((prev) => [...prev, newLink]);
                Alert.alert('¡Éxito!', 'Red social agregada');
            }
            resetForm();
            await loadData();
        } catch (error) {
            Alert.alert('Error', String(error));
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = (id: string) => {
        Alert.alert('Eliminar', '¿Estás segura de que quieres eliminar esta red social?', [
            { text: 'Cancelar', style: 'cancel' },
            {
                text: 'Eliminar',
                style: 'destructive',
                onPress: async () => {
                    try {
                        await apiDeleteSocialLink(userId!, id);
                        setLinks((prev) => prev.filter((link) => link.id !== id));
                        Alert.alert('Eliminada', 'Red social eliminada');
                        await loadData();
                    } catch (error) {
                        Alert.alert('Error', String(error));
                    }
                },
            },
        ]);
    };

    const handleEdit = (link: SocialLink) => {
        setEditingId(link.id);
        setSelectedNetworkId(link.socialNetworkId);
        setUrl(link.url);
    };

    const resetForm = () => {
        setSelectedNetworkId(null);
        setUrl('');
        setEditingId(null);
    };

    if (loading) {
        return (
            <View style={{ flex: 1, backgroundColor: '#000000', justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator size="large" color="#a844f2" />
            </View>
        );
    }

    return (
        <View style={{ flex: 1, backgroundColor: '#000000' }}>
            <View
                className="flex-row items-center gap-3 px-4 pb-4 border-b border-white/5"
                style={{ paddingTop: insets.top + 12 }}
            >
                <TouchableOpacity
                    onPress={() => router.back()}
                    className="w-10 h-10 rounded-xl bg-[#1a2d5a] items-center justify-center"
                >
                    <MaterialCommunityIcons name="arrow-left" size={20} color="white" />
                </TouchableOpacity>
                <View className="flex-1">
                    <Text className="text-white font-extrabold text-[18px]">Redes Sociales</Text>
                    <Text className="text-zinc-500 text-[12px] mt-0.5">Gestiona tus redes sociales</Text>
                </View>
                <MaterialCommunityIcons name="star" size={22} color="#f03eb3" />
            </View>

            <ScrollView style={{ flex: 1, paddingHorizontal: 16, paddingTop: 16 }}>
                <SocialNetworkForm
                    networks={networks}
                    selectedNetworkId={selectedNetworkId}
                    url={url}
                    editingId={editingId}
                    submitting={submitting}
                    onNetworkSelect={setSelectedNetworkId}
                    onUrlChange={setUrl}
                    onSubmit={handleAddOrUpdate}
                    onCancel={resetForm}
                />

                <SocialNetworkList
                    links={links}
                    loading={loading}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                />
            </ScrollView>
        </View>
    );
}
