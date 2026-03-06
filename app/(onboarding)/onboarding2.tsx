import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import OnboardingFrame from "../../components/OnboardingFrame";

export default function Onboarding2() {
  return (
    <OnboardingFrame
      step={1}
      title="Seguridad Total"
      description="Protegemos tu informacion y tus transacciones en todo momento."
      descriptionClassName="text-lg"
      icon={<Ionicons name="shield-checkmark-outline" size={96} color="white" />}
      onSkip={() => router.replace("/(auth)/choose-access")}
      onNext={() => router.push("/(onboarding)/onboarding3")}
    />
  );
}
