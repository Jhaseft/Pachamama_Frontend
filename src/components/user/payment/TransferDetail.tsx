import { View, Text, TextInput } from "react-native";

interface Props {
    accountNumber: string;
    accountName: string;
}

export const TransferDetail = ({ accountNumber, accountName }: Props) => (
    <View className="bg-[#3D0505] rounded-[30px] p-8 mx-4 mt-2">
        <Text className="text-white text-lg font-bold mb-2">Numero de cuenta</Text>
        <View className="bg-black border border-white rounded-2xl p-4 mb-4">
            <Text className="text-white text-lg font-bold text-center">{accountNumber}</Text>
        </View>

        <Text className="text-white text-lg font-bold mb-2">Usuario de cuenta</Text>
        <View className="bg-black border border-white rounded-2xl p-4">
            <Text className="text-white text-lg font-bold text-center">{accountName}</Text>
        </View>
    </View>
);