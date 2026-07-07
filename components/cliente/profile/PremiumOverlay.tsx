import {
  ActivityIndicator,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import colors from "@/constants/colors";

type Props = {
  unlockCredits: number | null;
  isUnlocking: boolean;
  onUnlock: () => void;
  readOnly?: boolean;
};

/**
 * Overlay oscuro para imágenes premium bloqueadas.
 * Muestra candado, créditos requeridos y botón de desbloqueo.
 */
export default function PremiumOverlay({
  unlockCredits,
  isUnlocking,
  onUnlock,
  readOnly = false,
}: Props) {
  return (
    <View
      style={{
        flex: 1,
        backgroundColor: "#1a1a1a",
        alignItems: "center",
        justifyContent: "center",
        gap: 14,
      }}
    >
      {/* Círculo con candado */}
      <View
        style={{
          width: 90,
          height: 90,
          borderRadius: 45,
          backgroundColor: "#2a2a2a",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <MaterialCommunityIcons name="lock" size={44} color={colors.secondary.DEFAULT} />
      </View>

      <View style={{ alignItems: "center", gap: 8 }}>
        <Text style={{ color: "white", fontSize: 15, fontWeight: "700" }}>
          Foto exclusiva
        </Text>

        {/* Badge de créditos */}
        {unlockCredits != null && (
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 5,
              backgroundColor: "#2a2a2a",
              paddingHorizontal: 12,
              paddingVertical: 5,
              borderRadius: 999,
            }}
          >
            <MaterialCommunityIcons
              name="diamond-stone"
              size={13}
              color={colors.secondary.DEFAULT}
            />
            <Text style={{ color: colors.secondary.DEFAULT, fontSize: 13, fontWeight: "700" }}>
              {unlockCredits} créditos
            </Text>
          </View>
        )}

        {/* Botón de desbloqueo — oculto en modo preview */}
        {!readOnly && (
          <TouchableOpacity
            onPress={onUnlock}
            disabled={isUnlocking}
            activeOpacity={0.8}
            style={{
              marginTop: 4,
              backgroundColor: isUnlocking ? colors.primary.purple : colors.secondary.DEFAULT,
              paddingHorizontal: 18,
              paddingVertical: 9,
              borderRadius: 999,
              flexDirection: "row",
              alignItems: "center",
              gap: 6,
            }}
          >
            {isUnlocking ? (
              <>
                <ActivityIndicator size="small" color="white" />
                <Text style={{ color: "white", fontWeight: "700", fontSize: 13 }}>
                  Desbloqueando…
                </Text>
              </>
            ) : (
              <>
                <MaterialCommunityIcons name="lock-open" size={14} color="white" />
                <Text style={{ color: "white", fontWeight: "700", fontSize: 13 }}>
                  Desbloquear
                </Text>
              </>
            )}
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}
