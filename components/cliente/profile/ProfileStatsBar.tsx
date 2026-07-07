import { Text, View } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import colors from "@/constants/colors";

type Props = {
  likesCount: number;
  rateCredits: number | null;
};

export default function ProfileStatsBar({ likesCount, rateCredits }: Props) {
  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        gap: 20,
        marginTop: 12,
      }}
    >
      <View style={{ flexDirection: "row", alignItems: "center", gap: 5 }}>
        <MaterialCommunityIcons name="heart" size={15} color={colors.secondary.DEFAULT} />
        <Text style={{ color: colors.secondary.DEFAULT, fontSize: 13, fontWeight: "600" }}>
          {likesCount}
        </Text>
        <Text style={{ color: "#6b7280", fontSize: 13 }}>likes</Text>
      </View>

      {rateCredits != null && rateCredits > 0 && (
        <View style={{ flexDirection: "row", alignItems: "center", gap: 5 }}>
          <MaterialCommunityIcons name="diamond-stone" size={15} color={colors.primary.purple} />
          <Text style={{ color: colors.primary.purple, fontSize: 13, fontWeight: "600" }}>
            {rateCredits}
          </Text>
          <Text style={{ color: "#6b7280", fontSize: 13 }}>créditos/chat</Text>
        </View>
      )}
    </View>
  );
}
