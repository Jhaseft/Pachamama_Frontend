import React, { useEffect, useState } from "react";
import { View, Text, ScrollView, Image, Pressable, ActivityIndicator } from "react-native";
import { Gem, Crown } from "lucide-react-native";
import { apiGetAllPackages } from "@/src/api/package"; // Ajusta la ruta a tu archivo de API
import { PackageData } from "@/src/types/package";
import { apiGetMyWallet, WalletResponse } from "@/src/api/userClient";
import { Link } from "expo-router";

export default function CreditosScreen() {
    const [packages, setPackages] = useState<PackageData[]>([]);
    const [loading, setLoading] = useState(true);
    const [wallet, setWallet] = useState<WalletResponse | null>(null);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        try {

            //ejecutamos las 2 peticiones en paralelo
            const [packagesData, walletData] = await Promise.all([
                apiGetAllPackages(),
                apiGetMyWallet()
            ]);

            setPackages(packagesData);
            setWallet(walletData);
        } catch (error) {
            console.error("Error cargando créditos:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <ScrollView className="flex-1 bg-black px-4 pt-2">

            <View className="w-3/5 self-center border-2 border-white rounded-[25px] py-4 flex-row justify-center items-center mb-4">
                <Gem color="white" size={32} />
                <Text className="text-white text-4xl font-bold ml-3">
                    {wallet?.balance || 0}
                </Text>
            </View>

            <Text className="text-white text-[25px] font-bold text-center mb-6">¡Compra creditos!</Text>

            {loading ? (
                <ActivityIndicator color="#D11B1B" size="large" />
            ) : (
                packages.map((item) => (
                    <View key={item.id} className="bg-white rounded-3xl mb-6 flex-row items-center p-[14px] relative">


                        <View className="absolute -top-3 -right-2 bg-[#A11B1B] px-4 py-1 rounded-xl z-10">
                            <Text className="text-white font-bold text-xs uppercase">
                                {item.credits >= 100 ? "Bono +10" : "Popular"}
                            </Text>
                        </View>


                        <View className="flex-1">

                            <View className="flex-row items-center mb-1">
                                <Gem color="#A11B1B" size={30} fill="none" strokeWidth={2.5} />
                                <Text className="text-[#A11B1B] text-[33px] font-black ml-2">
                                    {item.credits}
                                </Text>
                            </View>

                            <View className="ml-1">
                                <Text className="text-[#A11B1B] text-[22px] font-bold leading-5">
                                    creditos
                                </Text>
                                <Text className="text-[#A11B1B] text-[22px] font-bold">
                                    Soles/{item.price}
                                </Text>
                            </View>
                        </View>

                        <Link
                            className="bg-[#A11B1B] px-8 py-3 rounded-[14px] active:opacity-70"
                            asChild
                            href={{
                                pathname: "/(cliente)/payment/paymentMethods",
                                params: {
                                    packageId: item.id,
                                    credits: item.credits,
                                    price: item.price,
                                },
                            }}
                        >
                            <Text className="text-white font-extrabold text-xl">Comprar</Text>
                        </Link>

                    </View>
                ))
            )}

            <View className="h-20" />
        </ScrollView>
    );
}