import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import OnboardingFrame from "../../components/OnboardingFrame";

export default function Onboarding1() {
  return (
    <OnboardingFrame
      step={0}
      title="Chat Privado"
      description="Conecta de manera segura y directa con tus anfitrionas favoritas."
      descriptionClassName="text-xl"
      icon={<Ionicons name="chatbubbles-outline" size={150} color="white" />}
      onSkip={() => router.replace("/(auth)/choose-access")}
      onNext={() => router.push("/(onboarding)/onboarding2")}
    />
  );
}
