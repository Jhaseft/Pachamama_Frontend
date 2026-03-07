import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator } from 'react-native';
import { PackageData } from '../../types/package';

interface Props {
    initialData?: PackageData;
    onSubmit: (data: PackageData) => void;
    onCancel: () => void;
    isLoading: boolean;
    title: string;
}

export const PackageForm = ({ initialData, onSubmit, onCancel, isLoading, title }: Props) => {
    const [form, setForm] = useState<PackageData>({
        name: initialData?.name || '',
        credits: initialData?.credits || 0,
        price: initialData?.price || 0,
        isActive: initialData?.isActive || true,
    });

    const handlePress = () => {

        if(form.name.length < 3){
            alert("el nombre del paquete debe tener al menos 3 caracteres");
            return;
        }

        const finalData: PackageData = {
            ...form,
            // Aseguramos que credits sea Entero (@IsInt) y price sea Número (@IsNumber)
            credits: Math.floor(Number(form.credits)),
            price: Number(form.price),
        };
        onSubmit(finalData);
    };
    return (
        <View className="flex-1 bg-black px-6 justify-center ">
            <Text className="text-white text-3xl font-bold text-center mb-6">{title}</Text>

            <View className="bg-[#460202] p-6 rounded-3xl shadow-xl">
                {/* Campo: Nombre */}
                <Text className="text-gray-300 mb-2 ml-1">Nombre paquete</Text>
                <TextInput
                    className="bg-[#0D0D0D] text-white p-4 rounded-xl mb-4 border border-gray-600"
                    value={form.name}
                    onChangeText={(text) => setForm({ ...form, name: text })}
                    placeholder="Ej: Normal"
                    placeholderTextColor="#444"
                />

                {/* Campo: Créditos */}
                <Text className="text-gray-300 mb-2 ml-1">Valor Credito</Text>
                <TextInput
                    className="bg-[#0D0D0D] text-white p-4 rounded-xl mb-4 border border-gray-600"
                    value={form.credits.toString()}
                    keyboardType="numeric"
                    onChangeText={(text) => setForm({ ...form, credits: Number(text) })}
                    placeholder="300"
                    placeholderTextColor="#444"
                />

                {/* Campo: Precio */}
                <Text className="text-gray-300 mb-2 ml-1">Precio</Text>
                <TextInput
                    className="bg-[#0D0D0D] text-white p-4 rounded-xl mb-8 border border-gray-600"
                    value={form.price.toString()}
                    keyboardType="numeric"
                    onChangeText={(text) => setForm({ ...form, price: Number(text) })}
                    placeholder="100.00"
                    placeholderTextColor="#444"
                />

                {/* Botones de Acción */}
                <View className="flex-row justify-between">
                    <TouchableOpacity
                        onPress={onCancel}
                        className="bg-red-600 py-4 px-8 rounded-2xl"
                    >
                        <Text className="text-white font-bold">Cancelar</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        onPress={handlePress}
                        disabled={isLoading}
                        className="bg-[#A11213] py-4 px-8 rounded-2xl shadow-lg"
                    >
                        {isLoading ? (
                            <ActivityIndicator color="white" />
                        ) : (
                            <Text className="text-white font-bold">
                                {initialData ? 'Guardar cambios' : 'Crear'}
                            </Text>
                        )}
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );
};