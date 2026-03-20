import { apiFetch } from '../services/api';

export interface Chat {
  conversationId: string;
  otherUserId: string;
  otherUserName: string;
  otherUserAvatar: string | null;
  lastMessage: string | null;
  lastMessageAt: string;
  unreadCount: number;
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  text: string;
  read: boolean;
  createdAt: string;
}

export function getChats(userId: string) {
  return apiFetch<Chat[]>(`/messages/chats?userId=${userId}`);
}

export function getMessages(conversationId: string) {
  return apiFetch<Message[]>(`/messages?conversationId=${conversationId}`);
}

export function sendMessageHttp(senderId: string, receiverId: string, text: string) {
  return apiFetch<Message>('/messages', {
    method: 'POST',
    body: JSON.stringify({ senderId, receiverId, text }),
  });
}

export function markAsRead(conversationId: string, userId: string) {
  return apiFetch<{ success: boolean }>('/messages/read', {
    method: 'POST',
    body: JSON.stringify({ conversationId, userId }),
  });
}
