// screens/ClientsScreen.tsx
import React, { useEffect, useState } from 'react';
import { apiGetAllClients, apiToggleClientStatus } from '../../../api/userClient';
import { UserClientData } from '../../../types/userClient';
import { View, Text, ScrollView, TextInput, Pressable } from 'react-native';
import { Ionicons, AntDesign } from '@expo/vector-icons';
import { UserItem } from '../../../components/UserItem';
import { StatusBar } from 'expo-status-bar';
import { Link } from 'expo-router';
import SearchInput from '../../../components/SearchInput';
import HeaderBack from '../../../components/HeaderBack';

export default function ClientsScreen() {
    const [clients, setClients] = useState<UserClientData[]>([]);
    const [search, setSearch] = useState('');

    // Función para cargar datos
    const loadClients = async (text?: string) => {
        try {
            const response = await apiGetAllClients(text);
            setClients(response.data); // 'data' contiene el arreglo de clientes
        } catch (error: any) {
            console.error(error);
            const message = error instanceof Error ? error.message : "Error al cargar clientes";
            alert(message);
        }
    };

    // Cargar clientes cuando la pantalla inicia
    useEffect(() => {
        loadClients();
    }, []);

    // Efecto de búsqueda: se dispara cuando el usuario deja de escribir
    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            loadClients(search);
        }, 500);

        return () => clearTimeout(delayDebounceFn);
    }, [search]);


    // Función para cambiar el estado del cliente (activar/suspender)
    const handleStatusChange = async (user: UserClientData) => {
        try {
            // Invertimos el estado actual
            await apiToggleClientStatus(user.id, !user.isActive);
            loadClients(search); // Recargamos para ver el cambio (X a Check)
        } catch (error) {
            const message = error instanceof Error ? error.message : "Error al actualizar estado";
            alert("Error: " + message);
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

            {clients.length === 0 && (
                <View className="flex-1 items-center justify-center">
                    <Text className="text-gray-500">No se encontraron clientes</Text>
                </View>
            )}

            <ScrollView showsVerticalScrollIndicator={false} className="flex-1">
                {clients.map((client) => (
                    <UserItem
                        key={client.id}
                        name={`${client.firstName ?? ''} ${client.lastName ?? ''}`.trim()}
                        status={client.isActive ? 'activo' : 'suspendido'}
                        onStatusChange={() => handleStatusChange(client)}
                        onAddCredits={() => console.log('Añadir créditos', client.id)}
                    />
                ))}
                {/* Espaciador final para que el scroll no choque con el BottomNav */}
                <View className="h-20" />
            </ScrollView>
        </View>
    );
}
