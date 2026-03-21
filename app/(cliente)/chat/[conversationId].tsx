import { useAuth } from '@/src/context/AuthContext';
import {
  getMessages,
  markAsRead,
  sendMessageHttp,
  unlockMessage,
  type Message,
} from '@/src/api/messages';
import { useSocket } from '@/hooks/useSocket';
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
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

function formatTime(dateStr: string) {
  return new Date(dateStr).toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' });
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
    try {
      const msg = await sendMessageHttp(user.id, otherUserId, trimmed);
      setMessages((prev) => [...prev, msg]);
      setActiveConversationId(msg.conversationId);
      scrollToEnd();
    } catch {
      setText(trimmed);
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

  return (
    <View className="flex-1 bg-[#111]">
      <Stack.Screen options={{ headerShown: false }} />

      <View
        className="flex-row items-center bg-[#1a1a1a] border-b border-gray-800"
        style={{ paddingTop: insets.top + 8, paddingBottom: 12, paddingHorizontal: 16 }}
      >
        <TouchableOpacity onPress={() => router.back()} className="mr-3">
          <Text className="text-pink-400 text-2xl">←</Text>
        </TouchableOpacity>

        {otherUserAvatar ? (
          <Image
            source={{ uri: otherUserAvatar }}
            className="w-[38px] h-[38px] rounded-full mr-[10px]"
          />
        ) : (
          <View className="w-[38px] h-[38px] rounded-full bg-red-900 items-center justify-center mr-[10px]">
            <Text className="text-white font-bold">
              {(otherUserName ?? 'U')[0].toUpperCase()}
            </Text>
          </View>
        )}

        <Text className="text-white font-semibold text-base">
          {otherUserName ?? 'Chat'}
        </Text>
      </View>

      <KeyboardAvoidingView
        key={kavKey}
        className="flex-1"
        behavior="padding"
        keyboardVerticalOffset={0}
      >
        {loading ? (
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator size="large" color="#ec4899" />
          </View>
        ) : (
          <FlatList
            ref={listRef}
            data={messages}
            keyExtractor={(item) => item.id}
            contentContainerStyle={{ padding: 16, paddingBottom: 8 }}
            onContentSizeChange={scrollToEnd}
            ListEmptyComponent={
              <View className="items-center mt-16">
                <Text className="text-gray-500 text-sm">Inicia la conversación</Text>
              </View>
            }
            renderItem={({ item }) => {
              const isOwn = item.senderId === user?.id;
              const lockedAndNotUnlocked = item.isLocked && !isOwn && !item.isUnlocked;

              return (
                <View className={`mb-2 ${isOwn ? 'items-end' : 'items-start'}`}>
                  {lockedAndNotUnlocked ? (
                    
                    <View
                      style={{
                        maxWidth: '75%',
                        backgroundColor: '#1a1228',
                        borderRadius: 16,
                        borderBottomLeftRadius: 4,
                        borderWidth: 1,
                        borderColor: '#7c3aed',
                        paddingHorizontal: 14,
                        paddingVertical: 10,
                      }}
                    >
                      <View className="flex-row items-center gap-2 mb-2">
                        <Text className="text-lg">🔒</Text>
                        <Text className="text-violet-300 text-sm font-semibold">
                          Mensaje bloqueado
                        </Text>
                      </View>
                      {item.price != null && (
                        <Text className="text-gray-400 text-xs mb-3">
                          Desbloquea por{' '}
                          <Text className="text-yellow-400 font-bold">{item.price} créditos</Text>
                        </Text>
                      )}
                      <TouchableOpacity
                        onPress={() => handleUnlock(item.id, item.price!)}
                        disabled={unlocking === item.id}
                        className="bg-violet-600 rounded-xl py-2 items-center"
                      >
                        {unlocking === item.id ? (
                          <ActivityIndicator size="small" color="white" />
                        ) : (
                          <Text className="text-white text-sm font-semibold">
                            Desbloquear 🔓
                          </Text>
                        )}
                      </TouchableOpacity>
                      <Text className="text-gray-600 text-[10px] mt-2 text-right">
                        {formatTime(item.createdAt)}
                      </Text>
                    </View>
                  ) : (
                    
                    <View
                      style={{
                        maxWidth: '75%',
                        backgroundColor: isOwn ? '#be185d' : '#1f2937',
                        borderRadius: 16,
                        borderBottomRightRadius: isOwn ? 4 : 16,
                        borderBottomLeftRadius: isOwn ? 16 : 4,
                        paddingHorizontal: 14,
                        paddingVertical: 8,
                      }}
                    >
                      {item.isUnlocked && (
                        <Text className="text-yellow-400 text-[11px] mb-1">🔓 Desbloqueado</Text>
                      )}
                      <Text className="text-white text-[15px]">{item.text}</Text>
                      <Text
                        className={`text-[10px] mt-[3px] text-right ${isOwn ? 'text-pink-200' : 'text-gray-500'}`}
                      >
                        {formatTime(item.createdAt)}
                      </Text>
                    </View>
                  )}
                </View>
              );
            }}
          />
        )}

        <View
          className="flex-row items-end bg-[#1a1a1a] border-t border-gray-800 px-3 gap-2"
          style={{ paddingVertical: 10 }}
        >
          <TextInput
            value={text}
            onChangeText={setText}
            placeholder="Escribe un mensaje..."
            placeholderTextColor="#6b7280"
            multiline
            className="flex-1 bg-[#111] text-white rounded-[22px] px-4 py-[10px] text-[15px] border border-gray-700"
            style={{ maxHeight: 100 }}
          />
          <TouchableOpacity
            onPress={handleSend}
            disabled={!text.trim() || sending}
            className={`w-11 h-11 rounded-full items-center justify-center ${text.trim() ? 'bg-pink-500' : 'bg-gray-700'}`}
          >
            {sending ? (
              <ActivityIndicator size="small" color="white" />
            ) : (
              <Text className="text-white text-lg">↑</Text>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}
