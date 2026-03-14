import apiClient from './client';

export type MyProfileData = {
  id: string;
  firstName: string | null;
  lastName: string | null;
  username: string;
  bio: string;
  rateCredits: number;
  isOnline: boolean;
  avatarUrl: string | null;
};

export type UpdateProfilePayload = {
  firstName?: string;
  lastName?: string;
  username?: string;
  bio?: string;
  rateCredits?: number;
};

// GET /anfitrionas/me/profile
export const apiGetMyProfile = async (): Promise<MyProfileData> => {
  const response = await apiClient.get('/anfitrionas/me/profile');
  return response.data;
};

// PATCH /anfitrionas/me/profile
// Acepta campos de texto y un avatar opcional (multipart/form-data)
export const apiUpdateMyProfile = async (
  payload: UpdateProfilePayload,
  avatarFile?: { uri: string; name: string; type: string },
): Promise<MyProfileData> => {
  const formData = new FormData();

  if (payload.firstName !== undefined) formData.append('firstName', payload.firstName);
  if (payload.lastName !== undefined) formData.append('lastName', payload.lastName);
  if (payload.username !== undefined) formData.append('username', payload.username);
  if (payload.bio !== undefined) formData.append('bio', payload.bio);
  if (payload.rateCredits !== undefined)
    formData.append('rateCredits', String(payload.rateCredits));

  if (avatarFile) {
    formData.append('avatar', {
      uri: avatarFile.uri,
      name: avatarFile.name,
      type: avatarFile.type,
    } as any);
  }

  const response = await apiClient.patch('/anfitrionas/me/profile', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};
