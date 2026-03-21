import React from 'react';
import { View, Image, Text, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import type { GalleryItem } from '../../../types/gallery';

type Props = {
  item: GalleryItem;
  onPress: () => void;
};

export default function GalleryItemCard({ item, onPress }: Props) {
  return (
    <TouchableOpacity
      onPress={onPress}
      className="flex-1 aspect-square m-0.5 bg-zinc-900 overflow-hidden"
    >
      <Image
        source={{ uri: item.imageUrl }}
        resizeMode="cover"
        className="w-full h-full"
      />

      {/* Badge premium en esquina superior izquierda */}
      {item.isPremium && (
        <View className="absolute top-1.5 left-1.5 bg-black/60 rounded-lg px-1.5 py-0.5 flex-row items-center gap-1">
          <MaterialCommunityIcons name="lock" size={11} color="#ef4444" />
          <Text className="text-red-400 text-[10px] font-bold">
            {item.unlockCredits} cr
          </Text>
        </View>
      )}

      {/* Overlay candado centrado (mismo patrón que HistoryCard) */}
      {item.isPremium && (
        <View className="absolute inset-0 justify-center items-center">
          <View className="bg-black/30 p-3 rounded-2xl">
            <Text className="text-2xl">🔒</Text>
          </View>
        </View>
      )}
    </TouchableOpacity>
  );
}
