// components/AnfitrionaItem.tsx
import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons, FontAwesome5, MaterialCommunityIcons } from '@expo/vector-icons';

interface AnfitrionaItemProps {
    name: string;
    phone: string;
    status: 'activa' | 'inactiva';
    onStatusChange: () => void;
    onEdit: () => void;
}

export const AnfitrionaItem = ({ name, phone, status, onStatusChange, onEdit }: AnfitrionaItemProps) => {
    const isActive = status === 'activa';

    return (
        <View className="bg-[#460202] border border-red-900/20 rounded-[22px] p-[9px] mb-3 flex-row items-center justify-between shadow-sm">
            <View className="flex-row items-center flex-1">
                <View className="bg-pink-900/20 rounded-full p-2 mr-3 border border-pink-500/30">
                    <MaterialCommunityIcons name="face-woman" size={30} color="#f472b6" />
                </View>

                <View className="flex-1">
                    <Text className="text-white font-bold text-[16px] leading-5" numberOfLines={1}>{name}</Text>
                    <View className="flex-row items-center gap-3">
                        <Text className={`text-[14px] font-bold ${isActive ? 'text-green-500' : 'text-red-600'}`}>{status}</Text>
                        <Text className="text-gray-500 text-[13px]">{phone}</Text>
                    </View>
                </View>
            </View>

            <View className="flex-row items-center gap-3">
                <TouchableOpacity onPress={onEdit} className="p-2">
                    <FontAwesome5 name="edit" size={34} color="#4A90E2" />
                </TouchableOpacity>

                <TouchableOpacity
                    onPress={onStatusChange}
                    className={`rounded-full p-2 ${isActive ? 'bg-red-600' : 'bg-green-600'}`}
                >
                    <Ionicons name={isActive ? "close" : "checkmark"} size={24} color="white" />
                </TouchableOpacity>
            </View>
        </View>
    );
};