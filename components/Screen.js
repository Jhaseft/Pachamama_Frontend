import { SafeAreaView } from "react-native-safe-area-context";

export default function Screen({
  children,
  className = "",
  pad = true,
  edges = ["top", "bottom"],
}) {
  return (
    <SafeAreaView
      edges={edges}
      className={`flex-1 ${pad ? "px-6" : ""} ${className} bg-black`}
    >
      {children}
    </SafeAreaView>
  );
}
