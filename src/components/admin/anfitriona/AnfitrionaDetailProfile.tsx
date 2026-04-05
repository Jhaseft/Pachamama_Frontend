import { View, Text, Image } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

interface Props {
    firstName: string;
    lastName: string;
    avatarUrl: string;
    isActive: boolean;
    isOnline: boolean;
    balance: number;
}

export default function AnfitrionaDetailProfile({ firstName, lastName, avatarUrl, isActive, isOnline, balance }: Props) {

    const CREDITS_TO_SOLES = 0.1;
    const toSoles = (balance: number) => (balance * CREDITS_TO_SOLES).toFixed(2);


    return (
        <>
            <View className="items-center mb-6">
                <View style={{ shadowColor: '#A11B1B', shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.8, shadowRadius: 16, elevation: 8 }}>
                    <Image
                        source={{ uri: avatarUrl || 'https://via.placeholder.com/150' }}
                        className="w-28 h-28 rounded-full"
                        style={{ borderWidth: 3, borderColor: '#A11B1B' }}
                    />
                </View>
                <Text className="text-white text-[22px] font-black mt-3 tracking-wide">
                    {firstName} {lastName}
                </Text>
                <View className="flex-row gap-2 mt-2">
                    <View className={`rounded-full px-3 py-1 border ${isActive ? 'bg-[#0d1f0d] border-green-500' : 'bg-[#1a0505] border-red-500'}`}>
                        <Text className={`text-xs font-bold ${isActive ? 'text-green-400' : 'text-red-400'}`}>
                            {isActive ? 'Activa' : 'Inactiva'}
                        </Text>
                    </View>
                    <View className={`rounded-full px-3 py-1 border ${isOnline ? 'bg-[#0d1f0d] border-green-500' : 'bg-[#1a1a1a] border-zinc-700'}`}>
                        <Text className={`text-xs font-bold ${isOnline ? 'text-green-400' : 'text-zinc-500'}`}>
                            {isOnline ? 'En línea' : 'Desconectada'}
                        </Text>
                    </View>
                </View>
            </View>

            <View className="flex-row items-center gap-3 bg-[#1a0505] rounded-2xl border border-[#A11B1B] p-4 mb-3">
                <View className="w-9 h-9 rounded-xl bg-[#2d0a0a] items-center justify-center">
                    <MaterialCommunityIcons name="wallet-outline" size={18} color="#A11B1B" />
                </View>
                <View>
                    <Text className="text-zinc-500 text-[10px] uppercase tracking-widest">Saldo en Billetera</Text>
                    <Text className="text-white text-[15px] font-semibold mt-0.5">{toSoles(balance)} soles</Text>
                </View>
            </View>
        </>
    );
}
