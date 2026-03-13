import { Stack } from "expo-router";
import HeaderTitle from "@/components/Menu/HeaderTitle";

type Role = "anfitriona" | "cliente";

type Props = {
  title: string;
  role: Role;

  showBackButton?: boolean;

  backgroundColor?: string;
};

export default function ScreenHeader({
  title,
  role,
  showBackButton = false,
  backgroundColor = "black",
}: Props) {
  return (
    <Stack.Screen
      options={{
        headerShown: true,
        headerBackVisible: showBackButton,
        headerTitleAlign: "left",

        headerTitle: () => (
          <HeaderTitle
            title={title}
            role={role}
          />
        ),

        headerStyle: {
          backgroundColor,
        },

        headerShadowVisible: false,
      }}
    />
  );
}