import ScreenHeader from '@/components/Menu/ScreenHeader';
import { useAuth } from '@/src/context/AuthContext';
import { anfitrionaChatScreenRef } from '@/src/services/notifications';
import { getChats, type Chat } from '@/src/api/messages';
import { getClientsForAnfitriana, type ClientForAnfitriana } from '@/src/api/anfitrionaClients';
import { formatPresence } from '@/src/utils/formatPresence';
import { useSocket } from '@/hooks/useSocket';
import { useRouter } from 'expo-router';
import { useEffect, useState, useCallback, useRef } from 'react';
import {
  ActivityIndicator,
  Animated,
  Easing,
  FlatList,
  Image,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
  RefreshControl,
  StyleSheet,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const noImage = require('../../assets/no_image.jpg');

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'ahora';
  if (mins < 60) return `${mins}m`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h`;
  return `${Math.floor(hrs / 24)}d`;
}

function GoldAvatar({ name, avatar }: { name: string; avatar: string | null }) {
  const spin = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.timing(spin, {
        toValue: 1,
        duration: 4000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();
  }, [spin]);

  const rotate = spin.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });

  return (
    <View style={styles.avatarWrapper}>
      <Animated.View style={[styles.borderSpin, { transform: [{ rotate }] }]}>
        <LinearGradient
          colors={['#F6C16A', '#FFE5A0', '#C9933A', '#8B5E1A', '#F6C16A']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{ flex: 1 }}
        />
      </Animated.View>
      <View style={styles.avatarInner}>
        <Image
          source={avatar ? { uri: avatar } : noImage}
          style={styles.avatarImage}
          resizeMode="cover"
        />
      </View>
    </View>
  );
}

function ChatRow({
  item,
  presenceText,
  onPress,
}: {
  item: Chat;
  presenceText: string | null;
  onPress: () => void;
}) {
  const isOnline = presenceText === 'En línea';

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.75}>
      <View style={styles.chatRow}>
        <View>
          <GoldAvatar name={item.otherUserName} avatar={item.otherUserAvatar} />
          {isOnline && <View style={styles.onlineDot} />}
        </View>

        <View style={styles.chatInfo}>
          <View style={styles.chatRowTop}>
            <Text style={styles.chatName} numberOfLines={1}>{item.otherUserName}</Text>
            <Text style={styles.chatTime}>{timeAgo(item.lastMessageAt)}</Text>
          </View>

          {presenceText ? (
            <Text style={[styles.presenceText, isOnline && styles.presenceTextOnline]}>
              {presenceText}
            </Text>
          ) : null}

          <View style={styles.chatRowBottom}>
            <Text
              style={[styles.chatLastMsg, item.unreadCount > 0 && styles.chatLastMsgUnread]}
              numberOfLines={1}
            >
              {item.lastMessage ?? 'Nueva conversación'}
            </Text>
            {item.unreadCount > 0 && (
              <View style={styles.unreadBadge}>
                <Text style={styles.unreadText}>{item.unreadCount}</Text>
              </View>
            )}
          </View>

          {item.unreadCount > 0 && (
            <View style={styles.unreadPill}>
              <Text style={styles.unreadPillText}>
                {item.unreadCount} mensaje{item.unreadCount !== 1 ? 's' : ''} sin leer
              </Text>
            </View>
          )}
        </View>
      </View>
      <View style={styles.separator} />
    </TouchableOpacity>
  );
}

type FilterTab = 'conversations' | 'all' | 'online' | 'recent';

const FILTERS: { key: FilterTab; label: string }[] = [
  { key: 'conversations', label: 'Conversaciones' },
  { key: 'all', label: 'Todos' },
  { key: 'online', label: 'En línea' },
  { key: 'recent', label: 'Recientes' },
];

function ClientRow({
  item,
  presenceText,
  onPress,
}: {
  item: ClientForAnfitriana;
  presenceText: string | null;
  onPress: () => void;
}) {
  const isOnline = presenceText === 'En línea';
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const noImg = require('../../assets/no_image.jpg');

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.75}>
      <View style={styles.chatRow}>
        <View>
          <View style={[styles.clientAvatarWrapper]}>
            <Image
              source={item.avatar ? { uri: item.avatar } : noImg}
              style={styles.avatarImage}
              resizeMode="cover"
            />
          </View>
          {isOnline && <View style={styles.onlineDot} />}
        </View>

        <View style={styles.chatInfo}>
          <View style={styles.chatRowTop}>
            <Text style={styles.chatName} numberOfLines={1}>{item.name}</Text>
            {item.hasConversation && (
              <View style={styles.existingConvBadge}>
                <Text style={styles.existingConvText}>Chat activo</Text>
              </View>
            )}
          </View>
          {presenceText ? (
            <Text style={[styles.presenceText, isOnline && styles.presenceTextOnline]}>
              {presenceText}
            </Text>
          ) : null}
        </View>
      </View>
      <View style={styles.separator} />
    </TouchableOpacity>
  );
}

export default function AnfitrianaChats() {
  const { user } = useAuth();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const socket = useSocket(user?.id);

  const [activeFilter, setActiveFilter] = useState<FilterTab>('conversations');

  const [chats, setChats] = useState<Chat[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [clients, setClients] = useState<ClientForAnfitriana[]>([]);
  const [clientsLoading, setClientsLoading] = useState(false);
  const [clientsCursor, setClientsCursor] = useState<string | null>(null);
  const [clientsLoadingMore, setClientsLoadingMore] = useState(false);

  // userId → { isOnline, lastActiveAt }
  const [presenceMap, setPresenceMap] = useState<
    Record<string, { isOnline: boolean; lastActiveAt: string | null }>
  >({});

  const loadChats = useCallback(async () => {
    if (!user?.id) return;
    try {
      const data = await getChats(user.id);
      setChats(data);
      // Seed presenceMap from HTTP data on first load
      const seed: Record<string, { isOnline: boolean; lastActiveAt: string | null }> = {};
      for (const c of data) {
        seed[c.otherUserId] = {
          isOnline: false,
          lastActiveAt: c.otherUserLastActiveAt ?? null,
        };
      }
      setPresenceMap((prev) => ({ ...seed, ...prev }));
    } catch {
      // silencioso
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user?.id]);

  const loadClients = useCallback(async (cursor?: string) => {
    if (!user?.id) return;
    if (!cursor) setClientsLoading(true);
    else setClientsLoadingMore(true);
    try {
      const res = await getClientsForAnfitriana(cursor);
      setClients((prev) => cursor ? [...prev, ...res.data] : res.data);
      setClientsCursor(res.nextCursor);
    } catch {
      // silencioso
    } finally {
      setClientsLoading(false);
      setClientsLoadingMore(false);
    }
  }, [user?.id]);

  useEffect(() => {
    anfitrionaChatScreenRef.current = true;
    return () => { anfitrionaChatScreenRef.current = false; };
  }, []);

  useEffect(() => { void loadChats(); }, [loadChats]);

  useEffect(() => {
    if (activeFilter !== 'conversations') {
      void loadClients();
    }
  }, [activeFilter, loadClients]);

  // Subscribe to real-time presence events
  useEffect(() => {
    const unsub = socket.onUserPresence((event) => {
      setPresenceMap((prev) => ({
        ...prev,
        [event.userId]: {
          isOnline: event.isOnline,
          lastActiveAt: event.lastActiveAt,
        },
      }));
    });
    return unsub;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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

  function openClientChat(client: ClientForAnfitriana) {
    router.push({
      pathname: '/(anfitriona)/chat/[conversationId]' as any,
      params: {
        conversationId: client.conversationId ?? 'new',
        otherUserId: client.id,
        otherUserName: client.name,
        otherUserAvatar: client.avatar ?? '',
      },
    });
  }

  // Lista unificada: convierte chats en ClientForAnfitriana y los mezcla con
  // clients del API sin duplicar. Necesaria porque presenceMap solo recibe
  // WS events de socios de conversación — si esperamos solo a `clients` del
  // API, los usuarios que ya están en `chats` podrían no pasar el filtro
  // cuando el evento WS llegó antes del cambio de tab.
  function buildUnified(): ClientForAnfitriana[] {
    const fromChats: ClientForAnfitriana[] = chats.map((c) => ({
      id: c.otherUserId,
      name: c.otherUserName,
      avatar: c.otherUserAvatar,
      lastActiveAt: c.otherUserLastActiveAt ?? null,
      hasConversation: true,
      conversationId: c.conversationId,
    }));
    const chatIds = new Set(chats.map((c) => c.otherUserId));
    const clientsOnly = clients.filter((c) => !chatIds.has(c.id));
    return [...fromChats, ...clientsOnly];
  }

  function getFilteredClients(): ClientForAnfitriana[] {
    if (activeFilter === 'online') {
      return buildUnified().filter((c) => presenceMap[c.id]?.isOnline === true);
    }
    if (activeFilter === 'recent') {
      const cutoff = Date.now() - 7 * 24 * 60 * 60 * 1000;
      return buildUnified().filter((c) => {
        const p = presenceMap[c.id];
        const ts = p?.lastActiveAt ?? c.lastActiveAt;
        return ts ? new Date(ts).getTime() > cutoff : false;
      });
    }
    return clients;
  }

  const filteredClients = getFilteredClients();

  return (
    <View style={{ flex: 1, backgroundColor: '#0d0000' }}>
      <ScreenHeader title="Chats" role="anfitriona" />

      <LinearGradient
        colors={['#1a0000', '#0d0000']}
        style={StyleSheet.absoluteFill}
        pointerEvents="none"
      />

      {/* Filter pills */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filterBar}
        contentContainerStyle={styles.filterBarContent}
      >
        {FILTERS.map((f) => (
          <TouchableOpacity
            key={f.key}
            onPress={() => setActiveFilter(f.key)}
            style={[styles.filterPill, activeFilter === f.key && styles.filterPillActive]}
          >
            <Text style={[styles.filterPillText, activeFilter === f.key && styles.filterPillTextActive]}>
              {f.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {activeFilter === 'conversations' ? (
        loading ? (
          <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
            <ActivityIndicator size="large" color="#F6C16A" />
          </View>
        ) : chats.length === 0 ? (
          <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32 }}>
            <MaterialCommunityIcons name="chat-outline" size={56} color="rgba(246,193,106,0.3)" />
            <Text style={{ color: 'rgba(255,255,255,0.4)', fontSize: 15, textAlign: 'center', marginTop: 16 }}>
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
                tintColor="#F6C16A"
              />
            }
            contentContainerStyle={{ paddingBottom: insets.bottom + 80, paddingTop: 8 }}
            renderItem={({ item }) => {
              const presence = presenceMap[item.otherUserId];
              const presenceText = formatPresence(
                presence?.isOnline ?? false,
                presence?.lastActiveAt ?? item.otherUserLastActiveAt,
              );
              return (
                <ChatRow
                  item={item}
                  presenceText={presenceText}
                  onPress={() => openChat(item)}
                />
              );
            }}
          />
        )
      ) : (
        clientsLoading && filteredClients.length === 0 ? (
          <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
            <ActivityIndicator size="large" color="#F6C16A" />
          </View>
        ) : filteredClients.length === 0 ? (
          <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32 }}>
            <MaterialCommunityIcons name="account-group-outline" size={56} color="rgba(246,193,106,0.3)" />
            <Text style={{ color: 'rgba(255,255,255,0.4)', fontSize: 15, textAlign: 'center', marginTop: 16 }}>
              No hay clientes disponibles.
            </Text>
          </View>
        ) : (
          <FlatList
            data={filteredClients}
            keyExtractor={(item) => item.id}
            contentContainerStyle={{ paddingBottom: insets.bottom + 80, paddingTop: 8 }}
            onEndReached={() => {
              if (clientsCursor && !clientsLoadingMore) {
                void loadClients(clientsCursor);
              }
            }}
            onEndReachedThreshold={0.3}
            ListFooterComponent={
              clientsLoadingMore ? (
                <ActivityIndicator color="#F6C16A" style={{ marginVertical: 16 }} />
              ) : null
            }
            renderItem={({ item }) => {
              const presence = presenceMap[item.id];
              const presenceText = formatPresence(
                presence?.isOnline ?? false,
                presence?.lastActiveAt ?? item.lastActiveAt,
              );
              return (
                <ClientRow
                  item={item}
                  presenceText={presenceText}
                  onPress={() => openClientChat(item)}
                />
              );
            }}
          />
        )
      )}
    </View>
  );
}

const AVATAR_SIZE = 62;

const styles = StyleSheet.create({
  avatarWrapper: {
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    borderRadius: AVATAR_SIZE / 2,
    overflow: 'hidden',
    padding: 2,
    position: 'relative',
  },
  borderSpin: {
    position: 'absolute',
    width: 300,
    height: 300,
    top: '50%',
    left: '50%',
    marginTop: -150,
    marginLeft: -150,
  },
  avatarInner: {
    flex: 1,
    borderRadius: AVATAR_SIZE / 2 - 2,
    overflow: 'hidden',
    backgroundColor: '#1a0208',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  chatRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 14,
  },
  chatInfo: {
    flex: 1,
    gap: 4,
  },
  chatRowTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  chatName: {
    color: 'white',
    fontSize: 16,
    fontWeight: '700',
    flex: 1,
    marginRight: 8,
  },
  chatTime: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: 12,
  },
  chatRowBottom: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  chatLastMsg: {
    color: 'rgba(255,255,255,0.45)',
    fontSize: 13,
    flex: 1,
    marginRight: 8,
  },
  chatLastMsgUnread: {
    color: 'rgba(255,255,255,0.75)',
    fontWeight: '500',
  },
  unreadBadge: {
    backgroundColor: '#D11B1B',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 5,
  },
  unreadText: {
    color: 'white',
    fontSize: 11,
    fontWeight: '800',
  },
  unreadPill: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(209,27,27,0.2)',
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(209,27,27,0.5)',
    paddingVertical: 3,
    paddingHorizontal: 10,
    marginTop: 2,
  },
  unreadPillText: {
    color: '#ff6b6b',
    fontSize: 11,
    fontWeight: '600',
  },
  separator: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.06)',
    marginLeft: 16 + AVATAR_SIZE + 14,
  },
  onlineDot: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#22c55e',
    borderWidth: 2,
    borderColor: '#0d0000',
  },
  filterBar: {
    flexGrow: 0,
    zIndex: 1,
  },
  filterBarContent: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 8,
  },
  filterPill: {
    paddingHorizontal: 16,
    paddingVertical: 7,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.07)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
  },
  filterPillActive: {
    backgroundColor: 'rgba(246,193,106,0.15)',
    borderColor: '#F6C16A',
  },
  filterPillText: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 13,
    fontWeight: '500',
  },
  filterPillTextActive: {
    color: '#F6C16A',
    fontWeight: '700',
  },
  clientAvatarWrapper: {
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    borderRadius: AVATAR_SIZE / 2,
    overflow: 'hidden',
    backgroundColor: '#1a0208',
    borderWidth: 2,
    borderColor: 'rgba(246,193,106,0.3)',
  },
  existingConvBadge: {
    backgroundColor: 'rgba(34,197,94,0.15)',
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(34,197,94,0.4)',
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  existingConvText: {
    color: '#22c55e',
    fontSize: 10,
    fontWeight: '600',
  },
  presenceText: {
    color: 'rgba(255,255,255,0.35)',
    fontSize: 11,
    marginBottom: 2,
  },
  presenceTextOnline: {
    color: '#22c55e',
    fontWeight: '600',
  },
});
