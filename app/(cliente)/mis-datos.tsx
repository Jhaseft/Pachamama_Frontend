import { View, Text } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import ScreenHeader from "@/components/Menu/ScreenHeader";
import { useAuth } from "@/src/context/AuthContext";

export default function MisDatos() {
  const { user } = useAuth();
  const insets = useSafeAreaInsets();

  const rows = [
    { label: "Teléfono", value: user?.phoneNumber ?? "—" },
    { label: "Nombre", value: [user?.firstName, user?.lastName].filter(Boolean).join(" ") || "—" },
    { label: "Email", value: user?.email ?? "—" },
  ];

  return (
    <View style={{ flex: 1, backgroundColor: "#0f0f0f" }}>
      <ScreenHeader title="Mis datos" role="cliente" showBackButton />

      <View
        style={{
          margin: 16,
          backgroundColor: "#141414",
          borderRadius: 16,
          borderWidth: 1,
          borderColor: "#27272a",
          overflow: "hidden",
        }}
      >
        {rows.map((row, i) => (
          <View
            key={row.label}
            style={{
              paddingHorizontal: 20,
              paddingVertical: 16,
              borderBottomWidth: i < rows.length - 1 ? 1 : 0,
              borderBottomColor: "#27272a",
            }}
          >
            <Text style={{ color: "#9ca3af", fontSize: 12, marginBottom: 4 }}>
              {row.label}
            </Text>
            <Text style={{ color: "white", fontSize: 15, fontWeight: "500" }}>
              {row.value}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}
