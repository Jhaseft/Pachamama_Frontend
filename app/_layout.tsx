import "../global.css";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { View } from "react-native";
import { AuthProvider } from "../src/context/AuthContext";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { usePreventScreenCapture } from "expo-screen-capture";
import { ActiveChatProvider } from '../src/context/ActiveChatContext';
import Toast from "react-native-toast-message";
import { toastConfig } from '../src/components/ToastConfig';

export default function Layout() {
  const insets = useSafeAreaInsets();
  usePreventScreenCapture();
  return (
      <AuthProvider>
        <ActiveChatProvider>
          <View className="flex-1 bg-black" style={{ backgroundColor: 'black' }}>
            <StatusBar style="light" />
            <Stack screenOptions={{ headerShown: false }} />
            <Toast config={toastConfig} />
          </View>
        </ActiveChatProvider>
      </AuthProvider>
  );
}
