import { View } from "react-native";
import ProfileMenuItem from "./ProfileMenuItem";

export type MenuItemConfig = {
  label: string;
  onPress: () => void;
};

type Props = {
  items: MenuItemConfig[];
};

/**
 * Card de sección con múltiples items de navegación.
 * Renderiza los items separados por divisores, sin borde en el último.
 */
export default function ProfileMenuSection({ items }: Props) {
  return (
    <View
      style={{
        backgroundColor: "#141414",
        borderRadius: 16,
        borderWidth: 1,
        borderColor: "#27272a",
        overflow: "hidden",
      }}
    >
      {items.map((item, i) => (
        <ProfileMenuItem
          key={item.label}
          label={item.label}
          onPress={item.onPress}
          isLast={i === items.length - 1}
        />
      ))}
    </View>
  );
}
