import React, { useEffect, useRef, useState } from "react";
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
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import * as Clipboard from "expo-clipboard";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const GRID_COLS = 3;
const GRID_PADDING = 16;
const GRID_GAP = 12;
const CARD_WIDTH = (SCREEN_WIDTH - GRID_PADDING * 2 - GRID_GAP * (GRID_COLS - 1)) / GRID_COLS;

import { LinearGradient } from "expo-linear-gradient";
import { Gem, X, Copy, CheckCircle2, AlertCircle, Clock } from "lucide-react-native";
import { WebView } from "react-native-webview";
import { apiGetAllPackages, apiFlowCreatePayment } from "@/src/api/package";
import {
  apiBinanceCreateIntent,
  apiBinanceConfirm,
  apiBinanceGetIntent,
  BinanceIntent,
} from "@/src/api/binance";
import { PackageData } from "@/src/types/package";
import { apiGetMyWallet, WalletResponse } from "@/src/api/userClient";
import { useCurrency } from "@/src/hooks/useCurrency";

const FLOW_RETURN_URL = "https://app.pachamama.chat/dashboard";
const BADGES = ["¡OFERTA!", "MEJOR OFERTA", "+ BONO"];

export default function CreditosScreen() {
  const [packages, setPackages] = useState<PackageData[]>([]);
  const [loading, setLoading] = useState(true);
  const [wallet, setWallet] = useState<WalletResponse | null>(null);
  const [loadingPackageId, setLoadingPackageId] = useState<string | null>(null);
  const [webViewUrl, setWebViewUrl] = useState<string | null>(null);
  const [webViewVisible, setWebViewVisible] = useState(false);

  const [binanceIntent, setBinanceIntent] = useState<BinanceIntent | null>(null);
  const [binanceVisible, setBinanceVisible] = useState(false);
  const [txidInput, setTxidInput] = useState("");
  const [confirming, setConfirming] = useState(false);
  const [copiedField, setCopiedField] = useState<"address" | "amount" | null>(null);
  const [remaining, setRemaining] = useState<number>(0);
  const [selectedNetwork, setSelectedNetwork] = useState<string | null>(null);
  const intentPollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const binanceScrollRef = useRef<ScrollView>(null);

  const { symbol, rate, isPeru } = useCurrency();

  useEffect(() => { void loadData(); }, []);

  useEffect(() => {
    return () => {
      if (intentPollRef.current) clearInterval(intentPollRef.current);
    };
  }, []);

  // Countdown del intent + polling de estado (por si lo confirma el cron)
  useEffect(() => {
    if (!binanceVisible || !binanceIntent) {
      setRemaining(0);
      if (intentPollRef.current) {
        clearInterval(intentPollRef.current);
        intentPollRef.current = null;
      }
      return;
    }

    const tick = () => {
      const ms = new Date(binanceIntent.expiresAt).getTime() - Date.now();
      setRemaining(Math.max(0, Math.floor(ms / 1000)));
    };
    tick();
    const interval = setInterval(tick, 1000);

    const poll = setInterval(async () => {
      try {
        const fresh = await apiBinanceGetIntent(binanceIntent.intentId);
        if (fresh.status === "CONFIRMED") {
          setBinanceVisible(false);
          setBinanceIntent(null);
          Alert.alert(
            "¡Pago confirmado!",
            `Se acreditaron ${fresh.credits} créditos.`,
          );
          await loadData();
        } else if (fresh.status === "EXPIRED") {
          setBinanceIntent(fresh);
        }
      } catch {
        // silencioso, reintenta
      }
    }, 15000);
    intentPollRef.current = poll;

    return () => {
      clearInterval(interval);
      clearInterval(poll);
      intentPollRef.current = null;
    };
  }, [binanceVisible, binanceIntent?.intentId, binanceIntent?.expiresAt]);

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
        const intent = await apiBinanceCreateIntent(packageId);
        setBinanceIntent(intent);
        setSelectedNetwork(intent.defaultNetwork ?? intent.networks[0]?.network ?? null);
        setTxidInput("");
        setBinanceVisible(true);
      }
    } catch (error: any) {
      Alert.alert("Error", error?.message ?? "No se pudo iniciar el pago");
    } finally {
      setLoadingPackageId(null);
    }
  };

  const handleCopy = async (value: string, field: "address" | "amount") => {
    await Clipboard.setStringAsync(value);
    setCopiedField(field);
    setTimeout(() => setCopiedField((f) => (f === field ? null : f)), 1600);
  };

  const handleConfirmTxid = async () => {
    if (!binanceIntent) return;
    const trimmed = txidInput.trim();
    if (trimmed.length < 10) {
      Alert.alert("TXID inválido", "Pega el TXID completo de tu transacción.");
      return;
    }
    setConfirming(true);
    try {
      const result = await apiBinanceConfirm(binanceIntent.intentId, trimmed);
      setBinanceVisible(false);
      setBinanceIntent(null);
      Alert.alert(
        "¡Pago confirmado!",
        `Se acreditaron ${result.credits} créditos.`,
      );
      await loadData();
    } catch (error: any) {
      Alert.alert("No se pudo confirmar", error?.message ?? "Intenta de nuevo en unos minutos.");
    } finally {
      setConfirming(false);
    }
  };

  const handleWebViewNavigationChange = (navState: { url: string }) => {
    if (navState.url.startsWith(FLOW_RETURN_URL)) {
      setWebViewVisible(false);
      setWebViewUrl(null);
      void loadData();
    }
  };

  const handleCloseWebView = () => {
    setWebViewVisible(false);
    setWebViewUrl(null);
  };

  const handleCloseBinance = () => {
    setBinanceVisible(false);
    setBinanceIntent(null);
    setTxidInput("");
  };

  const formatRemaining = (s: number) => {
    const m = Math.floor(s / 60);
    const ss = s % 60;
    return `${m}:${ss.toString().padStart(2, "0")}`;
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
        <View className="flex-row items-center justify-center self-center border-2 border-[#F6C16A] rounded-[32px] py-3 px-9 gap-3 mb-6 bg-[rgba(246,193,106,0.05)]">
          <Gem color="#60d4f7" size={30} strokeWidth={1.5} fill="#a8edfb" />
          <Text className="text-white text-[40px] font-extrabold">
            {wallet?.balance ?? 0}
          </Text>
        </View>

        <Text className="text-[rgba(246,193,106,0.6)] text-xs font-semibold text-center -mt-4 mb-5 tracking-widest">
          1 crédito = {symbol} {rate}
        </Text>

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
                  <View className={[
                    "items-center py-2",
                    isHighlight ? "bg-[rgba(246,193,106,0.2)]" : "bg-[rgba(246,193,106,0.08)]",
                  ].join(" ")}>
                    <Text className="text-[#F6C16A] text-[11px] font-extrabold tracking-widest">
                      {badge}
                    </Text>
                  </View>

                  <View className="items-center px-2x pt-2 pb-2 gap-2">
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

                    <View className="h-px self-stretch bg-[rgba(246,193,106,0.15)] my-2" />

                    <View className="flex-row items-baseline gap-1">
                      <Text className="text-[rgba(255,255,255,0.45)] text-xs">{symbol}</Text>
                      <Text className="text-white text-2xl font-extrabold">
                        {(item.credits * rate).toFixed(2)}
                      </Text>
                    </View>
                    <Text className="text-[rgba(255,255,255,0.35)] text-[10px] -mt-1">
                      pago único
                    </Text>

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

      {/* WebView — Flow (Perú) */}
      <Modal
        visible={webViewVisible}
        animationType="slide"
        onRequestClose={handleCloseWebView}
      >
        <View className="flex-1 bg-[#0a0000]">
          <View className="flex-row items-center justify-between pt-14 pb-3 px-5 bg-[#1a0208] border-b border-[rgba(246,193,106,0.2)]">
            <View className="w-8" />
            <Text className="text-[#F6C16A] text-2xl font-extrabold">Pago seguro</Text>
            <Pressable onPress={handleCloseWebView} className="w-8 h-8 items-center justify-center">
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

      {/* Binance — modal de pago internacional */}
      <Modal
        visible={binanceVisible}
        animationType="slide"
        onRequestClose={handleCloseBinance}
      >
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          keyboardVerticalOffset={0}
        >
          <View className="flex-1 bg-[#0a0000]">
            <View className="flex-row items-center justify-between pt-14 pb-3 px-5 bg-[#1a0208] border-b border-[rgba(246,193,106,0.2)]">
              <View className="w-8" />
              <Text className="text-[#F6C16A] text-xl font-extrabold">Pago con Binance</Text>
              <Pressable onPress={handleCloseBinance} className="w-8 h-8 items-center justify-center">
                <X color="#F6C16A" size={28} />
              </Pressable>
            </View>

            <ScrollView
              ref={binanceScrollRef}
              className="flex-1"
              contentContainerStyle={{ padding: 20, paddingBottom: 320 }}
              keyboardShouldPersistTaps="handled"
              keyboardDismissMode="interactive"
            >
              {binanceIntent && (
                <>
                  {/* Resumen del paquete */}
                  <View className="bg-[#1a0208] rounded-3xl border border-[rgba(246,193,106,0.25)] px-5 py-4 mb-4">
                    <Text className="text-white/50 text-xs uppercase tracking-widest mb-1">Paquete</Text>
                    <Text className="text-white text-lg font-extrabold">{binanceIntent.packageName}</Text>
                    <View className="flex-row items-center mt-2 gap-2">
                      <Gem color="#60d4f7" size={18} fill="#a8edfb" />
                      <Text className="text-[#F6C16A] text-base font-bold">
                        {binanceIntent.credits.toLocaleString()} créditos
                      </Text>
                    </View>
                  </View>

                  {/* Countdown / status */}
                  {binanceIntent.status === "EXPIRED" || remaining <= 0 ? (
                    <View className="flex-row items-center bg-[#3a0000] border border-red-500/40 rounded-2xl px-4 py-3 mb-4">
                      <AlertCircle color="#ef4444" size={20} />
                      <Text className="text-red-300 text-sm ml-2 flex-1">
                        El intent expiró. Cierra y vuelve a tocar Comprar.
                      </Text>
                    </View>
                  ) : (
                    <View className="flex-row items-center justify-center bg-[rgba(246,193,106,0.08)] border border-[rgba(246,193,106,0.3)] rounded-2xl px-4 py-2 mb-4">
                      <Clock color="#F6C16A" size={16} />
                      <Text className="text-[#F6C16A] text-sm font-bold ml-2">
                        Expira en {formatRemaining(remaining)}
                      </Text>
                    </View>
                  )}

                  {/* Selector de red */}
                  {binanceIntent.networks.length > 0 && (
                    <View className="mb-3">
                      <Text className="text-white/60 text-xs uppercase tracking-widest mb-2">
                        Elige la red ({binanceIntent.coin})
                      </Text>
                      <View className="flex-row flex-wrap gap-2">
                        {binanceIntent.networks.map((n) => {
                          const active = selectedNetwork === n.network;
                          return (
                            <Pressable
                              key={n.network}
                              onPress={() => {
                                setSelectedNetwork(n.network);
                                setCopiedField(null);
                              }}
                              className="rounded-full px-4 py-2"
                              style={{
                                backgroundColor: active ? "#F6C16A" : "rgba(246,193,106,0.08)",
                                borderWidth: 1,
                                borderColor: active ? "#F6C16A" : "rgba(246,193,106,0.3)",
                              }}
                            >
                              <Text
                                className="text-xs font-extrabold"
                                style={{ color: active ? "#0a0000" : "#F6C16A" }}
                              >
                                {n.label}
                              </Text>
                            </Pressable>
                          );
                        })}
                      </View>
                      <Text className="text-white/40 text-[11px] mt-2">
                        Envía SOLO {binanceIntent.coin} en la red seleccionada. Otra red se perderá.
                      </Text>
                    </View>
                  )}

                  {/* Wallet de la red seleccionada */}
                  {(() => {
                    const current =
                      binanceIntent.networks.find((n) => n.network === selectedNetwork) ??
                      binanceIntent.networks[0];
                    if (!current) return null;
                    return (
                      <View className="mb-3">
                        <Text className="text-white/60 text-xs uppercase tracking-widest mb-1">
                          Wallet de destino · {current.label}
                        </Text>
                        <Pressable
                          onPress={() => handleCopy(current.wallet, "address")}
                          className="bg-[#1a0208] border border-[rgba(246,193,106,0.2)] rounded-2xl px-4 py-3 flex-row items-center"
                        >
                          <Text className="text-white text-sm font-mono flex-1" selectable>
                            {current.wallet}
                          </Text>
                          {copiedField === "address" ? (
                            <CheckCircle2 color="#22c55e" size={20} />
                          ) : (
                            <Copy color="#F6C16A" size={20} />
                          )}
                        </Pressable>
                      </View>
                    );
                  })()}

                  {/* Monto exacto */}
                  <View className="mb-4">
                    <Text className="text-white/60 text-xs uppercase tracking-widest mb-1">
                      Monto EXACTO a enviar
                    </Text>
                    <Pressable
                      onPress={() => handleCopy(binanceIntent.amount, "amount")}
                      className="bg-[#200a10] border-2 border-[#F6C16A] rounded-2xl px-4 py-3 flex-row items-center"
                    >
                      <View className="flex-1">
                        <Text className="text-white text-2xl font-black">
                          {binanceIntent.amount} <Text className="text-[#F6C16A]">{binanceIntent.coin}</Text>
                        </Text>
                        <Text className="text-white/50 text-[11px] mt-0.5">
                          Debe llegar este monto exacto (tolerancia {binanceIntent.tolerancePercent}%).
                        </Text>
                      </View>
                      {copiedField === "amount" ? (
                        <CheckCircle2 color="#22c55e" size={22} />
                      ) : (
                        <Copy color="#F6C16A" size={22} />
                      )}
                    </Pressable>
                  </View>

                  {/* Instrucciones */}
                  <View className="bg-[rgba(96,212,247,0.08)] border border-[rgba(96,212,247,0.3)] rounded-2xl px-4 py-3 mb-5">
                    <Text className="text-[#a8edfb] text-xs font-bold mb-1">Cómo pagar</Text>
                    <Text className="text-white/70 text-xs leading-5">
                      1. Abre tu app de Binance.{"\n"}
                      2. Envía exactamente <Text className="text-[#F6C16A] font-bold">{binanceIntent.amount} {binanceIntent.coin}</Text> a la wallet de arriba en la red elegida.{"\n"}
                      3. Copia el TXID/hash de la transacción y pégalo aquí abajo.{"\n"}
                      4. Toca "Ya pagué". El sistema valida con Binance y te acredita los créditos.
                    </Text>
                  </View>

                  {/* TXID input */}
                  <Text className="text-white/60 text-xs uppercase tracking-widest mb-1">
                    TXID / Hash de la transacción
                  </Text>
                  <TextInput
                    value={txidInput}
                    onChangeText={setTxidInput}
                    placeholder="0xabc123... o hash TRC20"
                    placeholderTextColor="rgba(255,255,255,0.25)"
                    autoCapitalize="none"
                    autoCorrect={false}
                    editable={!confirming && binanceIntent.status === "PENDING" && remaining > 0}
                    onFocus={() => {
                      setTimeout(() => {
                        binanceScrollRef.current?.scrollToEnd({ animated: true });
                      }, 250);
                    }}
                    className="bg-[#1a0208] border border-[rgba(246,193,106,0.25)] rounded-2xl px-4 py-3 text-white text-sm font-mono mb-4"
                    style={{ minHeight: 50 }}
                    multiline
                  />

                  <Pressable
                    onPress={handleConfirmTxid}
                    disabled={
                      confirming ||
                      txidInput.trim().length < 10 ||
                      binanceIntent.status !== "PENDING" ||
                      remaining <= 0
                    }
                    className="rounded-2xl py-4 items-center justify-center"
                    style={{
                      backgroundColor:
                        confirming ||
                        txidInput.trim().length < 10 ||
                        binanceIntent.status !== "PENDING" ||
                        remaining <= 0
                          ? "rgba(246,193,106,0.25)"
                          : "#F6C16A",
                    }}
                  >
                    {confirming ? (
                      <ActivityIndicator color="#0a0000" />
                    ) : (
                      <Text className="text-[#0a0000] text-lg font-black tracking-widest">
                        YA PAGUÉ
                      </Text>
                    )}
                  </Pressable>

                  <Text className="text-white/40 text-[11px] text-center mt-3">
                    Si cierras esta pantalla, el sistema sigue intentando confirmar tu pago en segundo plano por unos minutos.
                  </Text>
                </>
              )}
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}
