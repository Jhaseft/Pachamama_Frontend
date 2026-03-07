import { LinearGradient } from "expo-linear-gradient";
import { Bookmark, Diamond, Heart, Plus } from "lucide-react-native";
import { useState } from "react";
import { Dimensions, Image, Text, TouchableOpacity, View } from "react-native";

const { width: W, height: H } = Dimensions.get("window");
const FEED_HEIGHT = H - 193;

export type Post = {
  id: string;
  image: string;
  user: { id: string; name: string; avatar: string };
  bio: string;
  likes: number;
  credits: number;
};

export default function PostCard({ post }: { post: Post }) {
  const [liked, setLiked] = useState(false);
  const [saved, setSaved] = useState(false);
  const [likes, setLikes] = useState(post.likes);

  const handleLike = () => {
    setLiked((prev) => {
      setLikes((c) => (prev ? c - 1 : c + 1));
      return !prev;
    });
  };

  return (
    <View style={{ width: W, height: FEED_HEIGHT }}>
      <Image
        source={{ uri: post.image }}
        style={{ position: "absolute", width: "100%", height: "100%" }}
        resizeMode="cover"
      />

      <LinearGradient
        colors={["transparent", "rgba(0,0,0,0.85)"]}
        style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 220 }}
      />

      {/* Side actions */}
      <View style={{ position: "absolute", right: 10, bottom: 80, alignItems: "center" }}>
        <TouchableOpacity style={{ alignItems: "center", marginBottom: 22 }}>
          <View style={{
            width: 50, height: 50, borderRadius: 25,
            borderWidth: 2, borderColor: "white", overflow: "hidden",
          }}>
            <Image source={{ uri: post.user.avatar }} style={{ width: "100%", height: "100%" }} />
          </View>
          <View style={{
            position: "absolute", bottom: -8,
            width: 18, height: 18, borderRadius: 9,
            backgroundColor: "#ec4899",
            alignItems: "center", justifyContent: "center",
          }}>
            <Plus size={12} color="white" strokeWidth={3} />
          </View>
        </TouchableOpacity>

        <TouchableOpacity onPress={handleLike} style={{ alignItems: "center", marginBottom: 22 }}>
          <Heart
            size={34}
            color={liked ? "#ec4899" : "white"}
            fill={liked ? "#ec4899" : "transparent"}
          />
          <Text style={{ color: "white", fontSize: 12, marginTop: 3 }}>{likes}</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => setSaved((p) => !p)} style={{ alignItems: "center", marginBottom: 22 }}>
          <Bookmark
            size={32}
            color={saved ? "#facc15" : "white"}
            fill={saved ? "#facc15" : "transparent"}
          />
          <Text style={{ color: "white", fontSize: 12, marginTop: 3 }}>Guardar</Text>
        </TouchableOpacity>

        <View style={{ alignItems: "center" }}>
          <Diamond size={30} color="#38bdf8" fill="#38bdf8" />
          <Text style={{ color: "white", fontSize: 12, marginTop: 3 }}>{post.credits}</Text>
        </View>
      </View>

      {/* Bottom info */}
      <View style={{ position: "absolute", bottom: 20, left: 12, right: 80 }}>
        <Text style={{ color: "white", fontWeight: "bold", fontSize: 16 }}>
          {post.user.name}
        </Text>
        <Text style={{ color: "#e5e7eb", fontSize: 13, marginTop: 4 }}>
          {post.bio}
        </Text>
        <View style={{ flexDirection: "row", alignItems: "center", marginTop: 8, gap: 12 }}>
          <Text style={{ color: "#9ca3af", fontSize: 12 }}>Desde</Text>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
            <Diamond size={12} color="#38bdf8" fill="#38bdf8" />
            <Text style={{ color: "white", fontSize: 13 }}>{post.credits}</Text>
          </View>
        </View>
      </View>
    </View>
  );
}
