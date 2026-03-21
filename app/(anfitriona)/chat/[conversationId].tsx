import { useAuth } from '@/src/context/AuthContext';
import {
  getMessages,
  getMyServicePrices,
  markAsRead,
  sendMessageHttp,
  type Message,
} from '@/src/api/messages';
import { useSocket } from '@/hooks/useSocket';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
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

export default function AnfitrianaChat() {
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
  const [isLocked, setIsLocked] = useState(false);
  const [messagePrice, setMessagePrice] = useState<number | null>(null);
  const [activeConversationId, setActiveConversationId] = useState(
    conversationId !== 'new' ? conversationId : null,
  );
  const [kavKey, setKavKey] = useState(0);

  const { onNewMessage } = useSocket(user?.id);

  useEffect(() => {
    void loadServicePrices();
  }, []);

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

  async function loadServicePrices() {
    try {
      const prices = await getMyServicePrices();
      const msgPrice = prices.find((p) => p.serviceType === 'MESSAGE');
      if (msgPrice) setMessagePrice(msgPrice.price);
    } catch {
      // silencioso — anfitriona puede no tener precios configurados
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
          <View className="w-[38px] h-[38px] rounded-full bg-blue-900 items-center justify-center mr-[10px]">
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
              return (
                <View className={`mb-2 ${isOwn ? 'items-end' : 'items-start'}`}>
                  <View
                    style={{
                      maxWidth: '75%',
                      backgroundColor: isOwn
                        ? item.isLocked ? '#7c3aed' : '#be185d'
                        : '#1f2937',
                      borderRadius: 16,
                      borderBottomRightRadius: isOwn ? 4 : 16,
                      borderBottomLeftRadius: isOwn ? 16 : 4,
                      paddingHorizontal: 14,
                      paddingVertical: 8,
                    }}
                  >
                    {item.isLocked && (
                      <View className="flex-row items-center gap-1 mb-1">
                        <Text className="text-yellow-400 text-sm">🔒</Text>
                        {item.price != null && (
                          <Text className="text-yellow-300 text-[11px] font-semibold">
                            {item.price} créditos
                          </Text>
                        )}
                      </View>
                    )}
                    <Text className="text-white text-[15px]">{item.text ?? '(bloqueado)'}</Text>
                    <Text
                      className={`text-[10px] mt-[3px] text-right ${isOwn ? 'text-pink-200' : 'text-gray-500'}`}
                    >
                      {formatTime(item.createdAt)}
                    </Text>
                  </View>
                </View>
              );
            }}
          />
        )}

        
        {isLocked && messagePrice === null && (
          <View className="bg-yellow-900/60 px-4 py-2 mx-3 mb-1 rounded-lg">
            <Text className="text-yellow-300 text-xs text-center">
              Configura el precio de mensajes en tu perfil para usar esta función
            </Text>
          </View>
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
            onPress={() => setIsLocked((v) => !v)}
            className={`w-10 h-10 rounded-full items-center justify-center ${
              isLocked ? 'bg-violet-600' : 'bg-gray-700'
            }`}
          >
            <Text className="text-base">{isLocked ? '🔒' : '🔓'}</Text>
          </TouchableOpacity>

         
          <TouchableOpacity
            onPress={handleSend}
            disabled={!text.trim() || sending || (isLocked && messagePrice === null)}
            className={`w-11 h-11 rounded-full items-center justify-center ${
              text.trim() && !(isLocked && messagePrice === null) ? 'bg-pink-500' : 'bg-gray-700'
            }`}
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
