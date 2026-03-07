import { SafeAreaView } from "react-native-safe-area-context";
import type { ReactNode } from "react";
import type { Edge } from "react-native-safe-area-context";

type ScreenProps = {
  children: ReactNode;
  className?: string;
  pad?: boolean;
  edges?: Edge[];
};

export default function Screen({
  children,
  className = "",
  pad = true,
  edges = ["top", "bottom"],
}: ScreenProps) {
  return (
    <SafeAreaView
      edges={edges}
      className={`flex-1 ${pad ? "px-6" : ""} ${className} bg-black`}
    >
      {children}
    </SafeAreaView>
  );
}
