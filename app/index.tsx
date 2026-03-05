import { Stack } from "expo-router";
import { View, Text } from "react-native";
import { Redirect } from "expo-router";

export default function Home() {
  return (
    <Redirect href="/(onboarding)/splash" />
  );
}
