// screens/AnfitrionaScreen.tsx
import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, FlatList, ActivityIndicator } from 'react-native';
import { apiGetAllAnfitriona, apiToggleAnfitrionaStatus } from '../../../api/anfitriona';
import { UserClientData } from '../../../types/userClient';
import { AnfitrionaItem } from '../../../components/user/AnfitrionaItem';
import SearchInput from '../../../components/SearchInput';
import HeaderBack from '../../../components/HeaderBack';

export default function AnfitrionaScreen() {
    const [anfitrionas, setAnfitrionas] = useState<UserClientData[]>([]);
    const [search, setSearch] = useState('');
    const [nextCursor, setNextCursor] = useState<string | null>(null);
    const [isFetchingMore, setIsFetchingMore] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [isInitialLoading, setIsInitialLoading] = useState(true);

    // Función para cargar datos
    const loadAnfitrionas = async (text?: string, cursor?: string) => {

        const isFirstLoad = !cursor;

        try {
            if (isFirstLoad) {
                if (!refreshing) setIsInitialLoading(true);
            } else {
                setIsFetchingMore(true);
            }

            const response = await apiGetAllAnfitriona(text, cursor);

            console.log(`PAGINACIÓN: Recibidos ${response.data.length} items. ¿Hay más? ${!!response.nextCursor}`);

            const newData = response.data || [];

            setAnfitrionas(prev => {
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

    const handleLoadMore = () => {
        if (!nextCursor) return;
        if (isFetchingMore) return;
        if (isInitialLoading) return;

        loadAnfitrionas(search, nextCursor);
    };

    // Pull to refresh (Deslizar hacia abajo para actualizar)
    const onRefresh = () => {
        setRefreshing(true);
        loadAnfitrionas(search);
    };

    // Cargar clientes cuando la pantalla inicia
    useEffect(() => {
        loadAnfitrionas();
    }, []);

    // Efecto de búsqueda: se dispara cuando el usuario deja de escribir
    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            setAnfitrionas([]);
            setNextCursor(null);
            loadAnfitrionas(search);
        }, 500);

        return () => clearTimeout(delayDebounceFn);
    }, [search]);


    // Función para cambiar el estado del cliente (activar/suspender)
    const handleStatusChange = async (user: UserClientData) => {
        const originalStatus = user.isActive;

        setAnfitrionas(prev => prev.map(c =>
            c.id === user.id ? { ...c, isActive: !originalStatus } : c
        ));

        try {
            await apiToggleAnfitrionaStatus(user.id, !originalStatus);
        } catch (error) {
            alert("No se pudo actualizar el estado");

            setAnfitrionas(prev => prev.map(c =>
                c.id === user.id ? { ...c, isActive: originalStatus } : c
            ));
        }
    };
    return (
        <View className="px-4 pt-10 flex-1 bg-black">
            <HeaderBack href="/admin" title="Anfitrionas" />

            <SearchInput
                value={search}
                onChangeText={setSearch}
                placeholder="Buscar anfitriona"
            />

            {isInitialLoading ? (
                <View className="flex-1 justify-center"><ActivityIndicator color="#ec4899" /></View>
            ) : (
                <FlatList
                    data={anfitrionas}
                    keyExtractor={(item) => item.id}
                    renderItem={({ item }) => (
                        <AnfitrionaItem
                            name={`${item.firstName ?? ''} ${item.lastName ?? ''}`.trim()}
                            phone={item.phoneNumber ?? ''}
                            status={item.isActive ? 'activa' : 'inactiva'}
                            onStatusChange={() => handleStatusChange(item)}
                            onEdit={() => { }}
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