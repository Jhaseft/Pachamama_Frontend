import { Pressable, Text, View } from "react-native";

type SecondaryAccessLinksProps = {
  onHostessPress: () => void;
  onAdminPress: () => void;
};

export default function SecondaryAccessLinks({
  onHostessPress,
  onAdminPress,
}: SecondaryAccessLinksProps) {
  return (
    <View className="flex-row items-center justify-center mt-7 gap-4">
      <Pressable
        onPress={onHostessPress}
        style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
        className="px-6 py-4 rounded-2xl border border-white/15 bg-white/5"
      >
        <Text className="text-white font-bold text-[20px] text-center">Soy creador de contenido</Text>
      </Pressable>

      <Pressable
        onPress={onAdminPress}
        style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
        className="px-6 py-4 rounded-2xl border border-white/15 bg-white/5"
      >
        <Text className="text-white font-bold text-[20px] text-center">Admin</Text>
      </Pressable>
    </View>
  );
}
