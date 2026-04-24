import React, { useEffect, useState } from "react";
import { View, Text, Pressable, Image, ActivityIndicator, ScrollView } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ArrowLeft, CreditCard, ChevronRight, Gem } from "lucide-react-native";
import { apiGetPaymentMethods } from "@/src/api/paymentMethods";
import { PaymentMethod } from "@/src/types/paymentMethods";
import { useCurrency } from "@/src/hooks/useCurrency";

export default function MetodosPagosScreen() {
    const router = useRouter();
    const { packageId, credits, price } = useLocalSearchParams();
    const { symbol, rate } = useCurrency();

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
        router.push({
            pathname: "/(cliente)/payment/checkout",
            params: {
                methodId: method.id,
                methodType: method.type,
                packageId,
                credits,
                price
            }
        });
    };

    return (
        <ScrollView className="flex-1 bg-black" contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 40 }}>


            <View
                className="rounded-3xl mb-6 overflow-hidden"
                style={{ shadowColor: '#A11B1B', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.45, shadowRadius: 16, elevation: 10 }}
            >
                <View className="bg-[#A11B1B] px-6 py-5">
                    <Text className="text-white/60 text-[10px] uppercase tracking-widest font-bold mb-3">Resumen de compra</Text>
                    <View className="flex-row items-center justify-between">
                        <View className="flex-row items-center">
                            <View style={{ shadowColor: '#fff', shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.6, shadowRadius: 8 }}>
                                <Gem color="white" size={40} fill="#f8c0c0" strokeWidth={1.5} />
                            </View>
                            <View className="ml-4">
                                <Text className="text-white text-5xl font-black leading-none">{credits}</Text>
                                <Text className="text-white/60 text-xs font-semibold uppercase tracking-widest mt-1">créditos</Text>
                            </View>
                        </View>
                        <View className="items-end">
                            <View className="bg-white/15 px-4 py-2 rounded-2xl">
                                <Text className="text-white/60 text-[10px] uppercase tracking-widest">Total</Text>
                                <Text className="text-white text-3xl font-black">
                                    {symbol} {(Number(credits ?? 0) * rate).toFixed(2)}
                                </Text>
                            </View>
                        </View>
                    </View>
                </View>
            </View>


            <View className="items-center mb-4">
                <Text className="text-white text-[20px] tracking-widest font-black text-center">Elija un método de pago</Text>
                <View className="h-[2px] w-10 bg-[#A11B1B] rounded-full mt-1" />
            </View>

            {loading ? (
                <ActivityIndicator color="#D11B1B" size="large" className="mt-10" />
            ) : (
                methods.map((method) => (
                    <Pressable
                        key={method.id}
                        onPress={() => handleSelectMethod(method)}
                        style={{ shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 6 }}
                        className="bg-white rounded-[24px] mb-4 flex-row items-center p-5 active:opacity-80"
                    >

                        <View className="w-20 h-20 bg-gray-100 rounded-2xl overflow-hidden items-center justify-center">
                            {method.logoUrl ? (
                                <Image
                                    source={{ uri: method.logoUrl }}
                                    className="w-full h-full"
                                    resizeMode="contain"
                                />
                            ) : (
                                <View className="items-center justify-center">
                                    <CreditCard color="#A11B1B" size={32} strokeWidth={1.5} />
                                </View>
                            )}
                        </View>


                        <View className="flex-1 ml-4">
                            <Text className="text-[#A11B1B] text-[18px] font-black">
                                {method.type === "QR" ? "Pago por QR" : `Transferencia bancaria`}
                            </Text>
                            <View className="flex-row items-center mt-1">
                                <View className="bg-[#A11B1B]/10 px-2 py-0.5 rounded-lg">
                                    <Text className="text-[#A11B1B] text-[11px] font-bold uppercase tracking-wide">
                                        {method.type === "QR" ? "Escanear QR" : "Datos de cuenta"}
                                    </Text>
                                </View>
                            </View>
                        </View>


                    </Pressable>
                ))
            )}

            <Text className="text-zinc-600 text-center text-xs mt-6">
                Al seleccionar un método, se le mostrarán los detalles para realizar el depósito.
            </Text>
        </ScrollView>
    );
}
