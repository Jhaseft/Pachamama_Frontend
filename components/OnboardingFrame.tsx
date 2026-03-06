import { View, Text, Pressable, Image } from "react-native";
import type { ReactNode } from "react";
import Screen from "./Screen";
import Dots from "./Dots";

const logo = require("../assets/logo.png");

type OnboardingFrameProps = {
  step: number;
  title: string;
  description: string;
  icon: ReactNode;
  descriptionClassName?: string;
  onSkip: () => void;
  onNext: () => void;
};

export default function OnboardingFrame({
  step,
  title,
  description,
  icon,
  descriptionClassName = "",
  onSkip,
  onNext,
}: OnboardingFrameProps) {
  return (
    <Screen className="pt-2">
      <View className="flex-row items-center justify-between mb-6">
        <Image source={logo} className="w-8 h-8" resizeMode="contain" />
        <Pressable onPress={onSkip}>
          <Text className="text-white font-bold text-xl">Saltar</Text>
        </Pressable>
      </View>

      <View className="flex-1 items-center justify-center">
        <View className="mb-6">{icon}</View>
        <Text className="text-white text-3xl font-semibold text-center mb-3">
          {title}
        </Text>
        <Text
          className={`text-white text-center text-base leading-6 ${descriptionClassName}`}
        >
          {description}
        </Text>
      </View>

      <View className="flex-row items-center justify-between mb-14">
        <Dots count={3} activeIndex={step} />
        <Pressable
          onPress={onNext}
          className="w-16 h-16 rounded-full bg-white items-center justify-center"
        >
          <Text className="text-black text-4xl">&gt;</Text>
        </Pressable>
      </View>
    </Screen>
  );
}
