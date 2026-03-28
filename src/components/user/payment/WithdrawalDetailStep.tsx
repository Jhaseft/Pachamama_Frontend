import React from 'react';
import { View, Text, Image, ScrollView, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import { WithdrawalRequest } from '../../../types/withdrawalRequest';

interface Props {
    item: WithdrawalRequest;
    onReject: () => void;
    onApprove: () => void;
}

export default function WithdrawalDetailStep({ item, onReject, onApprove }: Props) {
    return (
        <ScrollView showsVerticalScrollIndicator={false}>

            <View className="items-center mb-6">
                <View
                    style={{ shadowColor: '#A11B1B', shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.8, shadowRadius: 16, elevation: 8 }}
                >
                    <Image
                        source={{ uri: item.anfitriona.anfitrionaProfile?.avatarUrl || 'https://via.placeholder.com/150' }}
                        className="w-28 h-28 rounded-full"
                        style={{ borderWidth: 3, borderColor: '#A11B1B' }}
                    />
                </View>
                <Text className="text-white font-black text-xl mt-4 tracking-wide">
                    {item.anfitriona.firstName} {item.anfitriona.lastName}
                </Text>
                <View className="flex-row items-center gap-1 mt-1">
                    <MaterialCommunityIcons name="phone-outline" size={13} color="#71717a" />
                    <TouchableOpacity onPress={() => Clipboard.setStringAsync(item.anfitriona.phoneNumber)}>
                        <Text className="text-zinc-500 text-sm">{item.anfitriona.phoneNumber}</Text>
                    </TouchableOpacity>
                </View>
            </View>

            <View
                className="rounded-3xl p-5 mb-5 items-center"
                style={{
                    backgroundColor: '#1a0505',
                    borderWidth: 1, borderColor: '#A11B1B',
                    shadowColor: '#A11B1B', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 12, elevation: 6,
                }}
            >
                <Text className="text-zinc-500 uppercase tracking-[4px] text-[10px] font-bold mb-3">Créditos Acumulados</Text>
                <View className="flex-row items-center gap-3">
                    <MaterialCommunityIcons name="diamond-stone" size={32} color="#ef4444" style={{ textShadowColor: '#ef4444', textShadowRadius: 2 }} />
                    <Text
                        className="text-white font-black text-5xl"
                        style={{ textShadowColor: '#A11B1B', textShadowOffset: { width: 0, height: 0 }, textShadowRadius: 12 }}
                    >
                        {item.currentBalance ?? 0}
                    </Text>
                </View>
            </View>

            <View
                className="rounded-2xl p-4 mb-3 gap-4"
                style={{ backgroundColor: '#0f0f0f', borderWidth: 1, borderColor: '#27272a', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 5 }}
            >
                <View className="flex-row items-center justify-between">
                    <View className="flex-row items-center gap-3">
                        <View className="w-9 h-9 rounded-xl bg-[#1a0505] items-center justify-center">
                            <MaterialCommunityIcons name="diamond-stone" size={18} color="#ef4444" />
                        </View>
                        <View>
                            <Text className="text-zinc-600 text-[10px] uppercase tracking-widest">Créditos a canjear</Text>
                        </View>
                    </View>
                    <View className="flex-row items-baseline gap-1.5">
                        <Text className="text-red-600 font-black text-2xl" style={{ textShadowColor: '#ef4444', textShadowOffset: { width: 0, height: 0 }, textShadowRadius: 2 }}>{item.credits}</Text>
                        <Text className="text-red-700 text-xs font-bold uppercase tracking-widest">CRED</Text>
                    </View>
                </View>


                <View className="flex-row items-center justify-between">
                    <View className="flex-row items-center gap-3">
                        <View className="w-9 h-9 rounded-xl bg-[#0d1f0d] items-center justify-center">
                            <MaterialCommunityIcons name="cash-multiple" size={18} color="#22c55e" />
                        </View>
                        <View>
                            <Text className="text-zinc-600 text-[10px] uppercase tracking-widest">Valor</Text>
                        </View>
                    </View>
                    <View className="flex-row items-baseline gap-1.5">
                        <Text className="text-green-600 font-black text-2xl" style={{ textShadowColor: '#22c55e', textShadowOffset: { width: 0, height: 0 }, textShadowRadius: 2 }}>{item.soles.toFixed(2)}</Text>
                        <Text className="text-green-700 text-xs font-bold uppercase tracking-widest">Soles</Text>
                    </View>
                </View>
            </View>

            <View className="bg-[#141414] border border-zinc-800 rounded-2xl p-4 mb-6 gap-4">
                <Text className="text-zinc-500 text-[10px] uppercase tracking-widest font-bold">Cuenta de Destino</Text>

                <View className="flex-row items-center justify-between">
                    <View className="flex-row items-center gap-3">
                        <View className="w-9 h-9 rounded-xl bg-zinc-800 items-center justify-center">
                            <MaterialCommunityIcons name="bank-outline" size={18} color="#a1a1aa" />
                        </View>
                        <View>
                            <Text className="text-zinc-500 text-[10px] uppercase tracking-widest">Banco</Text>
                            <Text className="text-white font-bold text-[15px]">{item.bankName}</Text>
                        </View>
                    </View>
                    <TouchableOpacity
                        onPress={() => Clipboard.setStringAsync(item.bankName)}
                        className="bg-zinc-800 p-2 rounded-xl"
                        style={{ shadowColor: '#fff', shadowOpacity: 0.05, shadowRadius: 4 }}
                    >
                        <MaterialCommunityIcons name="content-copy" size={16} color="#a1a1aa" />
                    </TouchableOpacity>
                </View>


                <View className="flex-row items-center justify-between">
                    <View className="flex-row items-center gap-3">
                        <View className="w-9 h-9 rounded-xl bg-zinc-800 items-center justify-center">
                            <MaterialCommunityIcons name="credit-card-outline" size={18} color="#a1a1aa" />
                        </View>
                        <View>
                            <Text className="text-zinc-500 text-[10px] uppercase tracking-widest">Número de cuenta</Text>
                            <Text className="text-white font-bold text-[15px]">{item.accountNumber}</Text>
                        </View>
                    </View>
                    <TouchableOpacity
                        onPress={() => Clipboard.setStringAsync(item.accountNumber)}
                        className="bg-zinc-800 p-2 rounded-xl"
                    >
                        <MaterialCommunityIcons name="content-copy" size={16} color="#a1a1aa" />
                    </TouchableOpacity>
                </View>
            </View>

            <View className="flex-row gap-3 mb-10">
                <TouchableOpacity
                    onPress={onReject}
                    className="flex-1 py-4 rounded-2xl items-center border border-zinc-700 bg-zinc-900 flex-row justify-center gap-2"
                >
                    <MaterialCommunityIcons name="close-circle-outline" size={18} color="#a1a1aa" />
                    <Text className="text-zinc-300 font-black uppercase tracking-widest text-sm">Rechazar</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    onPress={onApprove}
                    className="flex-1 py-4 rounded-2xl items-center flex-row justify-center gap-2"
                    style={{ backgroundColor: '#A11B1B', shadowColor: '#A11B1B', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.5, shadowRadius: 10, elevation: 6 }}
                >
                    <MaterialCommunityIcons name="cash-check" size={18} color="white" />
                    <Text className="text-white font-black uppercase tracking-widest text-sm">Pagar</Text>
                </TouchableOpacity>
            </View>
        </ScrollView>
    );
}
