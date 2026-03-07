import { View, Pressable, Text } from "react-native";
import { useRouter, usePathname } from "expo-router";
import { Home, MessageCircle,  User,  Gem, CircleDollarSign } from "lucide-react-native";

type Role = "anfitriona" | "cliente";

const tabsByRole = {
  cliente: [
    { name: "index", title: "Inicio", icon: Home },
    { name: "chats", title: "Chats", icon: MessageCircle },
    { name: "credito", title: "Créditos", icon: Gem },
    { name: "perfil", title: "Perfil", icon: User },
  ],

  anfitriona: [
    { name: "index", title: "Inicio", icon: Home },
    { name: "ganancias", title: "Ganancias", icon:  CircleDollarSign},
    { name: "chats", title: "Chat", icon: MessageCircle },
    { name: "perfil", title: "Perfil", icon: User },
  ],
};

const activeColor: Record<Role, string> = {
  anfitriona: "#D11B1B",
  cliente: "#D11B1B",
};

export default function BottomNav({ role }: { role: Role }) {
  const router = useRouter();
  const pathname = usePathname();

  const tabs = tabsByRole[role];
  const color = activeColor[role];

  const isActive = (tabName: string) => {
    if (tabName === "index") {
      return !tabs.some((t) => t.name !== "index" && pathname.endsWith(t.name));
    }
    return pathname.endsWith(tabName);
  };

  const handlePress = (tabName: string) => {
    if (tabName === "index") {
      router.push(`/(${role})` as any);
    } else {
      router.push(`/(${role})/${tabName}` as any);
    }
  };

  return (
    <View className="flex-row bg-black ">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const active = isActive(tab.name);

        return (
          <Pressable
            key={tab.name}
            onPress={() => handlePress(tab.name)}
            className="flex-1 items-center py-6"
          >
            <Icon
              size={30}
              color={active ? color : "#ffffff"}
            />

            <Text
              className={`text-[11px] mt-1 ${
                active ? "font-semibold" : "font-normal"
              }`}
              style={{ color: active ? color : "#ffffff" }}
            >
              {tab.title}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}