import { ZoomableImage } from "@/components/cliente/profile/ZoomableImage";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useRef, useState } from "react";
import {
  FlatList,
  Image,
  StatusBar,
  Text,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import colors from "@/constants/colors";

type GalleryImage = { id: string; imageUrl: string };

export default function AlbumScreen() {
  const { images: imagesParam, anfitrionaName } = useLocalSearchParams<{
    images: string;
    anfitrionaName: string;
  }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { width, height: screenHeight } = useWindowDimensions();

  const images: GalleryImage[] = imagesParam ? JSON.parse(imagesParam) : [];

  const [viewerIndex, setViewerIndex] = useState<number | null>(null);
  const viewerRef = useRef<FlatList>(null);

  const CELL_SIZE = (width - 4) / 3;

  const openViewer = (index: number) => {
    setViewerIndex(index);
  };

  const closeViewer = () => {
    setViewerIndex(null);
  };

  const onViewableChanged = useCallback(({ viewableItems }: any) => {
    if (viewableItems.length > 0) {
      setViewerIndex(viewableItems[0].index);
    }
  }, []);

  const viewabilityConfig = useRef({ itemVisiblePercentThreshold: 60 }).current;

  return (
    <View style={{ flex: 1, backgroundColor: colors.surface.DEFAULT }}>
      <Stack.Screen options={{ headerShown: false }} />

      {/* Header */}
      <View
        style={{
          paddingTop: insets.top + 8,
          paddingBottom: 12,
          paddingHorizontal: 16,
          flexDirection: "row",
          alignItems: "center",
          borderBottomWidth: 1,
          borderBottomColor: "rgba(255,255,255,0.08)",
        }}
      >
        <TouchableOpacity onPress={() => router.back()} style={{ marginRight: 12 }}>
          <MaterialCommunityIcons name="arrow-left" size={24} color="white" />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={{ color: "white", fontWeight: "800", fontSize: 16 }}>
            {anfitrionaName}
          </Text>
          <Text style={{ color: "rgba(255,255,255,0.45)", fontSize: 12 }}>
            {images.length} foto{images.length !== 1 ? "s" : ""}
          </Text>
        </View>
      </View>

      {/* Grid */}
      {viewerIndex === null && (
        <FlatList
          data={images}
          keyExtractor={(item) => item.id}
          numColumns={3}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: insets.bottom + 16 }}
          renderItem={({ item, index }) => (
            <TouchableOpacity
              onPress={() => openViewer(index)}
              activeOpacity={0.85}
              style={{ margin: 1, width: CELL_SIZE, height: CELL_SIZE }}
            >
              <Image
                source={{ uri: item.imageUrl }}
                style={{ width: "100%", height: "100%" }}
                resizeMode="cover"
              />
            </TouchableOpacity>
          )}
        />
      )}

      {/* Viewer fullscreen */}
      {viewerIndex !== null && (
        <View style={{ flex: 1, backgroundColor: "#000" }}>
          <StatusBar hidden />

          {/* Controles overlay */}
          <View
            style={{
              position: "absolute",
              top: insets.top + 8,
              left: 0,
              right: 0,
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              paddingHorizontal: 16,
              zIndex: 10,
            }}
          >
            <TouchableOpacity
              onPress={closeViewer}
              style={{
                backgroundColor: "rgba(0,0,0,0.55)",
                borderRadius: 20,
                padding: 8,
              }}
            >
              <MaterialCommunityIcons name="close" size={22} color="white" />
            </TouchableOpacity>
            <View
              style={{
                backgroundColor: "rgba(0,0,0,0.55)",
                borderRadius: 12,
                paddingHorizontal: 12,
                paddingVertical: 6,
              }}
            >
              <Text style={{ color: "white", fontWeight: "700", fontSize: 13 }}>
                {viewerIndex + 1} / {images.length}
              </Text>
            </View>
          </View>

          <FlatList
            ref={viewerRef}
            data={images}
            keyExtractor={(item) => item.id}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            initialScrollIndex={viewerIndex}
            getItemLayout={(_, index) => ({
              length: width,
              offset: width * index,
              index,
            })}
            onViewableItemsChanged={onViewableChanged}
            viewabilityConfig={viewabilityConfig}
            renderItem={({ item }) => (
              <View style={{ width, flex: 1 }}>
                <ZoomableImage uri={item.imageUrl} width={width} height={screenHeight} />
              </View>
            )}
          />

          <Text
            style={{
              color: "rgba(255,255,255,0.35)",
              fontSize: 11,
              textAlign: "center",
              paddingBottom: insets.bottom + 12,
            }}
          >
            Pellizca para hacer zoom · desliza para navegar
          </Text>
        </View>
      )}
    </View>
  );
}
