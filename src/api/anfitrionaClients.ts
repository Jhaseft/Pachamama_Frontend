import { apiFetch } from '../services/api';

export interface ClientForAnfitriana {
  id: string;
  name: string;
  avatar: string | null;
  lastActiveAt: string | null;
  hasConversation: boolean;
  conversationId: string | null;
}

export interface ClientsResponse {
  data: ClientForAnfitriana[];
  nextCursor: string | null;
}

export async function getClientsForAnfitriana(cursor?: string): Promise<ClientsResponse> {
  const params = new URLSearchParams();
  params.set('limit', '20');
  if (cursor) params.set('cursor', cursor);
  return apiFetch<ClientsResponse>(`/anfitrionas/clients?${params.toString()}`);
}
