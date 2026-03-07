import React from 'react';
import { View, Text, Image, TouchableOpacity } from 'react-native';
import { Ionicons, FontAwesome5 } from '@expo/vector-icons';
import ActionIconButton from './ActionIconButton';

interface UserItemProps {
    name: string;
    status: 'activo' | 'suspendido';
    onStatusChange: () => void;
    onAddCredits: () => void;
}

export const UserItem = ({ name, status, onStatusChange, onAddCredits }: UserItemProps) => {
    const isActive = status === 'activo';

    return (
        <View className="bg-[#460202] border border-red-900/20 rounded-[22px] p-[9px] mb-3 flex-row items-center justify-between shadow-sm">
            <View className="flex-row items-center flex-1">

                <View className="bg-gray-800 rounded-full p-2 mr-3">
                    <FontAwesome5 name="user-alt" size={30} color="#ccc" />
                </View>

                <View className="flex-1">
                    <Text className="text-white font-bold text-[16px] leading-5" numberOfLines={1}>
                        {name}
                    </Text>
                    <Text className={`text-xs font-bold uppercase ${isActive ? 'text-green-500' : 'text-red-600'}`}>
                        {status}
                    </Text>
                </View>
            </View>

            <View className="flex-row  items-center gap-3">
                <ActionIconButton
                    onPress={onAddCredits}
                    icon="credit-card"
                    smallIcon="add-circle"
                />


                <TouchableOpacity
                    onPress={onStatusChange}
                    className={`rounded-full p-2 ${isActive ? 'bg-red-600' : 'bg-green-600'}`}
                >
                    <Ionicons
                        name={isActive ? "close" : "checkmark"}
                        size={24}
                        color="white"
                    />
                </TouchableOpacity>
            </View>
        </View>
    );
};