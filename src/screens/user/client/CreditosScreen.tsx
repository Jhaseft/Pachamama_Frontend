import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  Pressable,
  ActivityIndicator,
  Modal,
  Alert,
  StyleSheet,
  Dimensions,
} from "react-native";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const GRID_COLS = 3;
const GRID_PADDING = 16; // paddingHorizontal del ScrollView
const GRID_GAP = 12;     // gap-3 = 12px
const CARD_WIDTH = (SCREEN_WIDTH - GRID_PADDING * 2 - GRID_GAP * (GRID_COLS - 1)) / GRID_COLS;

import { LinearGradient } from "expo-linear-gradient";
import { Gem, X } from "lucide-react-native";
import { WebView } from "react-native-webview";
import { apiGetAllPackages, apiFlowCreatePayment } from "@/src/api/package";
import { apiPaypalCreateOrder, apiPaypalCapture } from "@/src/api/paypal";
import { PackageData } from "@/src/types/package";
import { apiGetMyWallet, WalletResponse } from "@/src/api/userClient";
import { useCurrency } from "@/src/hooks/useCurrency";

const FLOW_RETURN_URL = "https://app.pachamama.chat/dashboard";
const PAYPAL_RETURN_URL = "https://app.pachamama.chat/paypal/return";
const PAYPAL_CANCEL_URL = "https://app.pachamama.chat/paypal/cancel";
const BADGES = ["¡OFERTA!", "MEJOR OFERTA", "+ BONO"];

export default function CreditosScreen() {

  const [packages, setPackages] = useState<PackageData[]>([]);
  const [loading, setLoading] = useState(true);
  const [wallet, setWallet] = useState<WalletResponse | null>(null);
  const [loadingPackageId, setLoadingPackageId] = useState<string | null>(null);
  const [webViewUrl, setWebViewUrl] = useState<string | null>(null);
  const [webViewVisible, setWebViewVisible] = useState(false);
  const [paypalOrderId, setPaypalOrderId] = useState<string | null>(null);
  const [capturing, setCapturing] = useState(false);
  const { symbol, rate, isPeru } = useCurrency();

  useEffect(() => { void loadData(); }, []);

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

  const handleBuy = async (packageId: string) => {
    setLoadingPackageId(packageId);
    try {
      if (isPeru) {
        const { paymentUrl } = await apiFlowCreatePayment(packageId);
        setWebViewUrl(paymentUrl);
        setWebViewVisible(true);
      } else {
        const { approveUrl, orderId } = await apiPaypalCreateOrder(packageId);
        setPaypalOrderId(orderId);
        setWebViewUrl(approveUrl);
        setWebViewVisible(true);
      }
    } catch (error: any) {
      Alert.alert("Error", error?.message ?? "No se pudo iniciar el pago");
    } finally {
      setLoadingPackageId(null);
    }
  };

  const capturePaypalOrder = async (orderId: string) => {
    setCapturing(true);
    try {
      const result = await apiPaypalCapture(orderId);
      Alert.alert("Pago exitoso", `Se acreditaron ${result.credits} créditos`);
      await loadData();
    } catch (error: any) {
      Alert.alert(
        "Error al confirmar",
        error?.message ?? "No se pudo acreditar el pago. Contacta a soporte.",
      );
    } finally {
      setCapturing(false);
    }
  };

  const handleWebViewNavigationChange = (navState: { url: string }) => {
    const url = navState.url;

    if (paypalOrderId) {
      if (url.startsWith(PAYPAL_RETURN_URL)) {
        const orderIdToCapture = paypalOrderId;
        setWebViewVisible(false);
        setWebViewUrl(null);
        setPaypalOrderId(null);
        void capturePaypalOrder(orderIdToCapture);
        return;
      }
      if (url.startsWith(PAYPAL_CANCEL_URL)) {
        setWebViewVisible(false);
        setWebViewUrl(null);
        setPaypalOrderId(null);
        Alert.alert("Pago cancelado", "No se realizó ningún cobro");
        return;
      }
      return;
    }

    if (url.startsWith(FLOW_RETURN_URL)) {
      setWebViewVisible(false);
      setWebViewUrl(null);
      void loadData();
    }
  };

  const handleCloseWebView = () => {
    setWebViewVisible(false);
    setWebViewUrl(null);
    setPaypalOrderId(null);
  };

  return (
    <View className="flex-1 bg-[#0a0000]">
      <LinearGradient
        colors={["#1a0000", "#0a0000", "#0d0000"]}
        style={StyleSheet.absoluteFill}
        pointerEvents="none"
      />

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 20 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Balance pill */}
        <View className="flex-row items-center justify-center self-center border-2 border-[#F6C16A] rounded-[32px] py-3 px-9 gap-3 mb-6 bg-[rgba(246,193,106,0.05)]">
          <Gem color="#60d4f7" size={30} strokeWidth={1.5} fill="#a8edfb" />
          <Text className="text-white text-[40px] font-extrabold">
            {wallet?.balance ?? 0}
          </Text>
        </View>

        {/* Conversion info */}
        <Text className="text-[rgba(246,193,106,0.6)] text-xs font-semibold text-center -mt-4 mb-5 tracking-widest">
          1 crédito = {symbol} {rate}
        </Text>

        {/* Section title */}
        <View className="flex-row items-center mb-5 gap-2">
          <View className="flex-1 h-px bg-[rgba(246,193,106,0.3)]" />
          <Text className="text-[#F6C16A] text-[17px] font-extrabold">¡Compra Créditos!</Text>
          <View className="flex-1 h-px bg-[rgba(246,193,106,0.3)]" />
        </View>

        
        {loading ? (
          <ActivityIndicator color="#F6C16A" size="large" style={{ marginTop: 32 }} />
        ) : (
          <View className="flex-row flex-wrap items-center justify-center gap-5 mb-7 ">
            {packages.map((item, index) => {
              const isHighlight = index % 2 === 1;
              const badge = BADGES[index % 3] ?? `Pack ${index + 1}`;
              const isLoadingThis = loadingPackageId === item.id;
              return (
                <Pressable
                  key={item.id ?? index}
                  style={({ pressed }) => [
                    { width: CARD_WIDTH, opacity: pressed || isLoadingThis ? 0.72 : 1 },
                  ]}
                  className={[
                    "rounded-3xl  w-[150px]",
                    isHighlight
                      ? "bg-[#200a10] border-2 border-[#F6C16A]"
                      : "bg-[#1a0208] border border-[rgba(246,193,106,0.4)]",
                  ].join(" ")}
                  onPress={() => item.id && void handleBuy(item.id)}
                  disabled={!!loadingPackageId}
                >
                  {/* Badge strip */}
                  <View className={[
                    "items-center py-2",
                    isHighlight ? "bg-[rgba(246,193,106,0.2)]" : "bg-[rgba(246,193,106,0.08)]",
                  ].join(" ")}>
                    <Text className="text-[#F6C16A] text-[11px] font-extrabold tracking-widest">
                      {badge}
                    </Text>
                  </View>

                  {/* Body */}
                  <View className="items-center px-2x pt-2 pb-2 gap-2">
                    {/* Credits */}
                    <Text
                      className="text-[#F6C16A] font-black text-center"
                      style={{ fontSize: 27, lineHeight: 46 }}
                      numberOfLines={1}
                      adjustsFontSizeToFit
                      minimumFontScale={0.6}
                    >
                      {item.credits.toLocaleString()}
                    </Text>
                    <Text className="text-[rgba(246,193,106,0.55)] text-xs font-semibold tracking-widest uppercase">
                      créditos
                    </Text>

                    {/* Divider */}
                    <View className="h-px self-stretch bg-[rgba(246,193,106,0.15)] my-2" />

                    {/* Price */}
                    <View className="flex-row items-baseline gap-1">
                      <Text className="text-[rgba(255,255,255,0.45)] text-xs">{symbol}</Text>
                      <Text className="text-white text-2xl font-extrabold">
                        {(item.credits * rate).toFixed(2)}
                      </Text>
                    </View>
                    <Text className="text-[rgba(255,255,255,0.35)] text-[10px] -mt-1">
                      pago único
                    </Text>

                    {/* Buy pill */}
                    <View className=" items-center justify-center rounded-full py-1  mt-2 ">
                      {isLoadingThis ? (
                        <ActivityIndicator color="white" size="small" />
                      ) : (
                        <Text className="text-[#F6C16A] text-lg font-extrabold tracking-wider">
                          Comprar
                        </Text>
                      )}
                    </View>
                  </View>
                </Pressable>
              );
            })}
          </View>
        )}

        <View className="h-24" />
      </ScrollView>

      {/* WebView Modal — Flow payment */}
      <Modal
        visible={webViewVisible}
        animationType="slide"
        onRequestClose={handleCloseWebView}
      >
        <View className="flex-1 bg-[#0a0000]">
          {/* Header */}
          <View className="flex-row items-center justify-between pt-14 pb-3 px-5 bg-[#1a0208] border-b border-[rgba(246,193,106,0.2)]">
            <View className="w-8" />
            <Text className="text-[#F6C16A] text-2xl font-extrabold">
              Pago seguro
            </Text>
            <Pressable
              onPress={handleCloseWebView}
              className="w-8 h-8 items-center justify-center"
            >
              <X color="#F6C16A" size={30} />
            </Pressable>
          </View>

          {webViewUrl && (
            <WebView
              source={{ uri: webViewUrl }}
              onNavigationStateChange={handleWebViewNavigationChange}
              startInLoadingState
              renderLoading={() => (
                <View
                  className="absolute inset-0 items-center justify-center bg-[#0a0000]"
                  style={StyleSheet.absoluteFillObject}
                >
                  <ActivityIndicator color="#F6C16A" size="large" />
                </View>
              )}
            />
          )}
        </View>
      </Modal>

      {/* Overlay — capturando pago PayPal */}
      <Modal visible={capturing} animationType="fade" transparent>
        <View className="flex-1 items-center justify-center bg-black/80">
          <View className="bg-[#1a0208] border border-[rgba(246,193,106,0.3)] rounded-3xl px-8 py-6 items-center">
            <ActivityIndicator color="#F6C16A" size="large" />
            <Text className="text-[#F6C16A] text-base font-bold mt-4">
              Confirmando pago...
            </Text>
            <Text className="text-white/60 text-xs mt-1">No cierres la app</Text>
          </View>
        </View>
      </Modal>
    </View>
  );
}
