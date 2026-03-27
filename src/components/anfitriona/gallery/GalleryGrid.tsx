import React from 'react';
import { FlatList, View, Text } from 'react-native';
import type { GalleryItem } from '../../../types/gallery';
import GalleryItemCard from './GalleryItemCard';

type Props = {
  items: GalleryItem[];
  onPressItem: (item: GalleryItem) => void;
};

export default function GalleryGrid({ items, onPressItem }: Props) {
  return (
    <FlatList
      data={items}
      keyExtractor={(item) => item.id}
      numColumns={2}
      scrollEnabled={false}
      className="px-0.5"
      contentContainerStyle={{ paddingBottom: 20 }}
      renderItem={({ item }) => (
        <GalleryItemCard item={item} onPress={() => onPressItem(item)} />
      )}
      ListEmptyComponent={
        <View className="py-10 items-center">
          <Text className="text-zinc-500 text-sm">
            Aún no has publicado fotos en tu galería
          </Text>
        </View>
      }
    />
  );
}
