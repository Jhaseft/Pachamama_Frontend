import { View, StyleSheet } from "react-native";
import ProfileMenuItem from "./ProfileMenuItem";
import colors from "@/constants/colors";

export type MenuItemConfig = {
  label: string;
  onPress: () => void;
};

type Props = {
  items: MenuItemConfig[];
};

export default function ProfileMenuSection({ items }: Props) {
  return (
    <View style={styles.container}>
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

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(240,62,179,0.25)",
    overflow: "hidden",
    shadowColor: colors.secondary.DEFAULT,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
  },
});
