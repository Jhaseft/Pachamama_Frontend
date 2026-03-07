import { useEffect } from "react";
import { Image } from "react-native";
import { router } from "expo-router";
import Screen from "../../components/Screen";

const logoSplash = require("../../assets/logosplash.png");

export default function Splash() {
  useEffect(() => {
    const timer = setTimeout(() => {
      router.replace("/(onboarding)/onboarding1");
    }, 1200);

    return () => clearTimeout(timer);
  }, []);

  return (
    <Screen pad={false} className="items-center justify-center">
      <Image source={logoSplash} className="w-40 h-40" resizeMode="contain" />
    </Screen>
  );
}