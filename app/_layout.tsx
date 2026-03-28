import "../global.css";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { View } from "react-native";
import { AuthProvider } from "../src/context/AuthContext";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { usePreventScreenCapture } from "expo-screen-capture";

export default function Layout() {
  const insets = useSafeAreaInsets();
  usePreventScreenCapture();
  return (

      <AuthProvider>
        <View className="flex-1 bg-black" style={{ paddingBottom: insets.bottom, backgroundColor:'black' }}>
          <StatusBar style="light" />
          <Stack screenOptions={{ headerShown: false }} />
        </View>
      </AuthProvider>


  );
}
