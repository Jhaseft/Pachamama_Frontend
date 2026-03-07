import ScreenHeader from "@/components/Menu/ScreenHeader";
import PostCard, { Post } from "@/components/cliente/PostCard";
import StoriesBar from "@/components/cliente/StoriesBar";
import StoryModal from "@/components/cliente/StoryModal";
import { Story } from "@/components/cliente/StoryItem";
import { useRef, useState } from "react";
import { Animated, View } from "react-native";

// ─── Mock Data ────────────────────────────────────────────────────────────────

const STORIES: Story[] = [
  { id: "1", name: "Maria",     avatar: "https://picsum.photos/seed/mstock1/200/200" },
  { id: "2", name: "Sofia",     avatar: "https://picsum.photos/seed/mstock2/200/200" },
  { id: "3", name: "Valentina", avatar: "https://picsum.photos/seed/mstock3/200/200" },
  { id: "4", name: "Isabella",  avatar: "https://picsum.photos/seed/mstock4/200/200" },
  { id: "5", name: "Camila",    avatar: "https://picsum.photos/seed/mstock5/200/200" },
  { id: "6", name: "Lucia",     avatar: "https://picsum.photos/seed/mstock6/200/200" },
];

const POSTS: Post[] = [
  { id: "1", image: "https://picsum.photos/seed/pstock1/500/900", user: { id: "1", name: "Maria",     avatar: "https://picsum.photos/seed/mstock1/200/200" }, bio: "Conversaciones alegres",  likes: 124, credits: 10 },
  { id: "2", image: "https://picsum.photos/seed/pstock2/500/900", user: { id: "2", name: "Sofia",     avatar: "https://picsum.photos/seed/mstock2/200/200" }, bio: "Disponible ahora mismo", likes: 89,  credits: 15 },
  { id: "3", image: "https://picsum.photos/seed/pstock3/500/900", user: { id: "3", name: "Valentina", avatar: "https://picsum.photos/seed/mstock3/200/200" }, bio: "Buenas noches",           likes: 213, credits: 12 },
  { id: "4", image: "https://picsum.photos/seed/pstock4/500/900", user: { id: "4", name: "Isabella",  avatar: "https://picsum.photos/seed/mstock4/200/200" }, bio: "Nueva foto",              likes: 67,  credits: 8  },
];



export default function ClienteInicio() {
  const [selectedStory, setSelectedStory] = useState<Story | null>(null);
  const scrollY = useRef(new Animated.Value(0)).current;

  return (
    <View className="flex-1 bg-black">
      <ScreenHeader title="ANFITRIONAS" role="cliente" />

      <View style={{ flex: 1 }}>
        <StoriesBar stories={STORIES} scrollY={scrollY} onStoryPress={setSelectedStory} />

        <Animated.FlatList
          data={POSTS}
          keyExtractor={(item) => item.id}
          pagingEnabled
          decelerationRate="fast"
          showsVerticalScrollIndicator={false}
          onScroll={Animated.event(
            [{ nativeEvent: { contentOffset: { y: scrollY } } }],
            { useNativeDriver: true }
          )}
          scrollEventThrottle={16}
          renderItem={({ item }) => <PostCard post={item} />}
        />
      </View>

      <StoryModal story={selectedStory} onClose={() => setSelectedStory(null)} />
    </View>
  );
}
