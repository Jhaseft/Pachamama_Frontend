import "../global.css";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Alert, BackHandler, View } from "react-native";
import { AuthProvider } from "../src/context/AuthContext";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { usePreventScreenCapture } from "expo-screen-capture";
import { ActiveChatProvider } from '../src/context/ActiveChatContext';
import Toast from "react-native-toast-message";
import { toastConfig } from '../src/components/ToastConfig';
import { useEffect } from "react";
import VersionGuard from "../src/components/VersionGuard";

function BackHandlerGuard() {
  useEffect(() => {
    const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
      Alert.alert(
        '¿Salir de Pachamama?',
        '¿Seguro que quieres salir de la aplicación?',
        [
          { text: 'Cancelar', style: 'cancel', onPress: () => {} },
          { text: 'Salir', style: 'destructive', onPress: () => BackHandler.exitApp() },
        ],
        { cancelable: true }
      );
      return true; // bloquea el comportamiento por defecto
    });
    return () => subscription.remove();
  }, []);
  return null;
}

export default function Layout() {
  const insets = useSafeAreaInsets();
  usePreventScreenCapture();
  return (
    <VersionGuard>
      <AuthProvider>
        <ActiveChatProvider>
          <BackHandlerGuard />
          <View className="flex-1 bg-black" style={{ backgroundColor: 'black' }}>
            <StatusBar style="light" />
            <Stack screenOptions={{ headerShown: false }} />
            <Toast config={toastConfig} />
          </View>
        </ActiveChatProvider>
      </AuthProvider>
    </VersionGuard>
  );
}
