import React from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator } from 'react-native';

interface Props {
    value: string;
    onChange: (text: string) => void;
    loading: boolean;
    onConfirm: () => void;
}

export default function WithdrawalRejectStep({ value, onChange, loading, onConfirm }: Props) {
    return (
        <View className="flex-1 gap-4 mt-2">
            <Text className="text-zinc-400 text-sm ml-1">
                Explica el motivo por el cual rechazas esta solicitud.
            </Text>

            <TextInput
                value={value}
                onChangeText={onChange}
                placeholder="Ej: El comprobante no es legible..."
                placeholderTextColor="#52525b"
                multiline
                numberOfLines={5}
                className="bg-[#1a1a1a] border border-zinc-700 rounded-2xl p-4 text-white"
                style={{ textAlignVertical: 'top', minHeight: 120 }}
            />

            <TouchableOpacity
                onPress={onConfirm}
                disabled={loading}
                className="bg-zinc-800 py-5 rounded-2xl items-center border border-zinc-700 mt-2"
            >
                {loading
                    ? <ActivityIndicator color="white" />
                    : <Text className="text-white font-black uppercase tracking-widest">Confirmar Rechazo</Text>
                }
            </TouchableOpacity>
        </View>
    );
}
