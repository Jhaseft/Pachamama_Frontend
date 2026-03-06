import "../global.css";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { View } from "react-native";

export default function Layout() {
  return (
    <View className="flex-1 mt-6 ">
      <StatusBar style="dark" />
      <Stack />
    </View>
  );
}
