import ScreenHeader from "@/components/Menu/ScreenHeader";
import PostCard from "@/components/cliente/PostCard";
import StoriesBar from "@/components/cliente/StoriesBar";
import StoryModal from "@/components/cliente/StoryModal";
import { Story } from "@/components/cliente/StoryItem";
import { MOCK_ANFITRIONAS } from "@/src/mocks/anfitrionas";
import { getPublicHostesses } from "@/src/services/hostesses";
import type { Anfitriona } from "@/src/types/anfitriona";

// Stories remain on mock data (outside HU1 scope)
const MOCK_STORIES = MOCK_ANFITRIONAS.map((a) => ({
  id: a.id,
  name: a.name,
  avatar: a.avatar,
  isOnline: a.isOnline,
}));
import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  LayoutChangeEvent,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function ClienteInicio() {
  const [anfitrionas, setAnfitrionas] = useState<Anfitriona[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedStory, setSelectedStory] = useState<Story | null>(null);
  const scrollY = useRef(new Animated.Value(0)).current;
  const [feedHeight, setFeedHeight] = useState(0);

  const handleFeedLayout = (event: LayoutChangeEvent) => {
    const nextHeight = Math.round(event.nativeEvent.layout.height);
    if (nextHeight !== feedHeight) {
      setFeedHeight(nextHeight);
    }
  };

  const loadAnfitrionas = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getPublicHostesses();
      setAnfitrionas(data);
    } catch {
      setError("No se pudieron cargar las anfitrionas. Verifica tu conexión.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadAnfitrionas();
  }, []);


  return (
    <View className="flex-1 bg-black">
      <ScreenHeader title="ANFITRIONAS" role="cliente" />

      {/* Loading */}
      {loading && (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#E30708" />
        </View>
      )}

      {/* Error */}
      {!loading && error && (
        <View className="flex-1 items-center justify-center px-6">
          <Text className="text-white text-center text-base mb-4">{error}</Text>
          <TouchableOpacity
            onPress={loadAnfitrionas}
            style={{
              backgroundColor: "#ec4899",
              paddingHorizontal: 24,
              paddingVertical: 12,
              borderRadius: 999,
            }}
          >
            <Text style={{ color: "white", fontWeight: "600" }}>Reintentar</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Empty */}
      {!loading && !error && anfitrionas.length === 0 && (
        <View className="flex-1 items-center justify-center">
          <Text style={{ color: "#6b7280", fontSize: 16 }}>
            No hay anfitrionas disponibles por el momento.
          </Text>
        </View>
      )}

      {/* Feed */}
      {!loading && !error && anfitrionas.length > 0 && (
        <View style={{ flex: 1 }} onLayout={handleFeedLayout}>
          <StoriesBar
            stories={MOCK_STORIES}
            scrollY={scrollY}
            onStoryPress={setSelectedStory}
          />

          <Animated.FlatList
            data={anfitrionas}
            keyExtractor={(item) => item.id}
            pagingEnabled
            decelerationRate="fast"
            showsVerticalScrollIndicator={false}
            onScroll={Animated.event(
              [{ nativeEvent: { contentOffset: { y: scrollY } } }],
              { useNativeDriver: true },
            )}
            scrollEventThrottle={16}
            style={{ flex: 1 }}
            renderItem={({ item }) => (
              <PostCard anfitriona={item} height={feedHeight} />
            )}
          />
        </View>
      )}

      <StoryModal story={selectedStory} onClose={() => setSelectedStory(null)} />
    </View>
  );
}
