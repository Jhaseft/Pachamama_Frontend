import { View, Text } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Icon } from 'react-native-screens';
import { ComponentProps } from 'react';

type IconName = ComponentProps<typeof MaterialCommunityIcons>['name'];

interface StatCardProps {
    title: string;
    value: string | number;
    icon: IconName;
    color?: string;
}

export const StatCard = ({ title, value, icon, color = "#e11d48" }: StatCardProps) => (
    <View className="bg-[#460202] border border-gray-800 p-3 rounded-2xl w-[48%] mb-4 items-center">
        <View style={{ backgroundColor: color + '20' }} className="p-2 rounded-full mb-1">
            <MaterialCommunityIcons name={icon} size={28} color={color} />
        </View>
        <Text className="text-gray-300 text-[12px] font-medium text-center">{title}</Text>
        <Text className="text-white text-xl font-bold">{value}</Text>
    </View>
);