import React from 'react';
import { View, Text, FlatList } from 'react-native';
import { StoryCircle } from './StoryCircle';
import { HistoryFeedItem } from '@/src/types/historyViewClient';

interface Props {
    stories: HistoryFeedItem[];
    onSelect: (item: HistoryFeedItem) => void;
}

export const StoriesBarFeed = ({ stories, onSelect }: Props) => {
    return (
        <View className="bg-black py-1 border-b border-zinc-900">
            <View className="flex-row justify-between items-center px-4 mb-4">
                <Text className="text-white text-[20px] font-semibold">Historias</Text>
            </View>

            <FlatList
                horizontal
                showsHorizontalScrollIndicator={false}
                data={stories}
                keyExtractor={(item) => item.userId}
                contentContainerStyle={{ paddingHorizontal: 16 }}
                renderItem={({ item }) => (
                    <StoryCircle
                        item={item}
                        onPress={() => onSelect(item)}
                    />
                )}
            />
        </View>
    );
};