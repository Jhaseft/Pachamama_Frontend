import ScreenHeader from "@/components/Menu/ScreenHeader";
import PostCard from "@/components/cliente/PostCard";
import { getPublicHostesses } from "@/src/services/hostesses";
import type { Anfitriona } from "@/src/types/anfitriona";
import { StoriesBarFeed } from "@/src/components/user/StoriesBarFeed";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";

import { useFocusEffect } from "@react-navigation/native";



import { useCallback, useEffect, useRef, useState } from "react";
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
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [feedHeight, setFeedHeight] = useState(0);
  const [storiesBarHeight, setStoriesBarHeight] = useState(0);
  const [page, setPage] = useState(1);
  const hasMore = useRef(true);

  const scrollY = useRef(new Animated.Value(0)).current;
  const storiesTranslateY = scrollY.interpolate({
    inputRange: [0, storiesBarHeight || 80],
    outputRange: [0, -(storiesBarHeight || 80)],
    extrapolate: "clamp",
  });

  const router = useRouter();
  const [feed, setFeed] = useState<HistoryFeedItem[]>([]);

  const loadFeed = async () => {
    try {
      const data = await apiGetStoriesFeed();
      setFeed(data ?? []);
    } catch (error) {
      console.error("Error cargando historias:", error);
      setFeed([]);
    }
  };


  useFocusEffect(
    useCallback(() => {
      loadFeed();
    }, [])
  );

  const handleFeedLayout = (event: LayoutChangeEvent) => {
    const nextHeight = Math.round(event.nativeEvent.layout.height);
    if (nextHeight !== feedHeight) {
      setFeedHeight(nextHeight);
    }
  };

  const loadAnfitrionas = async () => {
    setLoading(true);
    setError(null);
    hasMore.current = true;
    try {
      const result = await getPublicHostesses(1);
      setAnfitrionas(result.anfitrionas);
      setPage(1);
      hasMore.current = result.hasMore;
    } catch {
      setError("No se pudieron cargar las anfitrionas. Verifica tu conexión.");
    } finally {
      setLoading(false);
    }
  };

  const loadMore = useCallback(async () => {
    if (loadingMore || !hasMore.current) return;
    setLoadingMore(true);
    try {
      const nextPage = page + 1;
      const result = await getPublicHostesses(nextPage);
      setAnfitrionas((prev) => [...prev, ...result.anfitrionas]);
      setPage(nextPage);
      hasMore.current = result.hasMore;
    } catch {
      // silencioso: el usuario puede seguir viendo las que ya cargaron
    } finally {
      setLoadingMore(false);
    }
  }, [loadingMore, page]);

  useEffect(() => {
    void loadAnfitrionas();
  }, []);

  return (
    <SafeAreaView className="flex-1 -mt-8 bg-black">
      <ScreenHeader title="ANFITRIONAS" role="cliente" />

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
            <Text style={{ color: "white", fontWeight: "600" }}>
              Reintentar
            </Text>
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

      {/* Feed + stories overlay */}
      {!loading && !error && anfitrionas.length > 0 && (
        <View style={{ flex: 1 }} onLayout={handleFeedLayout}>
          <Animated.FlatList
            data={anfitrionas}
            keyExtractor={(item) => item.id}
            pagingEnabled
            decelerationRate="fast"
            showsVerticalScrollIndicator={false}
            style={{ flex: 1 }}
            onEndReached={loadMore}
            onEndReachedThreshold={0.5}
            onScroll={Animated.event(
              [{ nativeEvent: { contentOffset: { y: scrollY } } }],
              { useNativeDriver: true },
            )}
            scrollEventThrottle={16}
            renderItem={({ item }) => (
              <PostCard anfitriona={item} height={feedHeight} />
            )}
            ListFooterComponent={
              loadingMore ? (
                <View
                  style={{
                    height: feedHeight,
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <ActivityIndicator size="large" color="#ec4899" />
                </View>
              ) : null
            }
          />

          {/* Stories bar — flota sobre el feed y sube con el scroll */}
          <Animated.View
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              transform: [{ translateY: storiesTranslateY }],
            }}
            onLayout={(e) => {
              const h = Math.round(e.nativeEvent.layout.height);
              if (h !== storiesBarHeight) setStoriesBarHeight(h);
            }}
          >
            <StoriesBarFeed
              stories={feed}
              onSelect={(item) => {
                //     console.log("ITEM CLICK:", item);
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
          </Animated.View>
        </View>
      )}
    </SafeAreaView>
  );
}
