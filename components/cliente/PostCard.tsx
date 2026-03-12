import { Anfitriona } from "@/src/types/anfitriona";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { Bookmark, Diamond, Flame, Heart } from "lucide-react-native";
import { useState } from "react";
import { Image, Text, TouchableOpacity, View, useWindowDimensions } from "react-native";

type Props = {
  anfitriona: Anfitriona;
  height?: number;
};

export default function PostCard({ anfitriona, height }: Props) {
  const router = useRouter();
  const [liked, setLiked] = useState(false);
  const [saved, setSaved] = useState(anfitriona.isFavorite ?? false);
  const [likes, setLikes] = useState(anfitriona.likesCount ?? 0);
  const { width: W, height: H } = useWindowDimensions();
  const cardHeight = height && height > 0 ? height : H;

  const handleLike = () => {
    setLiked((prev) => {
      setLikes((c) => (prev ? c - 1 : c + 1));
      return !prev;
    });
  };

  const handleProfilePress = () => {
    router.push(`/(cliente)/anfitrionas/${anfitriona.id}` as any);
  };

  const featuredImage = anfitriona.images[0];

  return (
    <View style={{ width: W, height: cardHeight }}>
      <TouchableOpacity
        activeOpacity={0.95}
        onPress={handleProfilePress}
        style={{ flex: 1 }}
      >
        <Image
          source={{ uri: featuredImage }}
          style={{ position: "absolute", width: "100%", height: "100%" }}
          resizeMode="cover"
        />
      </TouchableOpacity>

      <LinearGradient
        colors={["transparent", "rgba(0,0,0,0.85)"]}
        style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 220 }}
        pointerEvents="none"
      />

      {/* Side actions */}
      <View style={{ position: "absolute", right: 10, bottom: 80, alignItems: "center" }}>

        {/* Avatar + online indicator */}
        <TouchableOpacity onPress={handleProfilePress} style={{ alignItems: "center", marginBottom: 22 }}>
          <View style={{ position: "relative" }}>
            <View style={{
              width: 50, height: 50, borderRadius: 25,
              borderWidth: 2, borderColor: "white", overflow: "hidden",
            }}>
              <Image source={{ uri: anfitriona.avatar }} style={{ width: "100%", height: "100%" }} />
            </View>

            {anfitriona.isOnline && (
              <View style={{
                position: "absolute", bottom: 0, right: 0,
                width: 14, height: 14, borderRadius: 7,
                backgroundColor: "#ef4444",
                borderWidth: 2, borderColor: "#111",
              }} />
            )}
          </View>

          {anfitriona.isOnline && (
            <Text style={{ color: "#ef4444", fontSize: 10, marginTop: 3, fontWeight: "600" }}>
              En línea
            </Text>
          )}
        </TouchableOpacity>

        {/* Likes */}
        <TouchableOpacity onPress={handleLike} style={{ alignItems: "center", marginBottom: 22 }}>
          <Heart
            size={34}
            color={liked ? "#ec4899" : "white"}
            fill={liked ? "#ec4899" : "transparent"}
          />
          <Text style={{ color: "white", fontSize: 12, marginTop: 3 }}>{likes}</Text>
        </TouchableOpacity>

        {/* Popular */}
        {anfitriona.isPopular && (
          <View style={{ alignItems: "center", marginBottom: 22 }}>
            <Flame size={32} color="#f97316" fill="#f97316" />
            <Text style={{ color: "white", fontSize: 12, marginTop: 3 }}>Popular</Text>
          </View>
        )}

        {/* Favoritos */}
        <TouchableOpacity onPress={() => setSaved((p) => !p)} style={{ alignItems: "center" }}>
          <Bookmark
            size={32}
            color={saved ? "#facc15" : "white"}
            fill={saved ? "#facc15" : "transparent"}
          />
          <Text style={{ color: "white", fontSize: 12, marginTop: 3 }}>Favoritos</Text>
        </TouchableOpacity>
      </View>

      {/* Bottom info */}
      <View style={{ position: "absolute", bottom: 20, left: 12, right: 80 }}>
        <Text style={{ color: "white", fontWeight: "bold", fontSize: 18 }}>
          {anfitriona.name}
        </Text>
        <Text style={{ color: "#e5e7eb", fontSize: 13, marginTop: 4 }}>
          {anfitriona.shortDescription}
        </Text>
        <View style={{ flexDirection: "row", alignItems: "center", marginTop: 8, gap: 12 }}>
          <Text style={{ color: "#9ca3af", fontSize: 12 }}>Desde</Text>
          <Text style={{ color: "white", fontSize: 13 }}>
            {anfitriona.solPrice != null ? `${anfitriona.solPrice} sol / ` : ""}{anfitriona.credits} cred
          </Text>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
            <Diamond size={12} color="#38bdf8" fill="#38bdf8" />
            <Text style={{ color: "white", fontSize: 13 }}>{anfitriona.credits}</Text>
          </View>
        </View>
      </View>
    </View>
  );
}
