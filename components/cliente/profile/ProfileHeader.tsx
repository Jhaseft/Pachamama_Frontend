import { Image, Text, View, useWindowDimensions } from "react-native";

type Props = {
  name: string;
  avatar: string;
  coverImage: string;
  isOnline: boolean;
};

const COVER_HEIGHT = 260;
const AVATAR_SIZE = 90;
const AVATAR_LEFT = 20;

export default function ProfileHeader({ name, avatar, coverImage, isOnline }: Props) {
  const { width } = useWindowDimensions();

  return (
    <View style={{ paddingBottom: AVATAR_SIZE / 2 + 12 }}>
      {/* Cover image */}
      <View style={{ width, height: COVER_HEIGHT, backgroundColor: "#1a1a1a" }}>
        <Image
          source={{ uri: coverImage }}
          style={{ width: "100%", height: "100%" }}
          resizeMode="cover"
        />
      </View>

      {/* Avatar */}
      <View
        style={{
          marginTop: -(AVATAR_SIZE / 2),
          paddingHorizontal: AVATAR_LEFT,
        }}
      >
        <View
          style={{
            width: AVATAR_SIZE,
            height: AVATAR_SIZE,
            borderRadius: AVATAR_SIZE / 2,
            borderWidth: 3,
            borderColor: "#ec4899",
            backgroundColor: "#7c3aed",
            overflow: "hidden",
          }}
        >
          {avatar ? (
            <Image source={{ uri: avatar }} style={{ width: "100%", height: "100%" }} />
          ) : (
            <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
              <Text style={{ color: "white", fontSize: 36, fontWeight: "bold" }}>
                {name.charAt(0).toUpperCase()}
              </Text>
            </View>
          )}
        </View>

        {/* Name + online status */}
        <Text style={{ color: "white", fontSize: 20, fontWeight: "bold", marginTop: 10 }}>
          {name}
        </Text>
        <View style={{ flexDirection: "row", alignItems: "center", marginTop: 4, gap: 6 }}>
          <View
            style={{
              width: 9,
              height: 9,
              borderRadius: 5,
              backgroundColor: isOnline ? "#22c55e" : "#6b7280",
            }}
          />
          <Text style={{ color: isOnline ? "#22c55e" : "#6b7280", fontSize: 13 }}>
            {isOnline ? "En línea" : "Desconectada"}
          </Text>
        </View>
      </View>
    </View>
  );
}
