import { View, Text, TouchableOpacity } from "react-native";
import ScreenHeader from "@/components/Menu/ScreenHeader";
import { useAuth } from "@/src/context/AuthContext";
import { useRouter } from "expo-router";
import { Bookmark, ChevronRight } from "lucide-react-native";

export default function MisDatos() {
  const { user } = useAuth();
  const router = useRouter();

  const rows = [
    { label: "Teléfono", value: user?.phoneNumber ?? "—" },
    { label: "Nombre", value: [user?.firstName, user?.lastName].filter(Boolean).join(" ") || "—" },
    { label: "Email", value: user?.email ?? "—" },
  ];

  return (
    <View className="flex-1 bg-[#0f0f0f]">
      <ScreenHeader title="Mis datos" role="cliente" showBackButton />

      <View className="mx-4 mt-4 bg-[#141414] rounded-2xl border border-zinc-800 overflow-hidden">
        {rows.map((row, i) => (
          <View
            key={row.label}
            className={`px-5 py-4 ${i < rows.length - 1 ? "border-b border-zinc-800" : ""}`}
          >
            <Text className="text-zinc-400 text-xs mb-1">{row.label}</Text>
            <Text className="text-white text-[15px] font-medium">{row.value}</Text>
          </View>
        ))}
      </View>

      <TouchableOpacity
        onPress={() => router.push("/(cliente)/favorites" as any)}
        activeOpacity={0.8}
        className="mx-4 mt-3 flex-row items-center gap-4 rounded-2xl border border-pink-700 bg-[#150a24] px-5 py-4"
        style={{ shadowColor: "#a844f2", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0, shadowRadius: 10, elevation: 6 }}
      >
        <View className="w-10 h-10 bg-pink-500/10 items-center justify-center" style={{ borderRadius: 14 }}>
          <Bookmark size={20} color="#f03eb3" fill="#f03eb3" />
        </View>
        <View className="flex-1">
          <Text className="text-white font-bold text-[15px] tracking-wide">Mis favoritas</Text>
          <Text className="text-pink-400 text-xs mt-0.5">Anfitrionas guardadas</Text>
        </View>
        <ChevronRight size={18} color="#f03eb3" />
      </TouchableOpacity>
    </View>
  );
}
