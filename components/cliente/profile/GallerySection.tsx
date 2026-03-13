import { FlatList, Image, Text, TouchableOpacity, View } from "react-native";
import { useState } from "react";
import ImageViewerModal from "./ImageViewerModal";

type Props = {
  images: string[];
};

const THUMB_SIZE = 130;

export default function GallerySection({ images }: Props) {
  const [viewerVisible, setViewerVisible] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);

  if (images.length === 0) return null;

  function openImage(index: number) {
    setSelectedIndex(index);
    setViewerVisible(true);
  }

  return (
    <View style={{ marginTop: 28, paddingHorizontal: 16 }}>
      <Text
        style={{
          color: "#9ca3af",
          fontSize: 12,
          fontWeight: "700",
          letterSpacing: 1.2,
          marginBottom: 14,
        }}
      >
        MI GALERÍA
      </Text>

      <FlatList
        data={images}
        horizontal
        showsHorizontalScrollIndicator={false}
        keyExtractor={(_, i) => String(i)}
        ItemSeparatorComponent={() => <View style={{ width: 10 }} />}
        renderItem={({ item, index }) => (
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() => openImage(index)}
            style={{
              width: THUMB_SIZE,
              height: THUMB_SIZE * 1.3,
              borderRadius: 12,
              overflow: "hidden",
              backgroundColor: "#1a1a1a",
            }}
          >
            <Image
              source={{ uri: item }}
              style={{ width: "100%", height: "100%" }}
              resizeMode="cover"
            />
          </TouchableOpacity>
        )}
      />

      <ImageViewerModal
        images={images}
        initialIndex={selectedIndex}
        visible={viewerVisible}
        onClose={() => setViewerVisible(false)}
      />
    </View>
  );
}
