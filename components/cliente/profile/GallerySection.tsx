import { useState } from "react";
import {
  FlatList,
  Image,
  Modal,
  StatusBar,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
  useWindowDimensions,
} from "react-native";

type Props = {
  images: string[];
};

const THUMB_SIZE = 130;

export default function GallerySection({ images }: Props) {
  const [selected, setSelected] = useState<string | null>(null);
  const { width, height } = useWindowDimensions();

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
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() => setSelected(item)}
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

      <Modal visible={!!selected} transparent animationType="fade" statusBarTranslucent>
        <StatusBar hidden />
        <TouchableWithoutFeedback onPress={() => setSelected(null)}>
          <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.95)", alignItems: "center", justifyContent: "center" }}>
            {selected && (
              <Image
                source={{ uri: selected }}
                style={{ width, height: height * 0.85 }}
                resizeMode="contain"
              />
            )}
            <Text style={{ color: "rgba(255,255,255,0.4)", marginTop: 16, fontSize: 13 }}>
              Toca para cerrar
            </Text>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </View>
  );
}
