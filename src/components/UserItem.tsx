import React from 'react';
import { View, Text, Image, TouchableOpacity } from 'react-native';
import { Ionicons, FontAwesome5 } from '@expo/vector-icons';
import ActionIconButton from './ActionIconButton';

interface UserItemProps {
    name: string;
    status: 'activo' | 'suspendido';
    balance?: Number | string;
    onStatusChange: () => void;
    onAddCredits: () => void;
}

export const UserItem = ({ name, status, balance, onStatusChange, onAddCredits }: UserItemProps) => {
    const isActive = status === 'activo';

    return (
        <View className="bg-[#1a0505] border border-red-900/30 rounded-[22px] mb-3 overflow-hidden">
            <View className="flex-row items-center p-3 gap-3">
                <View className="bg-[#2d0a0a] rounded-full p-2">
                    <FontAwesome5 name="user-alt" size={26} color="#A11B1B" />
                </View>

                <View className="flex-1">
                    <Text className="text-white font-bold text-[15px] leading-5" numberOfLines={1}>
                        {name}
                    </Text>
                    <View className={`self-start rounded-full px-2 py-0.5 mt-1 ${isActive ? 'bg-green-900/50' : 'bg-red-900/50'}`}>
                        <Text className={`text-[10px] font-bold uppercase ${isActive ? 'text-green-400' : 'text-red-400'}`}>
                            {status}
                        </Text>
                    </View>
                </View>

                <View className="flex-row items-center gap-2">
                    <ActionIconButton onPress={onAddCredits} icon="credit-card" smallIcon="add-circle" />
                    <TouchableOpacity
                        onPress={onStatusChange}
                        className={`rounded-full p-2 ${isActive ? 'bg-red-700' : 'bg-green-700'}`}
                    >
                        <Ionicons name={isActive ? 'close' : 'checkmark'} size={22} color="white" />
                    </TouchableOpacity>
                </View>
            </View>

            {/* Balance strip */}
            <View className="flex-row items-center gap-2 bg-[#0f0f0f] px-4 py-2 border-t border-red-900/20">
                <Ionicons name="wallet-outline" size={13} color="#A11B1B" />
                <Text className="text-zinc-500 text-[11px]">Créditos:</Text>
                <Text className="text-white text-[12px] font-bold">{Number(balance ?? 0).toFixed(2)}</Text>
            </View>
        </View>
    );
};