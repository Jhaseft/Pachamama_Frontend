import { useAuth } from '@/src/context/AuthContext';
import { activeChatRef, anfitrionaChatScreenRef } from '@/src/services/notifications';
import {
  getMessages,
  getMyServicePrices,
  markAsRead,
  sendMessageHttp,
  type Message,
} from '@/src/api/messages';
import { useSocket } from '@/hooks/useSocket';
import { Ionicons } from '@expo/vector-icons';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  AppState,
  AppStateStatus,
  FlatList,
  Image,
  KeyboardAvoidingView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
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

  const { onNewMessage } = useSocket(user?.id);

  useEffect(() => { void loadServicePrices(); }, []);

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
    try {
      const msg = await sendMessageHttp(user.id, otherUserId, trimmed, isLocked);
      setMessages((prev) => [...prev, msg]);
      setActiveConversationId(msg.conversationId);
      setIsLocked(false);
      scrollToEnd();
    } catch {
      setText(trimmed);
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
            <Text style={styles.headerSub}>Cliente</Text>
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
                          🔒 {msg.price != null ? `${msg.price} créditos` : 'Exclusivo'}
                        </Text>
                      </View>
                    )}
                    <Text style={styles.bubbleText}>{msg.text ?? '(bloqueado)'}</Text>
                    <Text style={[styles.bubbleTime, isOwn ? styles.bubbleTimeOwn : styles.bubbleTimeOther]}>
                      {formatTime(msg.createdAt)}
                    </Text>
                  </View>
                </View>
              );
            }}
          />
        )}

        {/* Aviso: lock sin precio configurado */}
        {isLocked && messagePrice === null && (
          <View style={styles.lockWarning}>
            <Text style={styles.lockWarningText}>
              ⚠️ Configura el precio de mensajes en tu perfil para usar esta función
            </Text>
          </View>
        )}

        {/* Emoji picker */}
        {showEmoji && (
          <View style={styles.emojiPanel}>
            <ScrollView showsVerticalScrollIndicator={false} style={{ maxHeight: 140 }}>
              <View style={styles.emojiGrid}>
                {EMOJIS.map((e) => (
                  <TouchableOpacity key={e} onPress={() => insertEmoji(e)} style={styles.emojiBtn}>
                    <Text style={styles.emojiChar}>{e}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
          </View>
        )}

        {/* Input bar */}
        <View style={styles.inputBar}>
          <TextInput
            ref={inputRef}
            value={text}
            onChangeText={setText}
            onFocus={() => setShowEmoji(false)}
            placeholder="Escribe un mensaje..."
            placeholderTextColor="rgba(246,193,106,0.5)"
            multiline
            style={styles.input}
          />

          {/* Emoji */}
          <TouchableOpacity style={styles.iconBtn} onPress={toggleEmoji}>
            <Ionicons
              name={showEmoji ? 'happy' : 'happy-outline'}
              size={22}
              color={showEmoji ? '#F6C16A' : 'rgba(255,255,255,0.45)'}
            />
          </TouchableOpacity>

          {/* Lock toggle */}
          <TouchableOpacity
            style={[styles.lockBtn, isLocked && styles.lockBtnActive]}
            onPress={() => setIsLocked((v) => !v)}
          >
            <Text style={styles.lockBtnIcon}>{isLocked ? '🔒' : '🔓'}</Text>
          </TouchableOpacity>

          {/* Enviar */}
          <TouchableOpacity
            onPress={handleSend}
            disabled={sendDisabled}
            style={[styles.sendBtn, sendDisabled && styles.sendBtnDisabled]}
          >
            {sending ? (
              <ActivityIndicator size="small" color="white" />
            ) : (
              <Ionicons name="arrow-up" size={18} color="white" />
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
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
    marginTop: 2,
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
  bubbleTime: {
    fontSize: 10,
    marginTop: 3,
    textAlign: 'right',
  },
  bubbleTimeOwn: { color: 'rgba(255,200,200,0.6)' },
  bubbleTimeOther: { color: 'rgba(255,255,255,0.35)' },

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
