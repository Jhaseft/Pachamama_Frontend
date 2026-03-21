import { TouchableOpacity, Text, View } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";

type Props = {
  onPress: () => void;
};

/**
 * Botón de cierre de sesión con icono de diamante.
 * Coincide con el diseño del mock: rojo, full-width, borde redondeado.
 */
export default function LogoutButton({ onPress }: Props) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.85}
      style={{
        backgroundColor: "#b91c1c",
        borderRadius: 16,
        paddingVertical: 16,
        paddingHorizontal: 24,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 10,
      }}
    >
      <Text
        style={{
          color: "white",
          fontSize: 16,
          fontWeight: "700",
          letterSpacing: 0.3,
        }}
      >
        Cerrar sesion
      </Text>
      
    </TouchableOpacity>
  );
}
