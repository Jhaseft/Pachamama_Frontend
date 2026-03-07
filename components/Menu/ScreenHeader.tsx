import HeaderTitle from "@/components/Menu/HeaderTitle";
import { Stack } from "expo-router";

type Role = "anfitriona" | "cliente"

type Props = {
  title: string;
  role:Role;
};

export default function ScreenHeader({ title,role }: Props) {
  return (
    <Stack.Screen
      options={{
        headerTitle: () => <HeaderTitle title={title} role={role} />,
        headerBackVisible: false,
        headerTitleAlign: "left",
        headerStyle: {
          backgroundColor: "black",
        },
      }}
    />
  );
}
