import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, Image, ActivityIndicator } from 'react-native';
import { Ionicons, FontAwesome5, MaterialCommunityIcons } from '@expo/vector-icons';
import { UserAnfitrionaData } from '../../types/userClient';
import { getAnfitrionaStats } from '../../api/stats';

interface AnfitrionaItemProps {
    item: UserAnfitrionaData;
    onStatusChange: () => void;
    onEdit: () => void;
}

export const AnfitrionaItem = ({ item, onStatusChange, onEdit }: AnfitrionaItemProps) => {
    const isActive = item.isActive;
    const isOnline = item.anfitrionaProfile?.isOnline;
    const name = `${item.firstName ?? ''} ${item.lastName ?? ''}`.trim();
    const avatarUrl = item.anfitrionaProfile?.avatarUrl;

    const [balance, setBalance] = useState<{ credits: number; soles: string } | null>(null);

    useEffect(() => {
        getAnfitrionaStats(item.id)
            .then(s => setBalance(s.balance))
            .catch(() => {});
    }, [item.id]);

    return (
        <View className="bg-[#1a0505] border border-red-900/30 rounded-[22px] mb-3 overflow-hidden">
            <View className="flex-row items-center p-3 gap-3">
                <View>
                    <View style={{ width: 52, height: 52, borderRadius: 26, borderWidth: 2, borderColor: '#A11B1B', overflow: 'hidden', backgroundColor: '#2d0a0a' }}>
                        {avatarUrl ? (
                            <Image source={{ uri: avatarUrl }} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
                        ) : (
                            <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                                <Text style={{ color: '#A11B1B', fontSize: 20, fontWeight: 'bold' }}>
                                    {(item.firstName ?? '?')[0].toUpperCase()}
                                </Text>
                            </View>
                        )}
                    </View>
                    <View style={{
                        position: 'absolute', bottom: 0, right: 0,
                        width: 13, height: 13, borderRadius: 7,
                        backgroundColor: isOnline ? '#22c55e' : '#6b7280',
                        borderWidth: 2, borderColor: '#1a0505',
                    }} />
                </View>

                <View className="flex-1">
                    <Text className="text-white font-bold text-[15px] leading-5" numberOfLines={1}>{name}</Text>
                    <Text className="text-zinc-500 text-[12px] mt-0.5" numberOfLines={1}>{item.phoneNumber}</Text>
                    <View className="flex-row items-center gap-2 mt-1">
                        <View className={`rounded-full px-2 py-0.5 ${isActive ? 'bg-green-900/50' : 'bg-red-900/50'}`}>
                            <Text className={`text-[10px] font-bold ${isActive ? 'text-green-400' : 'text-red-400'}`}>
                                {isActive ? 'Activa' : 'Inactiva'}
                            </Text>
                        </View>
                        <Text className={`text-[10px] font-semibold ${isOnline ? 'text-green-400' : 'text-zinc-600'}`}>
                            {isOnline ? '● En línea' : '● Desconectada'}
                        </Text>
                    </View>
                </View>

                <View className="flex-row items-center gap-2">
                    <TouchableOpacity onPress={onEdit} className="p-2">
                        <FontAwesome5 name="edit" size={30} color="#4A90E2" />
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={onStatusChange}
                        className={`rounded-full p-2 ${isActive ? 'bg-red-700' : 'bg-green-700'}`}
                    >
                        <Ionicons name={isActive ? 'close' : 'checkmark'} size={20} color="white" />
                    </TouchableOpacity>
                </View>
            </View>

            <View className="flex-row items-center gap-2 bg-[#0f0f0f] px-4 py-2 border-t border-red-900/20">
                <MaterialCommunityIcons name="wallet-outline" size={13} color="#A11B1B" />
                <Text className="text-zinc-500 text-[11px]">Saldo:</Text>
                {balance === null ? (
                    <ActivityIndicator size={10} color="#A11B1B" />
                ) : (
                    <>
                        <Text className="text-white text-[12px] font-bold">Soles/ {balance.soles}</Text>
                        <Text className="text-zinc-600 text-[11px]">({balance.credits} créditos)</Text>
                    </>
                )}
            </View>
        </View>
    );
};
