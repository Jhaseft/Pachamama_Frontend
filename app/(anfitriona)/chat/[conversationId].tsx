import { useAuth } from '@/src/context/AuthContext';
import { activeChatRef, anfitrionaChatScreenRef } from '@/src/services/notifications';
import {
  getMessages,
  getMyServicePrices,
  markAsRead,
  sendMessageHttp,
  sendImageHttp,
  type Message,
} from '@/src/api/messages';
import { apiGetUserWallet } from '@/src/api/userClient';
import { useSocket } from '@/hooks/useSocket';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  AppState,
  AppStateStatus,
  FlatList,
  Image,
  KeyboardAvoidingView,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

function formatTime(dateStr: string) {
  return new Date(dateStr).toLocaleTimeString('es-PE', {
    hour: '2-digit',
    minute: '2-digit',
  });
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

export default function AnfitrianaChat() {
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
  const [isLocked, setIsLocked] = useState(false);
  const [messagePrice, setMessagePrice] = useState<number | null>(null);
  const [activeConversationId, setActiveConversationId] = useState(
    conversationId !== 'new' ? conversationId : null,
  );
  const [kavKey, setKavKey] = useState(0);
  const [showEmoji, setShowEmoji] = useState(false);
  const [clientCredits, setClientCredits] = useState<number | null>(null);
  const [pendingImage, setPendingImage] = useState<ImagePicker.ImagePickerAsset | null>(null);
  const [imageModalVisible, setImageModalVisible] = useState(false);
  const [imageLocked, setImageLocked] = useState(false);
  const [imagePrice, setImagePrice] = useState('');

  const { onNewMessage } = useSocket(user?.id);

  useEffect(() => { void loadServicePrices(); }, []);

  useEffect(() => {
    if (otherUserId) void loadClientCredits();
  }, [otherUserId]);

  useEffect(() => {
    const sub = AppState.addEventListener('change', (next: AppStateStatus) => {
      if (next === 'active') setKavKey((k) => k + 1);
    });
    return () => sub.remove();
  }, []);

  useEffect(() => {
    if (!activeConversationId) { setLoading(false); return; }
    void loadMessages();
  }, [activeConversationId]);

  useEffect(() => {
    const unsub = onNewMessage((msg) => {
      if (msg.conversationId === activeConversationId) {
        setMessages((prev) => {
          if (prev.find((m) => m.id === msg.id)) return prev;
          return [...prev, msg];
        });
        scrollToEnd();
      }
    });
    return unsub;
  }, [activeConversationId]);

  useEffect(() => {
    if (activeConversationId && user?.id) void markAsRead(activeConversationId, user.id);
  }, [activeConversationId]);

  useEffect(() => {
    anfitrionaChatScreenRef.current = true;
    if (activeConversationId) activeChatRef.current = activeConversationId;
    return () => {
      anfitrionaChatScreenRef.current = false;
      activeChatRef.current = null;
    };
  }, [activeConversationId]);

  async function loadClientCredits() {
    if (!otherUserId) return;
    try {
      const wallet = await apiGetUserWallet(otherUserId);
      setClientCredits(wallet.balance);
    } catch {
      // silencioso
    }
  }

  async function loadServicePrices() {
    try {
      const prices = await getMyServicePrices();
      const msgPrice = prices.find((p) => p.serviceType === 'MESSAGE');
      if (msgPrice) setMessagePrice(msgPrice.price);
    } catch {
      // silencioso
    }
  }

  async function loadMessages() {
    if (!activeConversationId) return;
    try {
      const data = await getMessages(activeConversationId);
      setMessages(data);
      setTimeout(() => scrollToEnd(), 100);
    } catch {
      // silencioso
    } finally {
      setLoading(false);
    }
  }

  function scrollToEnd() {
    listRef.current?.scrollToEnd({ animated: true });
  }

  async function handleSend() {
    const trimmed = text.trim();
    if (!trimmed || !user?.id || !otherUserId || sending) return;
    setText('');
    setSending(true);

    // Mensaje optimista: aparece inmediatamente en la lista con ID temporal
    const tempId = `_pending_${Date.now()}`;
    const tempMsg: Message = {
      id: tempId,
      conversationId: activeConversationId ?? '',
      senderId: user.id,
      text: trimmed,
      read: false,
      isLocked,
      price: isLocked ? messagePrice : null,
      isUnlocked: false,
      createdAt: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, tempMsg]);
    scrollToEnd();

    try {
      const msg = await sendMessageHttp(user.id, otherUserId, trimmed, isLocked);
      setMessages((prev) => prev.map((m) => m.id === tempId ? msg : m));
      setActiveConversationId(msg.conversationId);
      setIsLocked(false);
    } catch {
      setText(trimmed);
      setMessages((prev) => prev.filter((m) => m.id !== tempId));
    } finally {
      setSending(false);
    }
  }

  async function handleSendImage() {
    if (!otherUserId || sending) return;
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.8,
    });
    if (result.canceled) return;
    setPendingImage(result.assets[0]);
    setImageLocked(false);
    setImagePrice('');
    setImageModalVisible(true);
  }

  function handleConfirmSendImage() {
    if (!pendingImage) return;
    const price = imageLocked ? parseInt(imagePrice) : undefined;
    if (imageLocked && (!price || price < 1)) {
      Alert.alert('Precio inválido', 'Ingresa un precio mayor a 0.');
      return;
    }
    setImageModalVisible(false);
    doSendImage(pendingImage, imageLocked, price);
    setPendingImage(null);
  }

  async function doSendImage(asset: ImagePicker.ImagePickerAsset, locked: boolean, price?: number) {
    setSending(true);
    const tempId = `_pending_${Date.now()}`;
    const tempMsg: Message = {
      id: tempId,
      conversationId: activeConversationId ?? '',
      senderId: user!.id,
      text: null,
      imageUrl: asset.uri,
      read: false,
      isLocked: locked,
      price: price ?? null,
      isUnlocked: false,
      createdAt: new Date().toISOString(),
    };
    setMessages(prev => [...prev, tempMsg]);
    scrollToEnd();
    try {
      const ext = asset.uri.split('.').pop() ?? 'jpg';
      const msg = await sendImageHttp(
        otherUserId!,
        { uri: asset.uri, type: `image/${ext}`, name: `photo.${ext}` },
        locked,
        price,
      );
      setMessages(prev => prev.map(m => m.id === tempId ? msg : m));
      setActiveConversationId(msg.conversationId);
    } catch {
      setMessages(prev => prev.filter(m => m.id !== tempId));
      Alert.alert('Error', 'No se pudo enviar la imagen.');
    } finally {
      setSending(false);
    }
  }

  function insertEmoji(emoji: string) {
    setText((prev) => prev + emoji);
    inputRef.current?.focus();
  }

  function toggleEmoji() {
    setShowEmoji((v) => !v);
    if (showEmoji) inputRef.current?.focus();
  }

  // Separadores de fecha
  type ListItem = Message | { type: 'separator'; label: string; key: string };
  const listData: ListItem[] = [];
  let lastDate = '';
  for (const msg of messages) {
    const day = new Date(msg.createdAt).toDateString();
    if (day !== lastDate) {
      listData.push({ type: 'separator', label: formatDateSeparator(msg.createdAt), key: `sep-${day}` });
      lastDate = day;
    }
    listData.push(msg);
  }

  const sendDisabled = !text.trim() || sending || (isLocked && messagePrice === null);

  return (
    <View style={styles.root}>
      <Stack.Screen options={{ headerShown: false }} />

      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color="white" />
        </TouchableOpacity>

        <View style={styles.headerInfo}>
          <View style={styles.avatarWrap}>
            {otherUserAvatar ? (
              <Image source={{ uri: otherUserAvatar }} style={styles.avatarImg} />
            ) : (
              <View style={styles.avatarFallback}>
                <Text style={styles.avatarInitial}>
                  {(otherUserName ?? 'U')[0].toUpperCase()}
                </Text>
              </View>
            )}
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.headerName} numberOfLines={1}>{otherUserName ?? 'Chat'}</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 2 }}>
              <Text style={styles.headerSub}>Cliente</Text>
              {clientCredits !== null && (
                <View style={styles.creditsBadge}>
                  <Text style={styles.creditsBadgeText}>🪙 {clientCredits} créditos</Text>
                </View>
              )}
            </View>
          </View>
        </View>
      </View>

      <KeyboardAvoidingView key={kavKey} style={{ flex: 1 }} behavior="padding" keyboardVerticalOffset={0}>
        {loading ? (
          <View style={styles.loadingWrap}>
            <ActivityIndicator size="large" color="#F6C16A" />
          </View>
        ) : (
          <FlatList
            ref={listRef}
            data={listData}
            keyExtractor={(item) => ('id' in item ? item.id : item.key)}
            contentContainerStyle={styles.messageList}
            onContentSizeChange={scrollToEnd}
            ListEmptyComponent={
              <View style={styles.emptyWrap}>
                <Text style={styles.emptyText}>Inicia la conversación</Text>
              </View>
            }
            renderItem={({ item }) => {
              if ('type' in item && item.type === 'separator') {
                return (
                  <View style={styles.dateSepWrap}>
                    <View style={styles.dateSepLine} />
                    <Text style={styles.dateSepText}>{item.label}</Text>
                    <View style={styles.dateSepLine} />
                  </View>
                );
              }

              const msg = item as Message;
              const isOwn = msg.senderId === user?.id;

              return (
                <View style={[styles.msgRow, isOwn ? styles.msgRowOwn : styles.msgRowOther]}>
                  <View style={[
                    styles.bubble,
                    isOwn
                      ? msg.isLocked ? styles.bubbleOwnLocked : styles.bubbleOwn
                      : styles.bubbleOther,
                  ]}>
                    {msg.isLocked && isOwn && (
                      <View style={styles.lockedLabel}>
                        <Text style={styles.lockedLabelText}>
                          🎁 {msg.price != null ? `${msg.price} créditos` : 'Regalo'}
                        </Text>
                      </View>
                    )}
                    {msg.imageUrl ? (
                      <Image
                        source={{ uri: msg.imageUrl }}
                        style={{ width: 200, height: 200, borderRadius: 12, marginBottom: 4 }}
                        resizeMode="cover"
                        blurRadius={msg.isLocked && !isOwn ? 20 : 0}
                      />
                    ) : (
                      <Text style={styles.bubbleText}>{msg.text ?? '(bloqueado)'}</Text>
                    )}
                    {isOwn ? (
                      <View style={styles.bubbleFooter}>
                        <Text style={styles.bubbleTimeOwn}>{formatTime(msg.createdAt)}</Text>
                        {msg.id.startsWith('_pending_') ? (
                          <Ionicons name="time-outline" size={10} color="rgba(255,200,200,0.4)" />
                        ) : msg.read ? (
                          <Text style={styles.checkRead}>✓✓</Text>
                        ) : (
                          <Text style={styles.checkSent}>✓</Text>
                        )}
                      </View>
                    ) : (
                      <Text style={[styles.bubbleTime, styles.bubbleTimeOther]}>
                        {formatTime(msg.createdAt)}
                      </Text>
                    )}
                  </View>
                </View>
              );
            }}
          />
        )}

        {/* Aviso: regalo sin precio configurado */}
        {isLocked && messagePrice === null && (
          <View className="bg-[rgba(246,193,106,0.1)] border border-[rgba(246,193,106,0.3)] rounded-[10px] mx-3 mb-[6px] px-[14px] py-2">
            <Text className="text-[#F6C16A] text-xs text-center">
              ⚠️ Configura el precio de regalos en tu perfil para usar esta función
            </Text>
          </View>
        )}

        {/* Emoji picker */}
        {showEmoji && (
          <View className="bg-[#140008] border-t border-[rgba(246,193,106,0.1)] py-2 px-[6px]">
            <ScrollView showsVerticalScrollIndicator={false} style={{ maxHeight: 140 }}>
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

        {/* Input bar */}
        <View
          className="flex-row items-center bg-[#140008] border-t border-[rgba(246,193,106,0.1)] px-[10px] pt-[10px] gap-[6px]"
          style={{ paddingBottom: insets.bottom + 10 }}
        >
          <TextInput
            ref={inputRef}
            value={text}
            onChangeText={setText}
            onFocus={() => setShowEmoji(false)}
            placeholder="Escribe un mensaje..."
            placeholderTextColor="rgba(246,193,106,0.5)"
            multiline
            className="flex-1 bg-[#1a0208] text-white rounded-[22px] px-[14px] py-[10px] text-sm border border-[rgba(246,193,106,0.18)]"
            style={{ maxHeight: 100 }}
          />

          {/* Imagen */}
          <TouchableOpacity className="p-1" onPress={handleSendImage} disabled={sending}>
            <Ionicons name="image-outline" size={22} color={sending ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.45)'} />
          </TouchableOpacity>

          {/* Emoji */}
          <TouchableOpacity className="p-1" onPress={toggleEmoji}>
            <Ionicons
              name={showEmoji ? 'happy' : 'happy-outline'}
              size={22}
              color={showEmoji ? '#F6C16A' : 'rgba(255,255,255,0.45)'}
            />
          </TouchableOpacity>

          {/* Gift toggle */}
          <TouchableOpacity
            className="w-9 h-9 rounded-full items-center justify-center"
            style={isLocked
              ? { backgroundColor: 'rgba(246,193,106,0.15)', borderWidth: 1, borderColor: 'rgba(246,193,106,0.4)' }
              : { backgroundColor: 'rgba(255,255,255,0.07)' }
            }
            onPress={() => setIsLocked((v) => !v)}
          >
            <Text style={{ fontSize: 17 }}>{isLocked ? '🎁' : '🎀'}</Text>
          </TouchableOpacity>

          {/* Enviar */}
          <TouchableOpacity
            onPress={handleSend}
            disabled={sendDisabled}
            style={{
              width: 40,
              height: 40,
              borderRadius: 20,
              backgroundColor: sendDisabled ? 'rgba(209,27,27,0.3)' : '#D11B1B',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Ionicons name="arrow-up" size={18} color="white" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
      {/* Modal enviar imagen */}
      <Modal visible={imageModalVisible} transparent animationType="slide" onRequestClose={() => setImageModalVisible(false)}>
        <KeyboardAvoidingView
          behavior="padding"
          style={{ flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.75)' }}
        >
          <View style={{ backgroundColor: '#140008', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20, paddingBottom: insets.bottom + 24, gap: 16 }}>

            {/* Header */}
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
              <Text style={{ color: 'white', fontWeight: '800', fontSize: 16 }}>Enviar imagen</Text>
              <TouchableOpacity onPress={() => setImageModalVisible(false)} style={{ padding: 4 }}>
                <MaterialCommunityIcons name="close" size={22} color="rgba(255,255,255,0.5)" />
              </TouchableOpacity>
            </View>

            {/* Preview */}
            {pendingImage && (
              <View style={{ alignSelf: 'center', borderRadius: 16, overflow: 'hidden', borderWidth: 2, borderColor: imageLocked ? 'rgba(246,193,106,0.5)' : 'rgba(255,255,255,0.15)' }}>
                <Image
                  source={{ uri: pendingImage.uri }}
                  style={{ width: 200, height: 200 }}
                  resizeMode="cover"
                  blurRadius={imageLocked ? 18 : 0}
                />
                {imageLocked && (
                  <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.3)' }}>
                    <MaterialCommunityIcons name="lock" size={36} color="#F6C16A" />
                    <Text style={{ color: '#F6C16A', fontWeight: '700', fontSize: 12, marginTop: 4 }}>Bloqueada</Text>
                  </View>
                )}
              </View>
            )}

            {/* Toggle gratis / bloqueada */}
            <View style={{ flexDirection: 'row', gap: 10 }}>
              <TouchableOpacity
                onPress={() => setImageLocked(false)}
                style={{
                  flex: 1, borderRadius: 12, paddingVertical: 12, alignItems: 'center',
                  backgroundColor: !imageLocked ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.04)',
                  borderWidth: 1, borderColor: !imageLocked ? 'rgba(255,255,255,0.3)' : 'rgba(255,255,255,0.08)',
                }}
              >
                <MaterialCommunityIcons name="image-outline" size={22} color={!imageLocked ? 'white' : 'rgba(255,255,255,0.3)'} />
                <Text style={{ color: !imageLocked ? 'white' : 'rgba(255,255,255,0.4)', fontWeight: '700', fontSize: 13, marginTop: 4 }}>Gratis</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => setImageLocked(true)}
                style={{
                  flex: 1, borderRadius: 12, paddingVertical: 12, alignItems: 'center',
                  backgroundColor: imageLocked ? 'rgba(246,193,106,0.12)' : 'rgba(255,255,255,0.04)',
                  borderWidth: 1, borderColor: imageLocked ? 'rgba(246,193,106,0.4)' : 'rgba(255,255,255,0.08)',
                }}
              >
                <MaterialCommunityIcons name="lock-outline" size={22} color={imageLocked ? '#F6C16A' : 'rgba(255,255,255,0.3)'} />
                <Text style={{ color: imageLocked ? '#F6C16A' : 'rgba(255,255,255,0.4)', fontWeight: '700', fontSize: 13, marginTop: 4 }}>Bloqueada</Text>
              </TouchableOpacity>
            </View>

            {/* Input precio */}
            {imageLocked && (
              <View style={{ backgroundColor: '#0f0005', borderRadius: 12, borderWidth: 1, borderColor: 'rgba(246,193,106,0.25)', flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14 }}>
                <MaterialCommunityIcons name="diamond-stone" size={18} color="#F6C16A" style={{ marginRight: 8 }} />
                <TextInput
                  value={imagePrice}
                  onChangeText={setImagePrice}
                  keyboardType="numeric"
                  placeholder="Precio en créditos"
                  placeholderTextColor="rgba(246,193,106,0.35)"
                  style={{ flex: 1, color: 'white', fontSize: 16, fontWeight: '700', paddingVertical: 12 }}
                />
                <Text style={{ color: 'rgba(255,255,255,0.4)', fontSize: 12 }}>créditos</Text>
              </View>
            )}

            {/* Botón enviar */}
            <TouchableOpacity
              onPress={handleConfirmSendImage}
              activeOpacity={0.85}
              style={{
                backgroundColor: '#D11B1B', borderRadius: 14,
                paddingVertical: 15, alignItems: 'center',
                flexDirection: 'row', justifyContent: 'center', gap: 8,
              }}
            >
              <MaterialCommunityIcons name="send" size={18} color="white" />
              <Text style={{ color: 'white', fontWeight: '800', fontSize: 15 }}>
                {imageLocked ? `Enviar bloqueada${imagePrice ? ` · ${imagePrice} cred` : ''}` : 'Enviar imagen'}
              </Text>
            </TouchableOpacity>

          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#0a0000',
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#140008',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(246,193,106,0.12)',
    paddingBottom: 16,
    paddingHorizontal: 14,
    gap: 10,
  },
  backBtn: { padding: 4 },
  headerInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatarWrap: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 1.5,
    borderColor: '#F6C16A',
    overflow: 'hidden',
  },
  avatarImg: { width: '100%', height: '100%' },
  avatarFallback: {
    flex: 1,
    backgroundColor: '#2a0810',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitial: {
    color: '#F6C16A',
    fontWeight: '700',
    fontSize: 18,
  },
  headerName: {
    color: 'white',
    fontSize: 16,
    fontWeight: '700',
  },
  headerSub: {
    color: 'rgba(246,193,106,0.6)',
    fontSize: 12,
  },
  creditsBadge: {
    backgroundColor: 'rgba(246,193,106,0.15)',
    borderWidth: 1,
    borderColor: 'rgba(246,193,106,0.35)',
    borderRadius: 10,
    paddingHorizontal: 7,
    paddingVertical: 2,
  },
  creditsBadgeText: {
    color: '#F6C16A',
    fontSize: 11,
    fontWeight: '600',
  },

  // Loading / empty
  loadingWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyWrap: {
    alignItems: 'center',
    marginTop: 60,
  },
  emptyText: {
    color: 'rgba(255,255,255,0.3)',
    fontSize: 14,
  },

  // Messages
  messageList: {
    paddingHorizontal: 14,
    paddingVertical: 12,
    paddingBottom: 6,
  },
  dateSepWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 14,
    gap: 8,
  },
  dateSepLine: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  dateSepText: {
    color: 'rgba(255,255,255,0.35)',
    fontSize: 11,
    fontWeight: '500',
  },
  msgRow: { marginBottom: 4 },
  msgRowOwn: { alignItems: 'flex-end' },
  msgRowOther: { alignItems: 'flex-start' },

  // Bubbles
  bubble: {
    maxWidth: '78%',
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  bubbleOwn: {
    backgroundColor: '#8B1030',
    borderBottomRightRadius: 4,
  },
  bubbleOwnLocked: {
    backgroundColor: '#5C3A00',
    borderBottomRightRadius: 4,
    borderWidth: 1,
    borderColor: 'rgba(246,193,106,0.4)',
  },
  bubbleOther: {
    backgroundColor: '#1e1010',
    borderBottomLeftRadius: 4,
  },
  lockedLabel: {
    marginBottom: 4,
  },
  lockedLabelText: {
    color: '#F6C16A',
    fontSize: 11,
    fontWeight: '700',
  },
  bubbleText: {
    color: 'white',
    fontSize: 15,
    lineHeight: 21,
  },
  bubbleFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 3,
    marginTop: 3,
  },
  bubbleTime: {
    fontSize: 10,
    marginTop: 3,
    textAlign: 'right',
  },
  bubbleTimeOwn: {
    color: 'rgba(255,200,200,0.6)',
    fontSize: 10,
  },
  bubbleTimeOther: { color: 'rgba(255,255,255,0.35)' },
  checkSent: {
    color: 'rgba(255,200,200,0.55)',
    fontSize: 11,
    fontWeight: '700',
  },
  checkRead: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 11,
    fontWeight: '700',
  },

  // Lock warning
  lockWarning: {
    backgroundColor: 'rgba(246,193,106,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(246,193,106,0.3)',
    borderRadius: 10,
    marginHorizontal: 12,
    marginBottom: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  lockWarningText: {
    color: '#F6C16A',
    fontSize: 12,
    textAlign: 'center',
  },

  // Emoji picker
  emojiPanel: {
    backgroundColor: '#140008',
    borderTopWidth: 1,
    borderTopColor: 'rgba(246,193,106,0.1)',
    paddingVertical: 8,
    paddingHorizontal: 6,
  },
  emojiGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 2,
  },
  emojiBtn: { padding: 6, borderRadius: 8 },
  emojiChar: { fontSize: 24 },

  // Input bar
  inputBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#140008',
    borderTopWidth: 1,
    borderTopColor: 'rgba(246,193,106,0.1)',
    paddingHorizontal: 10,
    paddingVertical: 10,
    gap: 6,
  },
  input: {
    flex: 1,
    backgroundColor: '#1a0208',
    color: 'white',
    borderRadius: 22,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 14,
    maxHeight: 100,
    borderWidth: 1,
    borderColor: 'rgba(246,193,106,0.18)',
  },
  iconBtn: { padding: 4 },
  lockBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.07)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  lockBtnActive: {
    backgroundColor: 'rgba(246,193,106,0.15)',
    borderWidth: 1,
    borderColor: 'rgba(246,193,106,0.4)',
  },
  lockBtnIcon: { fontSize: 17 },
  sendBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#D11B1B',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendBtnDisabled: {
    backgroundColor: 'rgba(209,27,27,0.3)',
  },
});
