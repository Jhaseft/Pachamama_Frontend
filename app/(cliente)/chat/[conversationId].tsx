import { useAuth } from '@/src/context/AuthContext';
import { activeChatRef } from '@/src/services/notifications';
import {
  getMessages,
  markAsRead,
  sendMessageHttp,
  unlockMessage,
  type Message,
} from '@/src/api/messages';
import { apiGetPublicServicePrices, type ServicePrice } from '@/src/api/servicePrices';
import { useSocket } from '@/hooks/useSocket';
import { Ionicons } from '@expo/vector-icons';
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

export default function ChatScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const listRef = useRef<FlatList>(null);

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
  const [activeConversationId, setActiveConversationId] = useState(
    conversationId !== 'new' ? conversationId : null,
  );
  const [kavKey, setKavKey] = useState(0);
  const [servicePrices, setServicePrices] = useState<ServicePrice[]>([]);
  const [showEmoji, setShowEmoji] = useState(false);
  const inputRef = useRef<TextInput>(null);

  useEffect(() => {
    if (!otherUserId) return;
    apiGetPublicServicePrices(otherUserId)
      .then(setServicePrices)
      .catch(() => {});
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
    router.push({
      pathname: '/(cliente)/anfitrionas/[id]/verperfil' as any,
      params: { id: otherUserId },
    });
  }

  const { onNewMessage } = useSocket(user?.id);

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
    if (activeConversationId) activeChatRef.current = activeConversationId;
    return () => { activeChatRef.current = null; };
  }, [activeConversationId]);

  useEffect(() => {
    if (activeConversationId && user?.id) void markAsRead(activeConversationId, user.id);
  }, [activeConversationId]);

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
      isLocked: false,
      price: null,
      isUnlocked: false,
      createdAt: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, tempMsg]);
    scrollToEnd();

    try {
      const msg = await sendMessageHttp(user.id, otherUserId, trimmed);
      // Reemplazar el mensaje temporal con el real del servidor
      setMessages((prev) => prev.map((m) => m.id === tempId ? msg : m));
      setActiveConversationId(msg.conversationId);
    } catch {
      setText(trimmed);
      setMessages((prev) => prev.filter((m) => m.id !== tempId));
    } finally {
      setSending(false);
    }
  }

  async function handleUnlock(messageId: string, price: number) {
    Alert.alert(
      'Desbloquear mensaje',
      `¿Quieres desbloquear este mensaje por ${price} crédito${price !== 1 ? 's' : ''}?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: `Desbloquear (${price} créditos)`,
          onPress: async () => {
            setUnlocking(messageId);
            try {
              const result = await unlockMessage(messageId);
              setMessages((prev) =>
                prev.map((m) =>
                  m.id === messageId
                    ? { ...m, text: result.text, isLocked: false, isUnlocked: true }
                    : m,
                ),
              );
            } catch (e: any) {
              Alert.alert('Error', e?.message ?? 'No se pudo desbloquear el mensaje');
            } finally {
              setUnlocking(null);
            }
          },
        },
      ],
    );
  }

  const msgPrice = getPrice('MESSAGE' as ServicePrice['serviceType']);

  const EMOJIS = [
    '😀','😂','🥰','😍','😘','😋','🤩','😊','😏','🥺',
    '😭','😤','🤣','🙄','💀','🔥','💯','👀','😈','🤦',
    '❤️','🧡','💛','💚','💙','💜','💕','💋','🫶','🙏',
    '👋','👍','🙌','💪','🎉','🌹','🌸','✨','💫','⭐',
  ];

  function insertEmoji(emoji: string) {
    setText((prev) => prev + emoji);
    inputRef.current?.focus();
  }

  function toggleEmoji() {
    setShowEmoji((v) => !v);
    if (showEmoji) {
      inputRef.current?.focus();
    }
  }

  // Agrupar mensajes con separadores de fecha
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

  return (
    <View style={styles.root}>
      <Stack.Screen options={{ headerShown: false }} />

      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color="white" />
        </TouchableOpacity>

        {/* Avatar + nombre */}
        <TouchableOpacity onPress={goToProfile} style={styles.headerInfo} activeOpacity={0.75}>
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
            <Text style={styles.headerStatus}>Ver perfil</Text>
          </View>
        </TouchableOpacity>

        {/* Llamada / Video */}
        <View style={styles.headerActions}>
          <TouchableOpacity
            onPress={() => handleCall('CALL')}
            disabled={getPrice('CALL') === null}
            activeOpacity={0.7}
            style={[styles.callBtn, getPrice('CALL') === null && { opacity: 0.35 }]}
          >
            <Ionicons name="call" size={18} color="#4ade80" />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => handleCall('VIDEO_CALL')}
            disabled={getPrice('VIDEO_CALL') === null}
            activeOpacity={0.7}
            style={[styles.callBtn, getPrice('VIDEO_CALL') === null && { opacity: 0.35 }]}
          >
            <Ionicons name="videocam" size={20} color="#818cf8" />
          </TouchableOpacity>
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
              // Separador de fecha
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
              const lockedAndNotUnlocked = msg.isLocked && !isOwn && !msg.isUnlocked;

              return (
                <View style={[styles.msgRow, isOwn ? styles.msgRowOwn : styles.msgRowOther]}>
                  {lockedAndNotUnlocked ? (
                    <View style={styles.lockedBubble}>
                      <View style={styles.lockedTop}>
                        <Text style={styles.lockIcon}>🔒</Text>
                        <Text style={styles.lockedTitle}>Mensaje exclusivo</Text>
                      </View>
                      {msg.price != null && (
                        <Text style={styles.lockedHint} numberOfLines={2}>
                          Desbloquea para leer este mensaje
                        </Text>
                      )}
                      <TouchableOpacity
                        onPress={() => handleUnlock(msg.id, msg.price!)}
                        disabled={unlocking === msg.id}
                        style={styles.unlockBtn}
                      >
                        {unlocking === msg.id ? (
                          <ActivityIndicator size="small" color="white" />
                        ) : (
                          <Text style={styles.unlockBtnText}>
                            Desbloquear por {msg.price} crédito{msg.price !== 1 ? 's' : ''}
                          </Text>
                        )}
                      </TouchableOpacity>
                      <Text style={styles.lockedTime}>{formatTime(msg.createdAt)}</Text>
                    </View>
                  ) : (
                    <View style={[styles.bubble, isOwn ? styles.bubbleOwn : styles.bubbleOther]}>
                      {msg.isUnlocked && (
                        <Text style={styles.unlockedBadge}>🔓 Desbloqueado</Text>
                      )}
                      <Text style={styles.bubbleText}>{msg.text}</Text>
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
                  )}
                </View>
              );
            }}
          />
        )}

        {/* Emoji picker panel */}
        {showEmoji && (
          <View style={styles.emojiPanel}>
            <ScrollView horizontal={false} showsVerticalScrollIndicator={false} style={{ maxHeight: 140 }}>
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
            placeholder={msgPrice != null ? `Enviar mensaje – ${msgPrice} cr.` : 'Escribe un mensaje...'}
            placeholderTextColor="rgba(246,193,106,0.5)"
            multiline
            style={styles.input}
          />

          <TouchableOpacity style={styles.inputIcon} onPress={toggleEmoji}>
            <Ionicons
              name={showEmoji ? 'happy' : 'happy-outline'}
              size={22}
              color={showEmoji ? '#F6C16A' : 'rgba(255,255,255,0.45)'}
            />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleSend}
            disabled={!text.trim() || sending}
            style={[styles.sendBtn, (!text.trim() || sending) && styles.sendBtnDisabled]}
          >
            <Text style={styles.sendBtnText} numberOfLines={1} adjustsFontSizeToFit>
              {msgPrice != null ? `Enviar (${msgPrice} cr.)` : 'Enviar'}
            </Text>
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
  backBtn: {
    padding: 4,
  },
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
  avatarImg: {
    width: '100%',
    height: '100%',
  },
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
  headerStatus: {
    color: 'rgba(246,193,106,0.6)',
    fontSize: 12,
    marginTop: 2,
  },
  headerActions: {
    flexDirection: 'row',
    gap: 8,
  },
  callBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(255,255,255,0.07)',
    alignItems: 'center',
    justifyContent: 'center',
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

  // Message list
  messageList: {
    paddingHorizontal: 14,
    paddingVertical: 12,
    paddingBottom: 6,
  },

  // Date separator
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

  // Message rows
  msgRow: {
    marginBottom: 4,
  },
  msgRowOwn: {
    alignItems: 'flex-end',
  },
  msgRowOther: {
    alignItems: 'flex-start',
  },

  // Regular bubble
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
  bubbleOther: {
    backgroundColor: '#1e1010',
    borderBottomLeftRadius: 4,
  },
  unlockedBadge: {
    color: '#F6C16A',
    fontSize: 10,
    marginBottom: 3,
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
  bubbleTimeOther: {
    color: 'rgba(255,255,255,0.35)',
  },
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

  // Locked bubble
  lockedBubble: {
    maxWidth: '78%',
    backgroundColor: '#1a0208',
    borderRadius: 18,
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: 'rgba(209,27,27,0.6)',
    paddingHorizontal: 14,
    paddingVertical: 12,
    shadowColor: '#D11B1B',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 4,
  },
  lockedTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  lockIcon: {
    fontSize: 18,
  },
  lockedTitle: {
    color: 'rgba(246,193,106,0.9)',
    fontSize: 13,
    fontWeight: '700',
  },
  lockedHint: {
    color: 'rgba(255,255,255,0.45)',
    fontSize: 12,
    marginBottom: 10,
    lineHeight: 16,
  },
  unlockBtn: {
    backgroundColor: '#D11B1B',
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 14,
    alignItems: 'center',
  },
  unlockBtnText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '700',
  },
  lockedTime: {
    color: 'rgba(255,255,255,0.3)',
    fontSize: 10,
    marginTop: 6,
    textAlign: 'right',
  },

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
  inputIcon: {
    padding: 4,
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
  sendBtn: {
    backgroundColor: '#D11B1B',
    borderRadius: 22,
    paddingVertical: 10,
    paddingHorizontal: 14,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 80,
  },
  sendBtnDisabled: {
    backgroundColor: 'rgba(209,27,27,0.3)',
  },
  sendBtnText: {
    color: 'white',
    fontSize: 13,
    fontWeight: '700',
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
  emojiBtn: {
    padding: 6,
    borderRadius: 8,
  },
  emojiChar: {
    fontSize: 24,
  },
});
