import { useAuth } from '@/src/context/AuthContext';
import { activeChatRef } from '@/src/services/notifications';
import {
  getMessages,
  markAsRead,
  sendMessageHttp,
  unlockMessage,
  unlockChatImage,
  type Message,
} from '@/src/api/messages';
import { apiGetPublicServicePrices, type ServicePrice } from '@/src/api/servicePrices';
import { useSocket } from '@/hooks/useSocket';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Animated,
  AppState,
  AppStateStatus,
  FlatList,
  Image,
  KeyboardAvoidingView,
  Modal,
  PanResponder,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

function formatTime(dateStr: string) {
  return new Date(dateStr).toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' });
}

function formatDateSeparator(dateStr: string) {
  const d = new Date(dateStr);
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);
  if (d.toDateString() === today.toDateString()) return 'Hoy';
  if (d.toDateString() === yesterday.toDateString()) return 'Ayer';
  return d.toLocaleDateString('es-PE', { day: 'numeric', month: 'long' });
}

const EMOJIS = [
  '😀','😂','🥰','😍','😘','😋','🤩','😊','😏','🥺',
  '😭','😤','🤣','🙄','💀','🔥','💯','👀','😈','🤦',
  '❤️','🧡','💛','💚','💙','💜','💕','💋','🫶','🙏',
  '👋','👍','🙌','💪','🎉','🌹','🌸','✨','💫','⭐',
];

type ListItem = Message | { type: 'separator'; label: string; key: string };

function ImageViewerModal({ uri, onClose }: { uri: string; onClose: () => void }) {
  const { width, height } = useWindowDimensions();
  const translateY = useRef(new Animated.Value(0)).current;
  const bgOpacity  = useRef(new Animated.Value(1)).current;
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  useEffect(() => {
    translateY.setValue(0);
    bgOpacity.setValue(1);
  }, [uri]);

  const pan = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, { dy, dx }) =>
        Math.abs(dy) > Math.abs(dx) && Math.abs(dy) > 6,
      onPanResponderMove: (_, { dy }) => {
        translateY.setValue(dy);
        bgOpacity.setValue(Math.max(0, 1 - Math.abs(dy) / 300));
      },
      onPanResponderRelease: (_, { dy, vy }) => {
        if (Math.abs(dy) > 100 || Math.abs(vy) > 1) {
          Animated.parallel([
            Animated.timing(translateY, { toValue: dy > 0 ? height : -height, duration: 220, useNativeDriver: true }),
            Animated.timing(bgOpacity, { toValue: 0, duration: 220, useNativeDriver: true }),
          ]).start(() => onCloseRef.current());
        } else {
          Animated.parallel([
            Animated.spring(translateY, { toValue: 0, useNativeDriver: true }),
            Animated.timing(bgOpacity, { toValue: 1, duration: 180, useNativeDriver: true }),
          ]).start();
        }
      },
    })
  ).current;

  return (
    <Modal visible transparent statusBarTranslucent animationType="fade" onRequestClose={() => onCloseRef.current()}>
      <Animated.View style={{ flex: 1, backgroundColor: 'black', opacity: bgOpacity }}>
        <TouchableOpacity
          onPress={() => onCloseRef.current()}
          style={{ position: 'absolute', top: 50, right: 16, zIndex: 10, backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 20, padding: 8 }}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="close" size={24} color="white" />
        </TouchableOpacity>
        <Animated.View
          {...pan.panHandlers}
          style={{ flex: 1, justifyContent: 'center', alignItems: 'center', transform: [{ translateY }] }}
        >
          <Image source={{ uri }} style={{ width, height: height * 0.88 }} resizeMode="contain" />
        </Animated.View>
      </Animated.View>
    </Modal>
  );
}

function ChatImage({ uri, msgId, onPress }: { uri: string; msgId: string; onPress?: () => void }) {
  const [loading, setLoading] = useState(true);
  const inner = (
    <View style={{ width: 200, height: 200 }}>
      <Image
        source={{ uri }}
        style={{ width: 200, height: 200 }}
        resizeMode="cover"
        onLoad={() => setLoading(false)}
        onError={(e) => { console.log('[image-error]', msgId, e.nativeEvent.error); setLoading(false); }}
      />
      {loading && (
        <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.35)' }}>
          <ActivityIndicator color="white" size="large" />
        </View>
      )}
    </View>
  );
  if (onPress) {
    return <TouchableOpacity activeOpacity={0.9} onPress={onPress}>{inner}</TouchableOpacity>;
  }
  return inner;
}

export default function ChatScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const listRef = useRef<FlatList>(null);
  const inputRef = useRef<TextInput>(null);

  const { conversationId, otherUserId, otherUserName, otherUserAvatar } =
    useLocalSearchParams<{
      conversationId: string;
      otherUserId: string;
      otherUserName: string;
      otherUserAvatar: string;
    }>();

  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const [unlocking, setUnlocking] = useState<string | null>(null);
  const [selectedImageUri, setSelectedImageUri] = useState<string | null>(null);
  const [activeConversationId, setActiveConversationId] = useState(
    conversationId !== 'new' ? conversationId : null,
  );
  const [kavKey, setKavKey] = useState(0);
  const [servicePrices, setServicePrices] = useState<ServicePrice[]>([]);
  const [showEmoji, setShowEmoji] = useState(false);
  const [priceBannerVisible, setPriceBannerVisible] = useState(false);
  const priceBannerAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!otherUserId) return;
    apiGetPublicServicePrices(otherUserId).then(setServicePrices).catch(() => {});
  }, [otherUserId]);

  function getPrice(type: ServicePrice['serviceType']) {
    return servicePrices.find((p) => p.serviceType === type)?.price ?? null;
  }

  function handleCall(callType: 'CALL' | 'VIDEO_CALL') {
    const price = getPrice(callType);
    if (price === null) return;
    router.push({
      pathname: '/(cliente)/call' as any,
      params: {
        anfitrionaId: otherUserId,
        anfitrionaName: otherUserName,
        anfitrionaAvatar: otherUserAvatar ?? '',
        callType,
        pricePerMinute: String(price),
        callId: `${user?.id}_${Date.now()}`,
      },
    });
  }

  function goToProfile() {
    if (!otherUserId) return;
    router.push({ pathname: '/(cliente)/anfitrionas/[id]/verperfil' as any, params: { id: otherUserId } });
  }

  const { onNewMessage } = useSocket(user?.id);

  useEffect(() => {
    const sub = AppState.addEventListener('change', (next: AppStateStatus) => {
      if (next === 'active') {
        setKavKey((k) => k + 1);
        if (activeConversationId) setTimeout(() => void loadMessages(), 600);
      }
    });
    return () => sub.remove();
  }, [activeConversationId]);

  useEffect(() => {
    if (!activeConversationId) { setLoading(false); return; }
    void loadMessages();
  }, [activeConversationId]);

  useEffect(() => {
    const unsub = onNewMessage((msg) => {
      if (msg.conversationId === activeConversationId) {
        setMessages((prev) => {
          if (prev.find((m) => m.id === msg.id)) return prev;
          const processed = (msg.isLocked && msg.imageUrl && !msg.isUnlocked)
            ? { ...msg, imageUrl: msg.imageUrl.replace('/upload/', '/upload/e_blur:2000,q_5/') }
            : msg;
          return [...prev, processed];
        });
        scrollToEnd();
      }
    });
    return unsub;
  }, [activeConversationId]);

  useEffect(() => {
    if (activeConversationId) activeChatRef.current = activeConversationId;
    return () => { activeChatRef.current = null; };
  }, [activeConversationId]);

  useEffect(() => {
    if (activeConversationId && user?.id) void markAsRead(activeConversationId, user.id);
  }, [activeConversationId]);

  async function loadMessages() {
    if (!activeConversationId) return;
    try {
      const raw = await getMessages(activeConversationId);
      const data = raw.map((msg) =>
        (msg.isLocked && msg.imageUrl && !msg.isUnlocked)
          ? { ...msg, imageUrl: msg.imageUrl.replace('/upload/', '/upload/e_blur:2000,q_5/') }
          : msg
      );
      setMessages(data);
      setTimeout(() => scrollToEnd(), 100);
    } catch (e) {
      console.log('[loadMessages] error:', e);
    } finally {
      setLoading(false);
    }
  }

  function scrollToEnd() {
    listRef.current?.scrollToEnd({ animated: true });
  }

  async function handleSend() {
    const trimmed = text.trim();
    if (!trimmed || !user?.id || !otherUserId || sending || isSpamBlocked) return;
    setText('');
    setSending(true);
    const tempId = `_pending_${Date.now()}`;
    const tempMsg: Message = {
      id: tempId,
      conversationId: activeConversationId ?? '',
      senderId: user.id,
      text: trimmed,
      read: false,
      isLocked: false,
      price: null,
      isUnlocked: false,
      createdAt: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, tempMsg]);
    scrollToEnd();
    try {
      const msg = await sendMessageHttp(user.id, otherUserId, trimmed);
      setMessages((prev) => prev.map((m) => m.id === tempId ? msg : m));
      setActiveConversationId(msg.conversationId);
    } catch (e: any) {
      setText(trimmed);
      setMessages((prev) => prev.filter((m) => m.id !== tempId));
      const msg = (e?.message ?? '') as string;
      if (msg.toLowerCase().includes('créditos')) {
        Alert.alert('Sin créditos', 'No tienes créditos suficientes. Recarga tu cuenta.');
      } else if (msg.toLowerCase().includes('consecutivos')) {
        // El backend ya bloqueó — la UI se actualiza sola por isSpamBlocked
      }
    } finally {
      setSending(false);
    }
  }

  async function handleUnlock(messageId: string, price: number) {
    Alert.alert(
      'Abrir regalo',
      `¿Quieres abrir este regalo por ${price} crédito${price !== 1 ? 's' : ''}?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: `Abrir regalo (${price} créditos)`,
          onPress: async () => {
            setUnlocking(messageId);
            try {
              const result = await unlockMessage(messageId);
              setMessages((prev) =>
                prev.map((m) =>
                  m.id === messageId ? { ...m, text: result.text, isLocked: false, isUnlocked: true } : m
                )
              );
            } catch (e: any) {
              Alert.alert('Error', e?.message ?? 'No se pudo abrir el regalo');
            } finally {
              setUnlocking(null);
            }
          },
        },
      ]
    );
  }

  async function handleUnlockImage(messageId: string, price: number) {
    Alert.alert(
      'Desbloquear imagen',
      `¿Quieres ver esta imagen por ${price} crédito${price !== 1 ? 's' : ''}?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: `Desbloquear (${price} créditos)`,
          onPress: async () => {
            setUnlocking(messageId);
            try {
              const result = await unlockChatImage(messageId);
              console.log('[unlock-image] result:', JSON.stringify(result));
              setMessages((prev) =>
                prev.map((m) =>
                  m.id === messageId
                    ? { ...m, imageUrl: result.imageUrl || m.imageUrl, isLocked: false, isUnlocked: true }
                    : m
                )
              );
            } catch (e: any) {
              Alert.alert('Error', e?.message ?? 'No se pudo desbloquear la imagen');
            } finally {
              setUnlocking(null);
            }
          },
        },
      ]
    );
  }

  const msgPrice = getPrice('MESSAGE_SEND' as ServicePrice['serviceType']);

  const SPAM_LIMIT = 5;
  const unrespondedCount = useMemo(() => {
    if (!user?.id) return 0;
    let count = 0;
    for (let i = messages.length - 1; i >= 0; i--) {
      if (messages[i].senderId === user.id) count++;
      else break;
    }
    return count;
  }, [messages, user?.id]);
  const isSpamBlocked = unrespondedCount >= SPAM_LIMIT;

  useEffect(() => {
    if (msgPrice == null || !activeConversationId) return;
    const key = `chat_price_shown_${activeConversationId}`;
    let cancelled = false;
    let hideTimer: ReturnType<typeof setTimeout> | null = null;
    (async () => {
      try {
        const already = await AsyncStorage.getItem(key);
        if (already || cancelled) return;
        setPriceBannerVisible(true);
        Animated.timing(priceBannerAnim, {
          toValue: 1,
          duration: 260,
          useNativeDriver: true,
        }).start();
        hideTimer = setTimeout(() => {
          Animated.timing(priceBannerAnim, {
            toValue: 0,
            duration: 220,
            useNativeDriver: true,
          }).start(() => setPriceBannerVisible(false));
        }, 4000);
        await AsyncStorage.setItem(key, '1');
      } catch {}
    })();
    return () => {
      cancelled = true;
      if (hideTimer) clearTimeout(hideTimer);
    };
  }, [msgPrice, activeConversationId]);

  function dismissPriceBanner() {
    Animated.timing(priceBannerAnim, {
      toValue: 0,
      duration: 180,
      useNativeDriver: true,
    }).start(() => setPriceBannerVisible(false));
  }

  const listData = useMemo<ListItem[]>(() => {
    const result: ListItem[] = [];
    let lastDate = '';
    for (const msg of messages) {
      const day = new Date(msg.createdAt).toDateString();
      if (day !== lastDate) {
        result.push({ type: 'separator', label: formatDateSeparator(msg.createdAt), key: `sep-${day}` });
        lastDate = day;
      }
      result.push(msg);
    }
    return result;
  }, [messages]);

  function insertEmoji(emoji: string) {
    setText((prev) => prev + emoji);
    inputRef.current?.focus();
  }

  function toggleEmoji() {
    setShowEmoji((v) => !v);
    if (showEmoji) inputRef.current?.focus();
  }

  return (
    <>
    <View className="flex-1 bg-[#0a0000]">
      <Stack.Screen options={{ headerShown: false }} />

      <View
        className="flex-row items-center bg-[#140008] border-b border-[rgba(246,193,106,0.12)] pb-4 px-[14px] gap-[10px]"
        style={{ paddingTop: insets.top + 10 }}
      >
        <TouchableOpacity onPress={() => router.back()} className="p-1">
          <Ionicons name="arrow-back" size={22} color="white" />
        </TouchableOpacity>

        <TouchableOpacity onPress={goToProfile} className="flex-1 flex-row items-center gap-3" activeOpacity={0.75}>
          <View className="w-12 h-12 rounded-full border-2 border-[#F6C16A] overflow-hidden">
            {otherUserAvatar ? (
              <Image source={{ uri: otherUserAvatar }} className="w-full h-full" />
            ) : (
              <View className="flex-1 bg-[#2a0810] items-center justify-center">
                <Text className="text-[#F6C16A] font-bold text-lg">
                  {(otherUserName ?? 'U')[0].toUpperCase()}
                </Text>
              </View>
            )}
          </View>
          <View className="flex-1">
            <Text className="text-white text-base font-bold" numberOfLines={1}>{otherUserName ?? 'Chat'}</Text>
            <Text className="text-[rgba(246,193,106,0.6)] text-xs mt-0.5">Ver perfil</Text>
          </View>
        </TouchableOpacity>

        <View className="flex-row gap-2">
          <TouchableOpacity
            onPress={() => handleCall('CALL')}
            disabled={getPrice('CALL') === null}
            activeOpacity={0.7}
            className="w-[38px] h-[38px] rounded-full bg-[rgba(255,255,255,0.07)] items-center justify-center"
            style={getPrice('CALL') === null ? { opacity: 0.35 } : undefined}
          >
            <Ionicons name="call" size={18} color="#4ade80" />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => handleCall('VIDEO_CALL')}
            disabled={getPrice('VIDEO_CALL') === null}
            activeOpacity={0.7}
            className="w-[38px] h-[38px] rounded-full bg-[rgba(255,255,255,0.07)] items-center justify-center"
            style={getPrice('VIDEO_CALL') === null ? { opacity: 0.35 } : undefined}
          >
            <Ionicons name="videocam" size={20} color="#818cf8" />
          </TouchableOpacity>
        </View>
      </View>

      <KeyboardAvoidingView key={kavKey} className="flex-1" behavior="padding" keyboardVerticalOffset={0}>
        {loading ? (
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator size="large" color="#F6C16A" />
          </View>
        ) : (
          <FlatList
            ref={listRef}
            data={listData}
            keyExtractor={(item) => {
              if (!('id' in item)) return item.key;
              const msg = item as Message;
              return `${msg.id}-${msg.isUnlocked ? 'u' : 'l'}`;
            }}
            contentContainerStyle={{ paddingHorizontal: 14, paddingVertical: 12, paddingBottom: 6 }}
            onContentSizeChange={scrollToEnd}
            extraData={messages}
            ListEmptyComponent={
              <View className="items-center mt-16">
                <Text className="text-[rgba(255,255,255,0.3)] text-sm">Inicia la conversación</Text>
              </View>
            }
            renderItem={({ item }) => {
              if ('type' in item && item.type === 'separator') {
                return (
                  <View className="flex-row items-center my-[14px] gap-2">
                    <View className="flex-1 h-px bg-[rgba(255,255,255,0.08)]" />
                    <Text className="text-[rgba(255,255,255,0.35)] text-[11px] font-medium">{item.label}</Text>
                    <View className="flex-1 h-px bg-[rgba(255,255,255,0.08)]" />
                  </View>
                );
              }

              const msg = item as Message;
              const isOwn = msg.senderId === user?.id;
              const isImageMsg = !!msg.imageUrl;
              const lockedImage = isImageMsg && msg.isLocked && !msg.isUnlocked && !isOwn;
              const lockedText = !isImageMsg && msg.isLocked && !isOwn && !msg.isUnlocked;

              return (
                <View className={`mb-1 ${isOwn ? 'items-end' : 'items-start'}`}>
                  {lockedImage ? (
                    <View
                      className="rounded-[18px] rounded-bl-[4px] overflow-hidden border border-[rgba(209,27,27,0.5)]"
                      style={{ width: 220, shadowColor: '#D11B1B', shadowOpacity: 0.5, shadowRadius: 12, elevation: 6 }}
                    >
                      <View className="flex-row items-center gap-2 bg-[#1a0208] px-3 py-2">
                        <Ionicons name="images" size={14} color="#F6C16A" />
                        <Text className="text-[#F6C16A] text-[12px] font-bold tracking-wide">Imagen exclusiva</Text>
                      </View>
                      <View style={{ position: 'relative' }}>
                        <Image
                          source={{ uri: msg.imageUrl! }}
                          style={{ width: 220, height: 180 }}
                          resizeMode="cover"
                        />
                        <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.25)' }}>
                          <Ionicons name="lock-closed" size={36} color="rgba(246,193,106,0.85)" />
                        </View>
                      </View>
                      <View className="bg-[#0f0005] px-3 py-3 items-center gap-1">
                        <TouchableOpacity
                          onPress={() => handleUnlockImage(msg.id, msg.price!)}
                          disabled={unlocking === msg.id}
                          className="bg-[#D11B1B] rounded-xl py-2 px-5 items-center w-full"
                        >
                          {unlocking === msg.id ? (
                            <ActivityIndicator size="small" color="white" />
                          ) : (
                            <Text className="text-white text-[13px] font-bold">
                              Desbloquear · {msg.price} crédito{msg.price !== 1 ? 's' : ''}
                            </Text>
                          )}
                        </TouchableOpacity>
                        <Text className="text-[rgba(255,255,255,0.25)] text-right text-[10px]">{formatTime(msg.createdAt)}</Text>
                      </View>
                    </View>
                  ) : isImageMsg ? (
                    <View className={`rounded-[18px] overflow-hidden ${isOwn ? 'rounded-br-[4px]' : 'rounded-bl-[4px]'}`}>
                      {msg.isUnlocked && !isOwn && (
                        <View className="bg-[#1a0208] px-3 py-1">
                          <Text className="text-[#F6C16A] text-[10px]">🔓 Imagen desbloqueada</Text>
                        </View>
                      )}
                      <ChatImage key={msg.imageUrl} uri={msg.imageUrl!} msgId={msg.id} onPress={() => setSelectedImageUri(msg.imageUrl!)} />
                      <View className={`px-2 py-1 ${isOwn ? 'bg-[#8B1030]' : 'bg-[#1e1010]'}`}>
                        <Text className={`text-[10px] text-right ${isOwn ? 'text-[rgba(255,200,200,0.6)]' : 'text-[rgba(255,255,255,0.35)]'}`}>
                          {formatTime(msg.createdAt)}
                        </Text>
                      </View>
                    </View>
                  ) : lockedText ? (
                    <View
                      className="max-w-[78%] bg-[#1a0208] rounded-[18px] rounded-bl-[4px] border border-[rgba(209,27,27,0.6)] px-[14px] py-3"
                      style={{ shadowColor: '#D11B1B', shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.4, shadowRadius: 10, elevation: 4 }}
                    >
                      <View className="flex-row items-center gap-[6px] mb-[6px]">
                        <Text className="text-lg">🎁</Text>
                        <Text className="text-[rgba(246,193,106,0.9)] text-[13px] font-bold">Regalo exclusivo</Text>
                      </View>
                      <Text className="text-[rgba(255,255,255,0.45)] text-xs mb-[10px] leading-4">
                        Abre este regalo para ver el mensaje
                      </Text>
                      <TouchableOpacity
                        onPress={() => handleUnlock(msg.id, msg.price!)}
                        disabled={unlocking === msg.id}
                        className="bg-[#D11B1B] rounded-xl py-2 px-[14px] items-center"
                      >
                        {unlocking === msg.id ? (
                          <ActivityIndicator size="small" color="white" />
                        ) : (
                          <Text className="text-white text-xs font-bold">
                            Abrir regalo por {msg.price} crédito{msg.price !== 1 ? 's' : ''}
                          </Text>
                        )}
                      </TouchableOpacity>
                      <Text className="text-[rgba(255,255,255,0.3)] text-[10px] mt-[6px] text-right">{formatTime(msg.createdAt)}</Text>
                    </View>
                  ) : (
                    <View
                      className={`max-w-[78%] rounded-[18px] px-[14px] py-2 ${
                        isOwn ? 'bg-[#8B1030] rounded-br-[4px]' : 'bg-[#1e1010] rounded-bl-[4px]'
                      }`}
                    >
                      {msg.isUnlocked && (
                        <Text className="text-[#F6C16A] text-[10px] mb-[3px]">🎁 Regalo abierto</Text>
                      )}
                      <Text className="text-white text-[15px] leading-[21px]">{msg.text}</Text>
                      {isOwn ? (
                        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end', gap: 3, marginTop: 3 }}>
                          <Text className="text-[10px] text-[rgba(255,200,200,0.6)]">{formatTime(msg.createdAt)}</Text>
                          {msg.id.startsWith('_pending_') ? (
                            <Ionicons name="time-outline" size={10} color="rgba(255,200,200,0.4)" />
                          ) : msg.read ? (
                            <Text style={{ color: 'rgba(255,255,255,0.85)', fontSize: 11, fontWeight: '700' }}>✓✓</Text>
                          ) : (
                            <Text style={{ color: 'rgba(255,200,200,0.55)', fontSize: 11, fontWeight: '700' }}>✓</Text>
                          )}
                        </View>
                      ) : (
                        <Text className="text-[10px] mt-[3px] text-right text-[rgba(255,255,255,0.35)]">
                          {formatTime(msg.createdAt)}
                        </Text>
                      )}
                    </View>
                  )}
                </View>
              );
            }}
          />
        )}

        {priceBannerVisible && msgPrice != null && (
          <Animated.View
            style={{
              opacity: priceBannerAnim,
              transform: [{
                translateY: priceBannerAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [8, 0],
                }),
              }],
              paddingHorizontal: 12,
              paddingTop: 8,
            }}
          >
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={dismissPriceBanner}
              className="flex-row items-center gap-2 bg-[rgba(246,193,106,0.08)] border border-[rgba(246,193,106,0.25)] rounded-xl px-3 py-2"
            >
              <Ionicons name="information-circle" size={16} color="#F6C16A" />
              <Text className="flex-1 text-[#F6C16A] text-[12px]">
                Enviar un mensaje cuesta {msgPrice} crédito{msgPrice !== 1 ? 's' : ''}
              </Text>
              <Ionicons name="close" size={14} color="rgba(246,193,106,0.6)" />
            </TouchableOpacity>
          </Animated.View>
        )}

        {showEmoji && (
          <View className="bg-[#140008] border-t border-[rgba(246,193,106,0.1)] py-2 px-[6px]">
            <ScrollView horizontal={false} showsVerticalScrollIndicator={false} style={{ maxHeight: 140 }}>
              <View className="flex-row flex-wrap gap-[2px]">
                {EMOJIS.map((e) => (
                  <TouchableOpacity key={e} onPress={() => insertEmoji(e)} className="p-[6px] rounded-lg">
                    <Text className="text-2xl">{e}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
          </View>
        )}

        {isSpamBlocked && (
          <View
            style={{
              flexDirection: 'row', alignItems: 'center', gap: 8,
              backgroundColor: 'rgba(209,27,27,0.12)',
              borderTopWidth: 1, borderTopColor: 'rgba(209,27,27,0.3)',
              paddingHorizontal: 16, paddingVertical: 10,
            }}
          >
            <Ionicons name="lock-closed" size={15} color="#D11B1B" />
            <Text style={{ color: 'rgba(255,255,255,0.6)', fontSize: 12, flex: 1, lineHeight: 17 }}>
              Enviaste {SPAM_LIMIT} mensajes sin respuesta. Espera a que la anfitriona te conteste.
            </Text>
          </View>
        )}
        <View
          className="flex-row items-center bg-[#140008] border-t border-[rgba(246,193,106,0.1)] px-[10px] pt-[10px] gap-[6px]"
          style={{ paddingBottom: insets.bottom + 10 }}
        >
          <TextInput
            ref={inputRef}
            value={text}
            onChangeText={setText}
            onFocus={() => setShowEmoji(false)}
            editable={!isSpamBlocked}
            placeholder={
              isSpamBlocked
                ? 'Chat bloqueado hasta que la anfitriona responda'
                : msgPrice != null
                ? `Enviar mensaje – ${msgPrice} cr.`
                : 'Escribe un mensaje...'
            }
            placeholderTextColor={isSpamBlocked ? 'rgba(209,27,27,0.5)' : 'rgba(246,193,106,0.5)'}
            multiline
            className="flex-1 bg-[#1a0208] text-white rounded-[22px] px-[14px] py-[10px] text-sm border border-[rgba(246,193,106,0.18)]"
            style={[{ maxHeight: 100 }, isSpamBlocked && { opacity: 0.45, borderColor: 'rgba(209,27,27,0.3)' }]}
          />
          <TouchableOpacity className="p-1" onPress={toggleEmoji} disabled={isSpamBlocked}>
            <Ionicons
              name={showEmoji ? 'happy' : 'happy-outline'}
              size={22}
              color={isSpamBlocked ? 'rgba(255,255,255,0.2)' : showEmoji ? '#F6C16A' : 'rgba(255,255,255,0.45)'}
            />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={handleSend}
            disabled={!text.trim() || isSpamBlocked}
            style={{
              width: 40, height: 40, borderRadius: 20,
              backgroundColor: text.trim() && !isSpamBlocked ? '#D11B1B' : 'rgba(209,27,27,0.3)',
              alignItems: 'center', justifyContent: 'center',
            }}
          >
            <Ionicons name="arrow-up" size={18} color="white" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </View>
    {selectedImageUri && (
      <ImageViewerModal uri={selectedImageUri} onClose={() => setSelectedImageUri(null)} />
    )}
    </>
  );
}
