import { Pressable, Text, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import type { PressableProps } from "react-native";
import colors from "../constants/colors";
 
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
    // El View contenedor (collapsable={false}) absorbe el reparenting que hace
    // react-native-screens durante las transiciones, evitando el crash de
    // expo-linear-gradient en la Nueva Arquitectura ("child already has a parent").
    <View
      collapsable={false}
      style={{ marginTop: 16, borderRadius: 24, overflow: "hidden", opacity: disabled ? 0.5 : 1 }}
    >
      <LinearGradient
        colors={[colors.secondary.pink, colors.primary.purple]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{ borderRadius: 24 }}
      >
        <Pressable
          onPress={onPress}
          disabled={disabled}
          style={{ paddingVertical: 14, alignItems: 'center' }}
        >
          <Text className="text-white text-base font-black tracking-wide">{title.toUpperCase()}</Text>
        </Pressable>
      </LinearGradient>
    </View>
  );
}
