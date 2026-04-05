import React from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import { Ionicons, FontAwesome5 } from '@expo/vector-icons';
import { UserAnfitrionaData } from '../../types/userClient';

interface AnfitrionaItemProps {
    item: UserAnfitrionaData;
    onStatusChange: () => void;
    onEdit: () => void;
}

export const AnfitrionaItem = ({ item, onStatusChange, onEdit }: AnfitrionaItemProps) => {
    const isActive = item.isActive;
    const name = `${item.firstName ?? ''} ${item.lastName ?? ''}`.trim();
    const avatarUrl = item.anfitrionaProfile?.avatarUrl;

    return (
        <View className="bg-[#460202] border border-red-900/20 rounded-[22px] p-[9px] mb-3 flex-row items-center justify-between shadow-sm">
            <View className="flex-row items-center flex-1">
                {/* AVATAR */}
                <View style={{ width: 54, height: 54, borderRadius: 27, borderWidth: 2, borderColor: '#A11B1B', marginRight: 12, overflow: 'hidden', backgroundColor: '#1a0505' }}>
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

                <View className="flex-1">
                    <Text className="text-white font-bold text-[16px] leading-5" numberOfLines={1}>{name}</Text>
                    <View className="flex-row items-center gap-3">
                        <Text className={`text-[13px] font-bold ${isActive ? 'text-green-500' : 'text-red-600'}`}>
                            {isActive ? 'activa' : 'inactiva'}
                        </Text>
                        <Text className="text-gray-500 text-[13px]">{item.phoneNumber}</Text>
                    </View>
                    {item.anfitrionaProfile?.isOnline !== undefined && (
                        <Text style={{ color: item.anfitrionaProfile.isOnline ? '#22c55e' : '#6b7280', fontSize: 11, marginTop: 2 }}>
                            {item.anfitrionaProfile.isOnline ? '● En línea' : '● Desconectada'}
                        </Text>
                    )}
                </View>
            </View>

            <View className="flex-row items-center gap-3">
                <TouchableOpacity onPress={onEdit} className="p-2">
                    <FontAwesome5 name="edit" size={28} color="#4A90E2" />
                </TouchableOpacity>

                <TouchableOpacity
                    onPress={onStatusChange}
                    className={`rounded-full p-2 ${isActive ? 'bg-red-600' : 'bg-green-600'}`}
                >
                    <Ionicons name={isActive ? "close" : "checkmark"} size={22} color="white" />
                </TouchableOpacity>
            </View>
        </View>
    );
};
