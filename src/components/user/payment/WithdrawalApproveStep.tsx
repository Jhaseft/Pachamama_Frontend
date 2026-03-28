import React from 'react';
import { View, Text, Image, TouchableOpacity, ActivityIndicator } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

interface Props {
    receipt: { uri: string } | null;
    loading: boolean;
    onPickReceipt: () => void;
    onConfirm: () => void;
}

export default function WithdrawalApproveStep({ receipt, loading, onPickReceipt, onConfirm }: Props) {
    return (
        <View className="flex-1 gap-4 mt-2">
            <Text className="text-zinc-400 text-sm ml-1">
                Sube el comprobante de pago para aprobar la solicitud.
            </Text>

            <TouchableOpacity
                onPress={onPickReceipt}
                className="bg-[#1a1a1a] border border-dashed border-zinc-600 rounded-2xl p-2 items-center gap-2"
            >
                <MaterialCommunityIcons name="upload" size={32} color="#A11B1B" />
                <Text className="text-zinc-400 text-sm">Toca para seleccionar imagen</Text>
            </TouchableOpacity>

            {receipt && (
                <Image
                    source={{ uri: receipt.uri }}
                    className="w-full h-[388px] rounded-2xl"
                    style={{ borderWidth: 2, borderColor: '#A11B1B' }}
                    resizeMode="cover"
                />
            )}

            <TouchableOpacity
                onPress={onConfirm}
                disabled={loading}
                className="bg-[#A11B1B] py-5 rounded-2xl items-center"
            >
                {loading
                    ? <ActivityIndicator color="white" />
                    : <Text className="text-white font-black uppercase tracking-widest">Confirmar Pago</Text>
                }
            </TouchableOpacity>
        </View>
    );
}
