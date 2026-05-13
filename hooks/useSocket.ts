import { useCallback, useEffect, useMemo, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { API_URL } from '../src/config';
import type { Message } from '../src/api/messages';

export interface UserPresenceEvent {
  userId: string;
  isOnline: boolean;
  lastActiveAt: string | null;
}

export function useSocket(userId: string | null | undefined) {
  const socketRef = useRef<Socket | null>(null);
  const newMessageListenersRef = useRef(new Set<(msg: Message) => void>());
  const messageSentListenersRef = useRef(new Set<(msg: Message) => void>());
  const userPresenceListenersRef = useRef(
    new Set<(event: UserPresenceEvent) => void>(),
  );

  useEffect(() => {
    if (!userId) return;

    const socket = io(API_URL, { transports: ['websocket'] });
    socketRef.current = socket;

    for (const cb of newMessageListenersRef.current) {
      socket.on('new_message', cb);
    }
    for (const cb of messageSentListenersRef.current) {
      socket.on('message_sent', cb);
    }
    for (const cb of userPresenceListenersRef.current) {
      socket.on('user_presence', cb);
    }

    socket.on('connect', () => {
      socket.emit('register', userId);
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [userId]);

  const sendMessage = useCallback((receiverId: string, text: string, senderId: string) => {
    socketRef.current?.emit('send_message', { senderId, receiverId, text });
  }, []);

  const onNewMessage = useCallback((callback: (msg: Message) => void) => {
    newMessageListenersRef.current.add(callback);
    socketRef.current?.on('new_message', callback);
    return () => {
      newMessageListenersRef.current.delete(callback);
      socketRef.current?.off('new_message', callback);
    };
  }, []);

  const onMessageSent = useCallback((callback: (msg: Message) => void) => {
    messageSentListenersRef.current.add(callback);
    socketRef.current?.on('message_sent', callback);
    return () => {
      messageSentListenersRef.current.delete(callback);
      socketRef.current?.off('message_sent', callback);
    };
  }, []);

  const onUserPresence = useCallback((callback: (event: UserPresenceEvent) => void) => {
    userPresenceListenersRef.current.add(callback);
    socketRef.current?.on('user_presence', callback);
    return () => {
      userPresenceListenersRef.current.delete(callback);
      socketRef.current?.off('user_presence', callback);
    };
  }, []);

  return useMemo(
    () => ({ sendMessage, onNewMessage, onMessageSent, onUserPresence }),
    [sendMessage, onNewMessage, onMessageSent, onUserPresence],
  );
}
