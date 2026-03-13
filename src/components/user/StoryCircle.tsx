import React from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import { HistoryFeedItem } from '@/src/types/historyViewClient';

interface Props {
    item: HistoryFeedItem;
    onPress: () => void;
}

export const StoryCircle = ({ item, onPress }: Props) => {
    return (
        <TouchableOpacity
            onPress={onPress}
            activeOpacity={0.7}
            className="items-center mr-4"
        >
            <View
                className={`p-[3px] rounded-full border-2 ${item.hasUnseen ? 'border-red-600' : 'border-zinc-700'
                    }`}
            >
                <View className="bg-zinc-800 rounded-full overflow-hidden border border-black">
                    <Image
                        source={{ uri: item.avatar || 'https://via.placeholder.com/150' }}
                        className="w-16 h-16"
                    />
                </View>

                {item.totalStories > 0 && (
                    <View className="absolute -top-1 -right-1 bg-red-600 px-1.5 rounded-full border border-black">
                        <Text className="text-white text-[10px] font-bold">{item.totalStories}</Text>
                    </View>
                )}
            </View>

            <Text
                className="text-white text-[11px] mt-1.5 font-medium w-20 text-center"
                numberOfLines={1}
            >
                {item.name}
            </Text>
        </TouchableOpacity>
    );
};