import { FlatList, Image, Text, View } from "react-native";

type Props = {
  images: string[];
};

const THUMB_SIZE = 130;

export default function GallerySection({ images }: Props) {
  if (images.length === 0) return null;

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
        renderItem={({ item }) => (
          <View
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
          </View>
        )}
      />
    </View>
  );
}
