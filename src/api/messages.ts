import { apiFetch } from '../services/api';
import apiClient from './client';

export interface Chat {
  conversationId: string;
  otherUserId: string;
  otherUserName: string;
  otherUserAvatar: string | null;
  otherUserLastActiveAt?: string | null;
  lastMessage: string | null;
  lastMessageAt: string;
  unreadCount: number;
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  text: string | null;
  imageUrl?: string | null;
  imagePublicId?: string | null;
  read: boolean;
  isLocked: boolean;
  price: number | null;
  isUnlocked: boolean;
  createdAt: string;
}

export interface UnlockedImage {
  id: string;
  imageUrl: string;
  creditsSpent: number;
  unlockedAt: string;
}

export interface ServicePrice {
  id: string;
  serviceType: string;
  price: number;
}

export function getChats(userId: string) {
  return apiFetch<Chat[]>(`/messages/chats?userId=${userId}`);
}

export function getMessages(conversationId: string) {
  return apiFetch<Message[]>(`/messages?conversationId=${conversationId}`);
}

export function sendMessageHttp(
  senderId: string,
  receiverId: string,
  text: string,
  isLocked = false,
) {
  return apiFetch<Message>('/messages', {
    method: 'POST',
    body: JSON.stringify({ senderId, receiverId, text, isLocked }),
  });
}

export function unlockMessage(messageId: string) {
  return apiFetch<{ success: boolean; text: string }>(`/messages/${messageId}/unlock`, {
    method: 'POST',
  });
}

export function getMyServicePrices() {
  return apiFetch<ServicePrice[]>('/service-prices');
}

export function markAsRead(conversationId: string, userId: string) {
  return apiFetch<{ success: boolean }>('/messages/read', {
    method: 'POST',
    body: JSON.stringify({ conversationId, userId }),
  });
}

// POST /messages/image — solo anfitriona puede enviar imágenes
export async function sendImageHttp(
  receiverId: string,
  file: { uri: string; type: string; name: string },
  isLocked = false,
  price?: number,
): Promise<Message> {
  const form = new FormData();
  form.append('file', file as any);
  form.append('receiverId', receiverId);
  form.append('isLocked', String(isLocked));
  if (price != null) {
    console.log('[sendImageHttp] price number:', price, '| String(price):', String(price));
    form.append('price', String(price));
  }
  const res = await apiClient.post('/messages/image', form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return res.data;
}

// POST /messages/:id/unlock-image — cliente desbloquea imagen
export function unlockChatImage(messageId: string) {
  return apiFetch<{ alreadyUnlocked: boolean; imageUrl: string }>(`/messages/${messageId}/unlock-image`, {
    method: 'POST',
  });
}

// GET /messages/my-unlocked-images — galería de imágenes desbloqueadas del cliente
export function getMyUnlockedImages() {
  return apiFetch<UnlockedImage[]>('/messages/my-unlocked-images');
}
