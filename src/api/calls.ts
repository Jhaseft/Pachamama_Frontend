import { apiFetch } from '../services/api';

export function getAgoraToken(channelName: string, uid: number) {
  return apiFetch<{ token: string; appId: string }>('/calls/token', {
    method: 'POST',
    body: JSON.stringify({ channelName, uid }),
  });
}
