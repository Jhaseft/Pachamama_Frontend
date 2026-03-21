import React, { useEffect, useState } from "react";
import { View, Text, Pressable, Image, ActivityIndicator, ScrollView } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ArrowLeft, CreditCard } from "lucide-react-native";
import { apiGetPaymentMethods } from "@/src/api/paymentMethods";
import { PaymentMethod } from "@/src/types/paymentMethods"; // Importamos la interface pro

export default function MetodosPagosScreen() {
    const router = useRouter();
    const { packageId, credits, price } = useLocalSearchParams();

    const [methods, setMethods] = useState<PaymentMethod[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadMethods();
    }, []);

    const loadMethods = async () => {
        try {
            const data = await apiGetPaymentMethods();
            setMethods(data);
        } catch (error) {
            console.error("Error al cargar métodos:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleSelectMethod = (method: PaymentMethod) => {
        // Pasamos TODO el objeto serializado o los campos clave
        router.push({
            pathname: "/(cliente)/payment/checkout",
            params: {
                methodId: method.id,
                methodType: method.type, // 'QR' o 'TRANSFERENCIA'
                packageId,
                credits,
                price
            }
        });
    };

    return (
        <ScrollView className="flex-1 bg-black px-6">
            <View className="flex-row items-center my-6">
                <Pressable onPress={() => router.back()} className="mr-4 active:opacity-50">
                    <ArrowLeft color="white" size={28} />
                </Pressable>
                <Text className="text-white text-[25px] font-bold">Elija un método de pago</Text>
            </View>

            {loading ? (
                <ActivityIndicator color="#D11B1B" size="large" className="mt-10" />
            ) : (
                methods.map((method) => (
                    <Pressable
                        key={method.id}
                        onPress={() => handleSelectMethod(method)}
                        className="bg-white rounded-[25px] p-5 mb-4 flex-row items-center shadow-lg active:opacity-90"
                    >

                        <View className="w-1/3 aspect-square bg-gray-100 rounded-2xl overflow-hidden items-center justify-center">
                            {method.logoUrl ? (
                                <Image
                                    source={{ uri: method.logoUrl }}
                                    className="w-full h-full"
                                    resizeMode="contain"
                                />
                            ) : (
                                <View className="items-center justify-center p-2">
                                    <CreditCard color="#A11B1B" size={40} strokeWidth={1.5} />
                                    <Text className="text-[10px] text-gray-400 mt-1 text-center">
                                        Sin logo
                                    </Text>
                                </View>
                            )}
                        </View>

                        <View className="flex-1 ml-6 items-center">
                            <Text className="text-[#A11B1B] text-4xl font-black">{credits}</Text>
                            <Text className="text-[#A11B1B] text-[22px] font-bold -mt-1">créditos</Text>
                            <Text className="text-[#A11B1B] text-[18px] font-bold mt-2">
                                {method.type === "QR" ? "QR" : `transferencia`}
                            </Text>
                        </View>
                    </Pressable>
                ))
            )}

            <Text className="text-gray-500 text-center text-xs mt-4 mb-10">
                Al seleccionar un método, se le mostrarán los detalles para realizar el depósito.
            </Text>
        </ScrollView>
    );
}