import React from "react";
import { View, TouchableOpacity } from "react-native";
import { Ionicons, FontAwesome5 } from "@expo/vector-icons";
import { Link } from "expo-router";

interface Props {
  href?: string; // ruta a donde navegar
  onPress?: () => void; // acción alternativa
  icon?: keyof typeof FontAwesome5.glyphMap;
  smallIcon?: keyof typeof Ionicons.glyphMap;
  iconColor?: string;
  smallIconColor?: string;
}

export default function ActionIconButton({
  href,
  onPress,
  icon = "credit-card",
  smallIcon = "add-circle",
  iconColor = "#4A90E2",
  smallIconColor = "white",
}: Props) {
  const ButtonContent = (
    <View className="relative p-1">
      <FontAwesome5 name={icon} size={34} color={iconColor} />

      <View className="absolute -bottom-1 -left-1 bg-green-500 rounded-full border border-black">
        <Ionicons name={smallIcon} size={16} color={smallIconColor} />
      </View>
    </View>
  );

  if (href) {
    return (
      <Link href={href} asChild>
        <TouchableOpacity activeOpacity={0.7}>
          {ButtonContent}
        </TouchableOpacity>
      </Link>
    );
  }

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
      {ButtonContent}
    </TouchableOpacity>
  );
};