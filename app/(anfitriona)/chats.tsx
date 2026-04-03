import ScreenHeader from '@/components/Menu/ScreenHeader';
import { useAuth } from '@/src/context/AuthContext';
import { anfitrionaChatScreenRef } from '@/src/services/notifications';
import { getChats, type Chat } from '@/src/api/messages';
import { useRouter } from 'expo-router';
import { useEffect, useState, useCallback } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  Text,
  TouchableOpacity,
  View,
  RefreshControl,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'ahora';
  if (mins < 60) return `${mins}m`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h`;
  return `${Math.floor(hrs / 24)}d`;
}

function Avatar({ name, avatar }: { name: string; avatar: string | null }) {
  if (avatar) {
    return <Image source={{ uri: avatar }} className="w-[50px] h-[50px] rounded-full" />;
  }
  const initials = name.split(' ').map((w) => w[0]).join('').toUpperCase().slice(0, 2);
  return (
    <View className="w-[50px] h-[50px] rounded-full bg-blue-900 items-center justify-center">
      <Text className="text-white font-bold text-base">{initials}</Text>
    </View>
  );
}

export default function AnfitrianaChats() {
  const { user } = useAuth();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [chats, setChats] = useState<Chat[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadChats = useCallback(async () => {
    if (!user?.id) return;
    try {
      const data = await getChats(user.id);
      setChats(data);
    } catch {
      // silencioso
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user?.id]);

  useEffect(() => {
    anfitrionaChatScreenRef.current = true;
    return () => { anfitrionaChatScreenRef.current = false; };
  }, []);

  useEffect(() => {
    void loadChats();
  }, [loadChats]);

  function openChat(chat: Chat) {
    router.push({
      pathname: '/(anfitriona)/chat/[conversationId]' as any,
      params: {
        conversationId: chat.conversationId,
        otherUserId: chat.otherUserId,
        otherUserName: chat.otherUserName,
        otherUserAvatar: chat.otherUserAvatar ?? '',
      },
    });
  }

  return (
    <View className="flex-1 bg-[#111]">
      <ScreenHeader title="Chats" role="anfitriona" />

      {loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#ec4899" />
        </View>
      ) : chats.length === 0 ? (
        <View className="flex-1 items-center justify-center px-8">
          <Text className="text-gray-500 text-base text-center">
            No tienes conversaciones aún.{'\n'}Los clientes te escribirán desde tu perfil.
          </Text>
        </View>
      ) : (
        <FlatList
          data={chats}
          keyExtractor={(item) => item.conversationId}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => { setRefreshing(true); void loadChats(); }}
              tintColor="#ec4899"
            />
          }
          contentContainerStyle={{ paddingBottom: insets.bottom + 80 }}
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() => openChat(item)}
              className="flex-row items-center px-4 py-3 border-b border-gray-800"
              activeOpacity={0.7}
            >
              <Avatar name={item.otherUserName} avatar={item.otherUserAvatar} />

              <View className="flex-1 ml-3">
                <View className="flex-row justify-between items-center">
                  <Text className="text-white font-semibold text-[15px]">
                    {item.otherUserName}
                  </Text>
                  <Text className="text-gray-500 text-xs">{timeAgo(item.lastMessageAt)}</Text>
                </View>
                <View className="flex-row justify-between items-center mt-[3px]">
                  <Text
                    className={`text-[13px] flex-1 ${item.unreadCount > 0 ? 'text-gray-300' : 'text-gray-500'}`}
                    numberOfLines={1}
                  >
                    {item.lastMessage ?? 'Nueva conversación'}
                  </Text>
                  {item.unreadCount > 0 && (
                    <View className="bg-pink-500 rounded-xl min-w-[20px] h-5 items-center justify-center px-[5px] ml-2">
                      <Text className="text-white text-[11px] font-bold">{item.unreadCount}</Text>
                    </View>
                  )}
                </View>
              </View>
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  );
}
