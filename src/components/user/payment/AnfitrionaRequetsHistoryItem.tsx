import React from 'react';
import { View, Text } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { WithdrawalRequest, WithdrawalStatus } from '../../../types/withdrawalRequest';

const statusConfig: Record<WithdrawalStatus, { label: string; color: string; icon: string }> = {
    PENDING:  { label: 'Pendiente', color: '#fbbf24', icon: 'clock-outline' },
    APPROVED: { label: 'Aprobado',  color: '#00ff88', icon: 'check-circle-outline' },
    REJECTED: { label: 'Rechazado', color: '#ff3b5c', icon: 'close-circle-outline' },
};

interface Props {
    item: WithdrawalRequest;
}

export default function AnfitrionaRequetsHistoryItem({ item }: Props) {
    const config = statusConfig[item.status];

    return (
        <View
            className="bg-[#0e0202] rounded-[22px] p-4 mb-3 border border-red-600 flex-row items-center justify-between"
            style={{
                shadowColor: '#e11d48',
                shadowOffset: { width: 0, height: 6 },
                shadowOpacity: 0.4,
                shadowRadius: 12,
                elevation: 8,
            }}
        >
            <View className="flex-row items-center flex-1 pr-3">

                <View
                    className="rounded-[28px] p-1 mr-3 items-center justify-center"
                    style={{
                        backgroundColor: '#2d0a0a',
                        borderWidth: 1.5,
                        borderColor: '#ff3b5c',
                        shadowColor: '#ff3b5c',
                        shadowOffset: { width: 0, height: 0 },
                        shadowOpacity: 0.9,
                        shadowRadius: 10,
                        elevation: 6,
                        width: 58,
                        height: 58,
                    }}
                >
                    <MaterialCommunityIcons name="credit-card-outline" size={46} color="#ff3b5c" />
                </View>

                <View className="flex-1">
                    <Text className="text-white font-black text-[16px] leading-5 tracking-tight" numberOfLines={1}>
                        {item.anfitriona.firstName} {item.anfitriona.lastName ?? ''}
                    </Text>

                    <View className="flex-row items-baseline gap-2 mt-1">
                        <Text
                            className="font-bold text-[18px]"
                            style={{ color: '#4ade80', textShadowColor: '#22c55e', textShadowOffset: { width: 0, height: 0 }, textShadowRadius: 8 }}
                        >
                            ${item.soles.toFixed(2)}
                        </Text>
                        <Text
                            className="font-medium text-[13px]"
                            style={{ color: '#f87171', textShadowColor: '#ef4444', textShadowOffset: { width: 0, height: 0 }, textShadowRadius: 6 }}
                        >
                            {item.credits.toFixed(0)} Cred
                        </Text>
                    </View>

                    <Text className="text-zinc-400 text-[12px] mt-1 font-medium">
                        {new Date(item.updatedAt).toLocaleDateString('es-ES', {
                            day: '2-digit', month: '2-digit', year: 'numeric',
                            hour: '2-digit', minute: '2-digit',
                        })}
                    </Text>
                </View>
            </View>

            <View className="items-end gap-3">
                <View
                    className="flex-row items-center gap-1.5 px-3 py-1.5 rounded-full border"
                    style={{ backgroundColor: config.color + '15', borderColor: config.color + '50' }}
                >
                    <MaterialCommunityIcons name={config.icon as any} size={14} color={config.color} />
                    <Text className="text-xs font-bold uppercase tracking-wider" style={{ color: config.color }}>
                        {config.label}
                    </Text>
                </View>
            </View>
        </View>
    );
}
