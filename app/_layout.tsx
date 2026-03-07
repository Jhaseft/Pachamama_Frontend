import "../global.css";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { View } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { AuthProvider } from "../src/context/AuthContext";

export default function Layout() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <View className="flex-1 bg-black">
          <StatusBar style="light" />
          <Stack screenOptions={{ headerShown: false }} />
        </View>
      </AuthProvider>
    </SafeAreaProvider>
  );
}
