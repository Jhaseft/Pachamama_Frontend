import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import OnboardingFrame from "../../components/OnboardingFrame";

export default function Onboarding3() {
  return (
    <OnboardingFrame
      step={2}
      title="Sistema de Creditos"
      description="Gana creditos y canjealos dentro de la plataforma."
      icon={<Ionicons name="wallet-outline" size={96} color="white" />}
      onSkip={() => router.replace("/(auth)/choose-access")}
      onNext={() => router.replace("/(auth)/choose-access")}
    />
  );
}