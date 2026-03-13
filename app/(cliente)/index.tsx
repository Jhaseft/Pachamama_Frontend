import ScreenHeader from "@/components/Menu/ScreenHeader";
import PostCard from "@/components/cliente/PostCard";
import StoriesBar from "@/components/cliente/StoriesBar";
import StoryModal from "@/components/cliente/StoryModal";
import { Story } from "@/components/cliente/StoryItem";
import { MOCK_ANFITRIONAS } from "@/src/mocks/anfitrionas";
import { getPublicHostesses } from "@/src/services/hostesses";
import type { Anfitriona } from "@/src/types/anfitriona";
import { StoriesBarFeed } from "@/src/components/user/StoriesBarFeed";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";

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
import { apiGetStoriesFeed } from "@/src/api/anfitrionaHistory";
import { HistoryFeedItem } from "@/src/types/historyViewClient";

export default function ClienteInicio() {
  const [anfitrionas, setAnfitrionas] = useState<Anfitriona[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedStory, setSelectedStory] = useState<Story | null>(null);
  const scrollY = useRef(new Animated.Value(0)).current;
  const [feedHeight, setFeedHeight] = useState(0);

  const router = useRouter();
  const [feed, setFeed] = useState<HistoryFeedItem[]>([]);

  // cargar historias
  const loadFeed = async () => {
    try {
      const data = await apiGetStoriesFeed();
      setFeed(data ?? []);
    } catch (error) {
      console.error("Error cargando historias:", error);
      setFeed([]);
    }
  };


  useEffect(() => {
    loadFeed();
  }, []);

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
    <SafeAreaView className="flex-1 -mt-8 bg-black">
      <ScreenHeader title="ANFITRIONAS" role="cliente" />

      <StoriesBarFeed
        stories={feed}
        onSelect={(item) => {
          console.log("ITEM CLICK:", item);
          if (!item.stories || item.stories.length === 0) {
            console.warn(`La anfitriona ${item.name} no tiene historias activas.`);
            return;
          }

          const formattedStories = item.stories.map((s) => ({
            id: s.id,
            uri: s.mediaUrl,
            type: s.mediaType === "VIDEO" ? "video" : "image",
            duration: 5,
          }));

          router.push({
            pathname: "/story-viewer",
            params: {
              data: JSON.stringify({
                id: item.userId,
                name: item.name,
                avatar: item.avatar,
                stories: formattedStories,
              }),
            },
          });
        }}
      />

      {/* Loading */}
      {loading && (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#ec4899" />
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
    </SafeAreaView>
  );
}
