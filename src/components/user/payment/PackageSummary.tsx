import { View, Text } from "react-native";
import { Gem } from "lucide-react-native";
import { useCurrency } from "@/src/hooks/useCurrency";

interface Props {
    credits: string | number;
    price: string | number;
}

export const PackageSummary = ({ credits }: Props) => {
    const { symbol, rate } = useCurrency();
    const total = (Number(credits ?? 0) * rate).toFixed(2);
    return (
        <View
            className="mx-4 mt-1 mb-4 rounded-3xl overflow-hidden"
            style={{ shadowColor: '#a844f2', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.4, shadowRadius: 16, elevation: 10 }}
        >
            <View className="bg-[#a844f2] px-6 py-2">
                <Text className="text-white/60 text-[10px] uppercase tracking-widest font-bold">Resumen del paquete</Text>
            </View>

            <View className="bg-[#1A0505] px-6 py-5 flex-row items-center justify-between">
                <View className="flex-row items-center" style={{ gap: 12 }}>
                    <View style={{ shadowColor: '#fff', shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.4, shadowRadius: 8 }}>
                        <Gem color="#a844f2" size={38} fill="#f8c0c0" strokeWidth={1.5} />
                    </View>
                    <View>
                        <Text className="text-[#a844f2] text-5xl font-black leading-none">{credits}</Text>
                        <Text className="text-[#a844f2]/60 text-xs uppercase tracking-widest font-bold mt-1">créditos</Text>
                    </View>
                </View>

                <View className="items-end">
                    <Text className="text-white/40 text-[10px] uppercase tracking-widest font-bold">Total</Text>
                    <View className="bg-[#a844f2] px-4 py-2 rounded-2xl mt-1">
                        <Text className="text-white text-2xl font-black">{symbol} {total}</Text>
                    </View>
                </View>
            </View>
        </View>
    );
};
