import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

interface Props {
    initialPrice?: number;
    saving: boolean;
    onSave: (price: number) => void;
}

export default function SubscriptionPriceForm({ initialPrice, saving, onSave }: Props) {
    const [price, setPrice] = useState(initialPrice ? String(initialPrice) : '');

    const handleSubmit = () => {
        const parsed = parseInt(price);
        if (!parsed || parsed < 1) return;
        onSave(parsed);
    };

    const canSave = !!price && !saving;

    return (
        <View className="bg-[#141414] rounded-[20px] border border-white/10 p-5 gap-4">

            {/* Header */}
            <View className="flex-row items-center gap-3">
                <View className="w-11 h-11 rounded-xl bg-[#1a0505] items-center justify-center">
                    <MaterialCommunityIcons name="pencil-outline" size={20} color="#A11B1B" />
                </View>
                <View>
                    <Text className="text-white font-bold text-[15px]">
                        {initialPrice ? 'Editar precio' : 'Crear plan'}
                    </Text>
                    <Text className="text-zinc-500 text-[12px] mt-0.5">
                        Define cuánto cobrarás por mes
                    </Text>
                </View>
            </View>

            {/* Input */}
            <View className="bg-[#0f0f0f] rounded-xl border border-white/10 flex-row items-center px-4">
                <MaterialCommunityIcons name="diamond-stone" size={18} color="#A11B1B" />
                <TextInput
                    value={price}
                    onChangeText={setPrice}
                    keyboardType="numeric"
                    placeholder="Ej: 50"
                    placeholderTextColor="#3f3f46"
                    style={{ flex: 1, color: 'white', fontSize: 18, fontWeight: '700', paddingVertical: 14, paddingHorizontal: 10 }}
                />
                <Text className="text-zinc-500 text-[13px]">créditos/mes</Text>
            </View>

            {/* Botón */}
            <TouchableOpacity
                onPress={handleSubmit}
                disabled={!canSave}
                activeOpacity={0.8}
                className={`rounded-xl py-4 items-center justify-center flex-row gap-2 ${canSave ? 'bg-[#A11B1B]' : 'bg-[#2a0a0a]'}`}
            >
                {saving ? (
                    <ActivityIndicator size={16} color="white" />
                ) : (
                    <MaterialCommunityIcons name="content-save-outline" size={18} color="white" />
                )}
                <Text className="text-white font-bold text-[14px]">
                    {saving ? 'Guardando...' : initialPrice ? 'Guardar cambios' : 'Crear plan'}
                </Text>
            </TouchableOpacity>
        </View>
    );
}
