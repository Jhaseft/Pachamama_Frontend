import { useUnlockImage } from "@/src/hooks/useUnlockImage";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  Modal,
  Pressable,
  Text,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import colors from "@/constants/colors";

type PrivateImage = { id: string; imageUrl: string; unlockCredits: number | null };

export default function DesbloquearScreen() {
  const { id, images: imagesParam, anfitrionaName } = useLocalSearchParams<{
    id: string;
    images: string;
    anfitrionaName: string;
  }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const { unlockImage, unlockingImageId } = useUnlockImage();

  const [images] = useState<PrivateImage[]>(
    imagesParam ? JSON.parse(imagesParam) : []
  );
  const [unlockedIds, setUnlockedIds] = useState<Set<string>>(new Set());
  const [pendingImage, setPendingImage] = useState<PrivateImage | null>(null);

  const CELL_SIZE = (width - 4) / 3;
  const lockedCount = images.filter((img) => !unlockedIds.has(img.id)).length;

  const confirmUnlock = () => {
    if (!pendingImage) return;
    const img = pendingImage;
    setPendingImage(null);
    unlockImage(id!, img.id, () => {
      setUnlockedIds((prev) => new Set(prev).add(img.id));
    });
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.surface.DEFAULT }}>
      <Stack.Screen options={{ headerShown: false }} />

      {/* Header */}
      <View
        style={{
          paddingTop: insets.top + 8,
          paddingBottom: 12,
          paddingHorizontal: 16,
          flexDirection: "row",
          alignItems: "center",
          borderBottomWidth: 1,
          borderBottomColor: "rgba(255,255,255,0.08)",
        }}
      >
        <TouchableOpacity onPress={() => router.back()} style={{ marginRight: 12 }}>
          <MaterialCommunityIcons name="arrow-left" size={24} color="white" />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={{ color: "white", fontWeight: "800", fontSize: 16 }}>
            Álbum Exclusivo
          </Text>
          <Text style={{ color: "rgba(255,255,255,0.45)", fontSize: 12 }}>
            {anfitrionaName} · {lockedCount} foto{lockedCount !== 1 ? "s" : ""} bloqueada{lockedCount !== 1 ? "s" : ""}
          </Text>
        </View>
        <MaterialCommunityIcons name="crown" size={22} color={colors.secondary.DEFAULT} />
      </View>

      {/* Grid */}
      <FlatList
        data={images}
        keyExtractor={(item) => item.id}
        numColumns={3}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: insets.bottom + 16 }}
        renderItem={({ item }) => {
          const isUnlocked = unlockedIds.has(item.id);
          const isUnlocking = unlockingImageId === item.id;

          return (
            <TouchableOpacity
              onPress={() => !isUnlocked && !isUnlocking && setPendingImage(item)}
              disabled={isUnlocked || isUnlocking}
              activeOpacity={0.85}
              style={{ margin: 1, width: CELL_SIZE, height: CELL_SIZE }}
            >
              <Image
                source={{ uri: item.imageUrl }}
                style={{ width: "100%", height: "100%", opacity: isUnlocked ? 1 : 0.25 }}
                blurRadius={isUnlocked ? 0 : 12}
                resizeMode="cover"
              />

              {!isUnlocked && (
                <View style={{
                  position: "absolute",
                  top: 0, bottom: 0, left: 0, right: 0,
                  alignItems: "center", justifyContent: "center",
                }}>
                  {isUnlocking ? (
                    <ActivityIndicator size="small" color="white" />
                  ) : (
                    <>
                      <MaterialCommunityIcons name="lock" size={22} color="rgba(255,255,255,0.85)" />
                      {item.unlockCredits != null && (
                        <Text style={{ color: colors.secondary.DEFAULT, fontSize: 10, fontWeight: "700", marginTop: 4 }}>
                          {item.unlockCredits} cr
                        </Text>
                      )}
                    </>
                  )}
                </View>
              )}

              {isUnlocked && (
                <View style={{
                  position: "absolute", top: 6, right: 6,
                  backgroundColor: "rgba(34,197,94,0.85)",
                  borderRadius: 10, padding: 3,
                }}>
                  <MaterialCommunityIcons name="check" size={12} color="white" />
                </View>
              )}
            </TouchableOpacity>
          );
        }}
      />

      {/* Modal de confirmación */}
      <Modal
        visible={!!pendingImage}
        transparent
        animationType="fade"
        onRequestClose={() => setPendingImage(null)}
      >
        <Pressable
          style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.75)", justifyContent: "center", alignItems: "center", padding: 24 }}
          onPress={() => setPendingImage(null)}
        >
          <Pressable onPress={() => {}} style={{
            backgroundColor: colors.surface.card,
            borderRadius: 20,
            overflow: "hidden",
            width: "100%",
            maxWidth: 340,
          }}>
            {/* Preview borrosa */}
            {pendingImage && (
              <View style={{ height: 180, position: "relative" }}>
                <Image
                  source={{ uri: pendingImage.imageUrl }}
                  style={{ width: "100%", height: "100%", opacity: 0.25 }}
                  blurRadius={14}
                  resizeMode="cover"
                />
                <View style={{
                  position: "absolute", top: 0, bottom: 0, left: 0, right: 0,
                  alignItems: "center", justifyContent: "center",
                }}>
                  <View style={{
                    backgroundColor: "rgba(0,0,0,0.5)",
                    borderRadius: 999, padding: 14,
                  }}>
                    <MaterialCommunityIcons name="lock-open-outline" size={32} color={colors.secondary.DEFAULT} />
                  </View>
                </View>
              </View>
            )}

            {/* Texto */}
            <View style={{ padding: 20, gap: 6 }}>
              <Text style={{ color: "white", fontWeight: "800", fontSize: 17, textAlign: "center" }}>
                ¿Desbloquear foto?
              </Text>
              <Text style={{ color: "rgba(255,255,255,0.5)", fontSize: 13, textAlign: "center" }}>
                Se descontarán{" "}
                <Text style={{ color: colors.secondary.DEFAULT, fontWeight: "700" }}>
                  {pendingImage?.unlockCredits ?? "?"} créditos
                </Text>{" "}
                de tu saldo.
              </Text>
            </View>

            {/* Botones */}
            <View style={{ flexDirection: "row", borderTopWidth: 1, borderTopColor: colors.surface.border }}>
              <TouchableOpacity
                onPress={() => setPendingImage(null)}
                style={{ flex: 1, paddingVertical: 16, alignItems: "center", borderRightWidth: 1, borderRightColor: colors.surface.border }}
              >
                <Text style={{ color: "#9ca3af", fontWeight: "600", fontSize: 15 }}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={confirmUnlock}
                style={{ flex: 1, paddingVertical: 16, alignItems: "center" }}
              >
                <Text style={{ color: colors.secondary.DEFAULT, fontWeight: "800", fontSize: 15 }}>Desbloquear</Text>
              </TouchableOpacity>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}
