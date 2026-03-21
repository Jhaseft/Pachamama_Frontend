import { View, Text } from "react-native";

interface Props {
    credits: string | number;
    price: string | number;
}

export const PackageSummary = ({ credits, price }: Props) => (
    <View className="border-2 border-white rounded-[30px] p-6 items-center my-4 mx-4">
        <Text className="text-[#A11B1B] text-5xl font-black">{credits}</Text>
        <Text className="text-[#A11B1B] text-3xl font-bold">Créditos</Text>
        <Text className="text-[#A11B1B] text-3xl font-bold">Soles/{price}</Text>
    </View>
);