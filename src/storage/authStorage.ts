import AsyncStorage from "@react-native-async-storage/async-storage";
import type { User } from "../services/auth";

const ACCESS_TOKEN_KEY = "pacha.accessToken";
const USER_KEY = "pacha.user";
const TEMP_TOKEN_KEY = "pacha.tempToken";

export async function setAccessToken(token: string) {
  await AsyncStorage.setItem(ACCESS_TOKEN_KEY, token);
}

export async function getAccessToken() {
  return AsyncStorage.getItem(ACCESS_TOKEN_KEY);
}

export async function removeAccessToken() {
  await AsyncStorage.removeItem(ACCESS_TOKEN_KEY);
}

export async function setUser(user: User) {
  await AsyncStorage.setItem(USER_KEY, JSON.stringify(user));
}

export async function getUser(): Promise<User | null> {
  const raw = await AsyncStorage.getItem(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as User;
  } catch {
    return null;
  }
}

export async function removeUser() {
  await AsyncStorage.removeItem(USER_KEY);
}

export async function setTempToken(token: string) {
  await AsyncStorage.setItem(TEMP_TOKEN_KEY, token);
}

export async function getTempToken() {
  return AsyncStorage.getItem(TEMP_TOKEN_KEY);
}

export async function removeTempToken() {
  await AsyncStorage.removeItem(TEMP_TOKEN_KEY);
}
