import { TouchableOpacity, Text, View } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";

type Props = {
  label: string;
  onPress: () => void;
  /** Oculta el separador inferior en el último item de la sección */
  isLast?: boolean;
};

export default function ProfileMenuItem({ label, onPress, isLast }: Props) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      style={{
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 20,
        paddingVertical: 17,
        borderBottomWidth: isLast ? 0 : 1,
        borderBottomColor: "#27272a",
      }}
    >
      <Text style={{ color: "white", fontSize: 15, fontWeight: "500" }}>
        {label}
      </Text>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
        <MaterialCommunityIcons name="arrow-right" size={18} color="#e11d48" />
      </View>
    </TouchableOpacity>
  );
}
