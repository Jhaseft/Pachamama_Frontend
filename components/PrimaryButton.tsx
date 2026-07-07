import { Pressable, Text, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import type { PressableProps } from "react-native";

type PrimaryButtonProps = {
  title: string;
  onPress?: PressableProps["onPress"];
  disabled?: boolean;
  className?: string;
};

export default function PrimaryButton({
  title,
  onPress,
  disabled = false,
  className = "",
}: PrimaryButtonProps) {
  return (
    <LinearGradient
      colors={['#f03eb3', '#a844f2']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={{
        borderRadius: 24,
        marginTop: 16,
        opacity: disabled ? 0.5 : 1,
      }}
    >
      <Pressable
        onPress={onPress}
        disabled={disabled}
        style={{ paddingVertical: 14, alignItems: 'center' }}
      >
        <Text className="text-white text-base font-black tracking-wide">{title.toUpperCase()}</Text>
      </Pressable>
    </LinearGradient>
  );
}
