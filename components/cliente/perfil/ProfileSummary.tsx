import { View, Text } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import type { User } from "@/src/services/auth";

type Props = {
  user: User;
};

/**
 * Bloque superior del perfil cliente.
 * Muestra avatar (icono) + teléfono y nombre si están disponibles.
 */
export default function ProfileSummary({ user }: Props) {
  const displayName = [user.firstName, user.lastName]
    .filter(Boolean)
    .join(" ") || null;

  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        gap: 16,
        backgroundColor: "#141414",
        borderRadius: 16,
        borderWidth: 1,
        borderColor: "#27272a",
        paddingHorizontal: 20,
        paddingVertical: 18,
      }}
    >
      {/* Avatar */}
      <View
        style={{
          width: 56,
          height: 56,
          borderRadius: 28,
          backgroundColor: "#27272a",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <MaterialCommunityIcons name="account" size={32} color="#9ca3af" />
      </View>

      {/* Datos */}
      <View style={{ flex: 1 }}>
        <Text style={{ color: "white", fontSize: 17, fontWeight: "700" }}>
          {user.phoneNumber}
        </Text>
        {displayName && (
          <Text style={{ color: "#9ca3af", fontSize: 13, marginTop: 2 }}>
            {displayName}
          </Text>
        )}
        {user.email && (
          <Text style={{ color: "#6b7280", fontSize: 12, marginTop: 1 }}>
            {user.email}
          </Text>
        )}
      </View>
    </View>
  );
}
