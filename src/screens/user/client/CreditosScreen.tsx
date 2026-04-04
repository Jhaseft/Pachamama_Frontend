import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  Pressable,
  ActivityIndicator,
  Modal,
  Linking,
  StyleSheet,
  Dimensions,
} from "react-native";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const GRID_GAP = 8;
const GRID_PADDING = 16;
// 3 cards per row: total width - 2 paddings - 2 gaps between 3 cards
const CARD_WIDTH = (SCREEN_WIDTH - GRID_PADDING * 2 - GRID_GAP * 2) / 3;
import { LinearGradient } from "expo-linear-gradient";
import { Gem, X, Diamond } from "lucide-react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { apiGetAllPackages } from "@/src/api/package";
import { PackageData } from "@/src/types/package";
import { apiGetMyWallet, WalletResponse } from "@/src/api/userClient";

const WEB_URL = "https://caja-negra-pacha-web.wkhbmg.easypanel.host";

const BADGES = ["¡OFERTA!", "MEJOR OFERTA", "+ BONO"];

export default function CreditosScreen() {
  const [packages, setPackages] = useState<PackageData[]>([]);
  const [loading, setLoading] = useState(true);
  const [wallet, setWallet] = useState<WalletResponse | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    void loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [packagesData, walletData] = await Promise.all([
        apiGetAllPackages(),
        apiGetMyWallet(),
      ]);
      setPackages(packagesData);
      setWallet(walletData);
    } catch (error) {
      console.error("Error cargando créditos:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenWeb = () => {
    setModalVisible(false);
    void Linking.openURL(WEB_URL);
  };

  return (
    <View style={styles.root}>
      <LinearGradient
        colors={["#1a0000", "#0a0000", "#0d0000"]}
        style={StyleSheet.absoluteFill}
        pointerEvents="none"
      />

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {/* Balance pill */}
        <View style={styles.balancePill}>
          <Gem color="#60d4f7" size={30} strokeWidth={1.5} fill="#a8edfb" />
          <Text style={styles.balanceText}>{wallet?.balance ?? 0}</Text>
        </View>

        {/* Section title */}
        <View style={styles.sectionHeader}>
          <View style={styles.dividerLine} />
          <Text style={styles.sectionTitle}>¡Compra Créditos!</Text>
          <View style={styles.dividerLine} />
        </View>

        {/* Package cards grid */}
        {loading ? (
          <ActivityIndicator
            color="#F6C16A"
            size="large"
            style={{ marginTop: 32 }}
          />
        ) : (
          <View style={styles.grid}>
            {packages.map((item, index) => {
              const isHighlight = index % 3 === 1;
              const badge = BADGES[index % 3] ?? `Pack ${index + 1}`;
              return (
                <View
                  key={item.id ?? index}
                  style={[styles.card, isHighlight && styles.cardHighlight]}
                >
                  {/* Badge */}
                  <View
                    style={[
                      styles.badge,
                      isHighlight && styles.badgeHighlight,
                    ]}
                  >
                    <Text style={styles.badgeText}>{badge}</Text>
                  </View>

                  {/* Credits amount */}
                  <Text style={styles.cardCredits} numberOfLines={1} adjustsFontSizeToFit>
                    {item.credits.toLocaleString()}
                  </Text>
                  <Text style={styles.cardCreditsLabel}>créditos</Text>

                  {/* Price */}
                  <Text style={styles.cardPrice}>Soles/{item.price}</Text>

                  {/* Divider */}
                  <View style={styles.cardDivider} />

                  {/* Diamond + credits */}
                  <View style={styles.cardBonus}>
                    <Diamond size={11} color="#F6C16A" fill="#F6C16A" />
                    <Text style={styles.cardBonusText} numberOfLines={1}>
                      {" "}{item.credits.toLocaleString()}
                    </Text>
                  </View>

                  {/* Buy button */}
                  <Pressable
                    style={({ pressed }) => [
                      styles.buyBtn,
                      pressed && { opacity: 0.75 },
                    ]}
                    onPress={() => setModalVisible(true)}
                  >
                    <Text style={styles.buyBtnText}>Comprar</Text>
                  </Pressable>
                </View>
              );
            })}
          </View>
        )}

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Modal */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Pressable
              style={styles.modalClose}
              onPress={() => setModalVisible(false)}
            >
              <X color="#F6C16A" size={20} />
            </Pressable>

            <Gem
              color="#F6C16A"
              size={48}
              fill="rgba(246,193,106,0.15)"
              strokeWidth={1.5}
            />

            <Text style={styles.modalTitle}>Comprar créditos</Text>
            <Text style={styles.modalBody}>
              Puedes adquirir tus créditos desde nuestra plataforma web.{"\n"}
              Serás redirigido para completar tu compra de forma rápida y
              segura.
            </Text>

            <Pressable
              style={({ pressed }) => [
                styles.modalBtn,
                pressed && { opacity: 0.8 },
              ]}
              onPress={handleOpenWeb}
            >
              <Text style={styles.modalBtnText}>Ir a comprar</Text>
            </Pressable>

            <Pressable onPress={() => setModalVisible(false)}>
              <Text style={styles.modalCancel}>Cancelar</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#0a0000",
  },
  scroll: {
    paddingHorizontal: 16,
    paddingTop: 20,
  },

  // Balance pill
  balancePill: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "center",
    borderWidth: 1.5,
    borderColor: "#F6C16A",
    borderRadius: 32,
    paddingVertical: 12,
    paddingHorizontal: 36,
    gap: 12,
    marginBottom: 24,
    backgroundColor: "rgba(246,193,106,0.05)",
    shadowColor: "#F6C16A",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 4,
  },
  balanceText: {
    color: "white",
    fontSize: 40,
    fontWeight: "800",
  },

  // Section header
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
    gap: 10,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: "rgba(246,193,106,0.3)",
  },
  sectionTitle: {
    color: "#F6C16A",
    fontSize: 17,
    fontWeight: "800",
  },

  // Grid
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: GRID_GAP,
    marginBottom: 28,
  },
  card: {
    width: CARD_WIDTH,
    backgroundColor: "#1a0208",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(246,193,106,0.35)",
    paddingVertical: 10,
    paddingHorizontal: 8,
    alignItems: "center",
    gap: 4,
    shadowColor: "#F6C16A",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 3,
    overflow: "hidden",
  },
  cardHighlight: {
    borderColor: "#F6C16A",
    borderWidth: 1.5,
    shadowOpacity: 0.35,
    backgroundColor: "#200a10",
  },

  // Badge
  badge: {
    backgroundColor: "rgba(246,193,106,0.12)",
    borderRadius: 6,
    paddingVertical: 3,
    paddingHorizontal: 4,
    marginBottom: 4,
    alignSelf: "stretch",
    alignItems: "center",
  },
  badgeHighlight: {
    backgroundColor: "rgba(246,193,106,0.25)",
  },
  badgeText: {
    color: "#F6C16A",
    fontSize: 9,
    fontWeight: "800",
    textAlign: "center",
  },

  // Card content
  cardCredits: {
    color: "#F6C16A",
    fontSize: 24,
    fontWeight: "900",
    textAlign: "center",
  },
  cardCreditsLabel: {
    color: "rgba(246,193,106,0.65)",
    fontSize: 10,
    fontWeight: "600",
  },
  cardPrice: {
    color: "white",
    fontSize: 12,
    fontWeight: "700",
    marginTop: 2,
  },
  cardDivider: {
    height: 1,
    backgroundColor: "rgba(246,193,106,0.2)",
    alignSelf: "stretch",
    marginVertical: 4,
  },
  cardBonus: {
    flexDirection: "row",
    alignItems: "center",
  },
  cardBonusText: {
    color: "rgba(255,255,255,0.55)",
    fontSize: 10,
  },

  // Buy button
  buyBtn: {
    borderRadius: 20,
    paddingVertical: 7,
    paddingHorizontal: 10,
    marginTop: 6,
    alignSelf: "stretch",
    alignItems: "center",
    backgroundColor: "#C0281C",
    borderWidth: 1,
    borderColor: "#E03525",
    shadowColor: "#D11B1B",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.6,
    shadowRadius: 6,
    elevation: 4,
  },
  buyBtnText: {
    color: "white",
    fontSize: 11,
    fontWeight: "800",
  },

  // Recargar CTA
  recargarBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "center",
    borderRadius: 28,
    borderWidth: 1.5,
    borderColor: "#F6C16A",
    paddingVertical: 18,
    paddingHorizontal: 48,
    gap: 14,
    backgroundColor: "rgba(246,193,106,0.05)",
    shadowColor: "#F6C16A",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.35,
    shadowRadius: 14,
    elevation: 6,
  },
  recargarText: {
    color: "#F6C16A",
    fontSize: 22,
    fontWeight: "900",
  },

  // Modal
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.85)",
  },
  modalBox: {
    backgroundColor: "#1a0208",
    borderRadius: 24,
    marginHorizontal: 32,
    padding: 24,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(246,193,106,0.3)",
    width: "80%",
  },
  modalClose: {
    alignSelf: "flex-end",
    marginBottom: 8,
  },
  modalTitle: {
    color: "#F6C16A",
    fontSize: 20,
    fontWeight: "900",
    marginTop: 12,
    textAlign: "center",
  },
  modalBody: {
    color: "rgba(255,255,255,0.55)",
    fontSize: 13,
    textAlign: "center",
    marginTop: 10,
    lineHeight: 20,
  },
  modalBtn: {
    backgroundColor: "#D11B1B",
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 32,
    marginTop: 20,
    alignSelf: "stretch",
    alignItems: "center",
  },
  modalBtnText: {
    color: "white",
    fontWeight: "800",
    fontSize: 15,
  },
  modalCancel: {
    color: "rgba(255,255,255,0.4)",
    fontSize: 13,
    marginTop: 12,
  },
});
