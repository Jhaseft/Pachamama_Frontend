// screens/AnfitrionaScreen.tsx
import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView } from 'react-native';
import { apiGetAllAnfitriona, apiToggleAnfitrionaStatus } from '../../../api/anfitriona';
import { UserClientData } from '../../../types/userClient';
import { AnfitrionaItem } from '../../../components/user/AnfitrionaItem';
import SearchInput from '../../../components/SearchInput';
import HeaderBack from '../../../components/HeaderBack';
import { useRouter } from 'expo-router';

export default function AnfitrionaScreen() {
    const [anfitrionas, setAnfitrionas] = useState<UserClientData[]>([]);
    const [search, setSearch] = useState('');
    const router = useRouter();

    const loadData = async (text?: string) => {
        try {
            const response = await apiGetAllAnfitriona(text);
            setAnfitrionas(response.data);
        } catch (error) {
            console.error(error);
        }
    };

    useEffect(() => {
        const delay = setTimeout(() => loadData(search), 500);
        return () => clearTimeout(delay);
    }, [search]);

    const handleStatus = async (id: string, current: boolean) => {
        try {
            await apiToggleAnfitrionaStatus(id, !current);
            loadData(search);
        } catch (error: any) {
            alert(error);
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

            <ScrollView showsVerticalScrollIndicator={false} className="mt-4">
                {anfitrionas.map((item) => (
                    <AnfitrionaItem
                        key={item.id}
                        name={`${item.firstName ?? ''} ${item.lastName ?? ''}`.trim()}
                        phone={item.phoneNumber}
                        status={item.isActive ? 'activa' : 'inactiva'}
                        onStatusChange={() => handleStatus(item.id, item.isActive)}
                        onEdit={() => router.push({ pathname: '/admin/anfitrionas/edit', params: { id: item.id } })}
                    />
                ))}
                <View className="h-20" />
            </ScrollView>
        </View>
    );
}