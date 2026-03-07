import { View } from "react-native";
import type { ReactNode } from "react";

type ScreenProps = {
  children: ReactNode;
  className?: string;
  pad?: boolean;
};

export default function Screen({
  children,
  className = "",
  pad = true,
}: ScreenProps) {
  return (
    <View className={`flex-1 ${pad ? "px-6" : ""} ${className} bg-black`}>
      {children}
    </View>
  );
}
