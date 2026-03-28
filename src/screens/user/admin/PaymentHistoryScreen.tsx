import React, { useEffect, useRef, useState } from 'react';
import { View, Text, ActivityIndicator, FlatList } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { apiGetWithdrawalRequestsHistory } from '../../../api/withdrawalRequestHistory';
import { WithdrawalRequest } from '../../../types/withdrawalRequest';
import AnfitrionaRequetsHistoryItem from '../../../components/user/payment/AnfitrionaRequetsHistoryItem';
import SearchInput from '../../../components/SearchInput';
import HeaderBack from '../../../components/HeaderBack';

export default function PaymentHistoryScreen() {
    const [requests, setRequests] = useState<WithdrawalRequest[]>([]);
    const [search, setSearch] = useState('');
    const [nextCursor, setNextCursor] = useState<string | null>(null);
    const [isFetchingMore, setIsFetchingMore] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [isInitialLoading, setIsInitialLoading] = useState(true);
    const isFirstRender = useRef(true);

    const loadRequests = async (text?: string, cursor?: string) => {
        const isFirstLoad = !cursor;

        try {
            if (isFirstLoad) {
                if (!refreshing) setIsInitialLoading(true);
            } else {
                setIsFetchingMore(true);
            }

            const response = await apiGetWithdrawalRequestsHistory(text, cursor);
            const newData = response.data ?? [];

            setRequests(prev => {
                if (isFirstLoad) return newData;
                const existingIds = new Set(prev.map(r => r.id));
                return [...prev, ...newData.filter(r => !existingIds.has(r.id))];
            });

            setNextCursor(response.nextCursor ?? null);
        } catch (error: any) {
            console.error('Error en carga:', error?.message ?? String(error));
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
        loadRequests(search, nextCursor);
    };

    const onRefresh = () => {
        setRefreshing(true);
        loadRequests(search);
    };

    useEffect(() => {
        loadRequests();
    }, []);

    useEffect(() => {
        if (isFirstRender.current) {
            isFirstRender.current = false;
            return;
        }
        const delayDebounceFn = setTimeout(() => {
            setRequests([]);
            setNextCursor(null);
            loadRequests(search);
        }, 500);
        return () => clearTimeout(delayDebounceFn);
    }, [search]);

    return (
        <View className="px-4 pt-10 flex-1">
            <StatusBar style="light" />

            <HeaderBack href="/admin" title="Historial de pagos" />

            <SearchInput
                value={search}
                onChangeText={setSearch}
                placeholder="Buscar"
            />

            {isInitialLoading ? (
                <View className="flex-1 justify-center">
                    <ActivityIndicator color="#A11B1B" />
                </View>
            ) : (
                <FlatList
                    data={requests}
                    keyExtractor={(item) => item.id}
                    renderItem={({ item }) => <AnfitrionaRequetsHistoryItem item={item} />}
                    onEndReached={handleLoadMore}
                    onEndReachedThreshold={0.4}
                    refreshing={refreshing}
                    onRefresh={onRefresh}
                    showsVerticalScrollIndicator={false}
                    initialNumToRender={10}
                    maxToRenderPerBatch={10}
                    windowSize={5}
                    contentContainerStyle={{ paddingBottom: 120 }}
                    ListFooterComponent={
                        isFetchingMore
                            ? <ActivityIndicator className="my-2" color="#A11B1B" />
                            : <View className="h-2" />
                    }
                    ListEmptyComponent={
                        <Text className="text-gray-500 text-center mt-2">No hay resultados</Text>
                    }
                />
            )}
        </View>
    );
}
