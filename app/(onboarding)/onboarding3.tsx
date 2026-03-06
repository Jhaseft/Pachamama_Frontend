import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import OnboardingFrame from "../../components/OnboardingFrame";

export default function Onboarding3() {
  return (
    <OnboardingFrame
      step={2}
      title="Sistema de Creditos"
      description="Adquiere creditos fácilmente para acceder a contenido exclusivo."
      descriptionClassName="text-lg"
      icon={<Ionicons name="wallet-outline" size={150} color="white" />}
      onSkip={() => router.replace("/(auth)/choose-access")}
      onNext={() => router.replace("/(auth)/choose-access")}
    />
  );
}
