// screens/ClientsScreen.tsx
import React, { useEffect, useState } from 'react';
import { apiGetAllClients, apiToggleClientStatus } from '../../../api/userClient';
import { UserClientData } from '../../../types/userClient';
import { View, Text, ScrollView, TextInput, Pressable, ActivityIndicator, FlatList } from 'react-native';
import { Ionicons, AntDesign } from '@expo/vector-icons';
import { UserItem } from '../../../components/UserItem';
import { StatusBar } from 'expo-status-bar';
import { Link } from 'expo-router';
import SearchInput from '../../../components/SearchInput';
import HeaderBack from '../../../components/HeaderBack';

export default function ClientsScreen() {
    const [clients, setClients] = useState<UserClientData[]>([]);
    const [search, setSearch] = useState('');
    const [nextCursor, setNextCursor] = useState<string | null>(null);
    const [isFetchingMore, setIsFetchingMore] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [isInitialLoading, setIsInitialLoading] = useState(true); 

    // Función para cargar datos
    const loadClients = async (text?: string, cursor?: string) => {

        const isFirstLoad = !cursor;

        try {
            if (isFirstLoad) {
                if (!refreshing) setIsInitialLoading(true);
            } else {
                setIsFetchingMore(true);
            }

            const response = await apiGetAllClients(text, cursor);

            console.log(`PAGINACIÓN: Recibidos ${response.data.length} items. ¿Hay más? ${!!response.nextCursor}`);

            const newData = response.data || [];

            setClients(prev => {
                if (isFirstLoad) return newData;

                const existingIds = new Set(prev.map(c => c.id));
                const filteredNew = newData.filter(c => !existingIds.has(c.id));
                return [...prev, ...filteredNew];
            });

            setNextCursor(response.nextCursor ?? null);
        } catch (error: any) {
            console.error("Error en carga:", error);
        } finally {
            setIsInitialLoading(false);
            setIsFetchingMore(false);
            setRefreshing(false);
        }
    };

    //funcion que carga mas clientes cuando llegamos al final
    const handleLoadMore = () => {
        if (!nextCursor) return;
        if (isFetchingMore) return;
        if (isInitialLoading) return;

        loadClients(search, nextCursor);
    };

    // Pull to refresh (Deslizar hacia abajo para actualizar)
    const onRefresh = () => {
        setRefreshing(true);
        loadClients(search);
    };

    // Cargar clientes cuando la pantalla inicia
    useEffect(() => {
        loadClients();
    }, []);

    // Efecto de búsqueda: se dispara cuando el usuario deja de escribir
    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            setClients([]);
            setNextCursor(null);
            loadClients(search);
        }, 500);

        return () => clearTimeout(delayDebounceFn);
    }, [search]);


    // Función para cambiar el estado del cliente (activar/suspender)
    const handleStatusChange = async (user: UserClientData) => {
        const originalStatus = user.isActive;
        setClients(prev => prev.map(c =>
            c.id === user.id ? { ...c, isActive: !originalStatus } : c
        ));

        try {
            await apiToggleClientStatus(user.id, !originalStatus);
        } catch (error) {
            alert("No se pudo actualizar el estado");
            setClients(prev => prev.map(c =>
                c.id === user.id ? { ...c, isActive: originalStatus } : c
            ));
        }
    };

    return (
        <View className="px-4 pt-10 flex-1">
            <StatusBar style="light" />

            <HeaderBack href="/admin" title="Clientes" />

            <SearchInput
                value={search}
                onChangeText={setSearch}
                placeholder="Buscar cliente"
            />

            {isInitialLoading ? (
                <View className="flex-1 justify-center"><ActivityIndicator color="#ec4899" /></View>
            ) : (
                <FlatList
                    data={clients}
                    keyExtractor={(item) => item.id}
                    renderItem={({ item }) => (
                        <UserItem
                            name={`${item.firstName ?? ''} ${item.lastName ?? ''}`.trim()}
                            status={item.isActive ? 'activo' : 'suspendido'}
                            onStatusChange={() => handleStatusChange(item)}
                            onAddCredits={() => { }}
                        />
                    )}
                    onEndReached={handleLoadMore}
                    onEndReachedThreshold={0.4}
                    refreshing={refreshing}
                    onRefresh={onRefresh}
                    initialNumToRender={10}
                    maxToRenderPerBatch={10}
                    windowSize={5}
                    contentContainerStyle={{ paddingBottom: 120 }}
                    ListFooterComponent={
                        isFetchingMore
                            ? <ActivityIndicator className="my-2" />
                            : <View className="h-2" />}

                    ListEmptyComponent={
                        <Text className="text-gray-500 text-center mt-2">No hay resultados</Text>}
                />
            )}
        </View>
    );
}
