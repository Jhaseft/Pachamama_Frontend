import { View, ActivityIndicator } from "react-native";
import { Redirect } from "expo-router";
import { useAuth } from "../src/context/AuthContext";

export default function Home() {
  const { user, isHydrated } = useAuth();

  if (!isHydrated) {
    return (
      <View style={{ flex: 1, backgroundColor: "black", alignItems: "center", justifyContent: "center" }}>
        <ActivityIndicator size="large" color="#A11213" />
      </View>
    );
  }

  if (user) {
    if (user.role === "ADMIN") return <Redirect href="/admin" />;
    if (user.role === "ANFITRIONA") return <Redirect href="/(anfitriona)" />;
    return <Redirect href="/(cliente)" />;
  }

  return <Redirect href="/(onboarding)/splash" />;
}
