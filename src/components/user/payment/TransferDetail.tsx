import { useState } from "react";
import { View, Text, Pressable, Animated } from "react-native";
import { Hash, User, Copy, CheckCircle } from "lucide-react-native";
import * as Clipboard from 'expo-clipboard';

interface Props {
    accountNumber: string;
    accountName: string;
}

export const TransferDetail = ({ accountNumber, accountName }: Props) => {
    const [toast, setToast] = useState<string | null>(null);

    const copyToClipboard = async (value: string, label: string) => {
        await Clipboard.setStringAsync(value);
        setToast(`${label} copiado`);
        setTimeout(() => setToast(null), 2000);
    };

    return (
        <View
            className="mx-4 mt-2 rounded-3xl overflow-hidden"
            style={{ shadowColor: '#A11B1B', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.4, shadowRadius: 16, elevation: 10 }}
        >
            
            <View className="bg-[#A11B1B] px-6 py-2">
                <Text className="text-white/60 text-[10px] uppercase tracking-widest font-bold">Datos de transferencia</Text>
            </View>

          
            <View className="bg-[#1A0505] px-6 py-4" style={{ gap: 16 }}>

               
                <View>
                    <View className="flex-row items-center mb-2" style={{ gap: 6 }}>
                        <Hash color="#A11B1B" size={14} strokeWidth={2.5} />
                        <Text className="text-zinc-400 text-xs uppercase tracking-widest font-bold">Número de cuenta</Text>
                    </View>
                    <Pressable
                        onPress={() => copyToClipboard(accountNumber, "Número de cuenta")}
                        className="flex-row items-center justify-between bg-black/60 rounded-2xl px-5 py-4 active:opacity-70"
                        style={{ borderWidth: 1, borderColor: 'rgba(161,27,27,0.3)' }}
                    >
                        <Text className="text-white text-lg font-black tracking-widest">{accountNumber}</Text>
                        <Copy color="#A11B1B" size={18} strokeWidth={2} />
                    </Pressable>
                </View>

          
                <View>
                    <View className="flex-row items-center mb-2" style={{ gap: 6 }}>
                        <User color="#A11B1B" size={14} strokeWidth={2.5} />
                        <Text className="text-zinc-400 text-xs uppercase tracking-widest font-bold">Titular de cuenta</Text>
                    </View>
                    <Pressable
                        onPress={() => copyToClipboard(accountName, "Titular de cuenta")}
                        className="flex-row items-center justify-between bg-black/60 rounded-2xl px-5 py-4 active:opacity-70"
                        style={{ borderWidth: 1, borderColor: 'rgba(161,27,27,0.3)' }}
                    >
                        <Text className="text-white text-lg font-black">{accountName}</Text>
                        <Copy color="#A11B1B" size={18} strokeWidth={2} />
                    </Pressable>
                </View>

                <Text className="text-zinc-600 text-xs text-center">
                    Toca cualquier campo para copiar al portapapeles
                </Text>
            </View>

        
            {toast && (
                <View
                    className="absolute bottom-4 left-6 right-6 flex-row items-center justify-center py-3 rounded-2xl"
                    style={{ backgroundColor: '#1a1a1a', borderWidth: 1, borderColor: 'rgba(34,197,94,0.4)', gap: 8 }}
                >
                    <CheckCircle color="#22c55e" size={16} />
                    <Text className="text-green-500 text-sm font-bold">{toast}</Text>
                </View>
            )}
        </View>
    );
};
