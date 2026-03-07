import AsyncStorage from "@react-native-async-storage/async-storage";
import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";
import type { User } from "../services/auth";

const ACCESS_TOKEN_KEY = "pacha.accessToken";
const USER_KEY = "pacha.user";
const TEMP_TOKEN_KEY = "pacha.tempToken";

export async function setAccessToken(token: string) {
  if (Platform.OS === "web") {
    await AsyncStorage.setItem(ACCESS_TOKEN_KEY, token);
    return;
  }
  await SecureStore.setItemAsync(ACCESS_TOKEN_KEY, token);
}

export async function getAccessToken() {
  if (Platform.OS === "web") {
    return AsyncStorage.getItem(ACCESS_TOKEN_KEY);
  }
  return SecureStore.getItemAsync(ACCESS_TOKEN_KEY);
}

export async function removeAccessToken() {
  if (Platform.OS === "web") {
    await AsyncStorage.removeItem(ACCESS_TOKEN_KEY);
    return;
  }
  await SecureStore.deleteItemAsync(ACCESS_TOKEN_KEY);
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
  if (Platform.OS === "web") {
    await AsyncStorage.setItem(TEMP_TOKEN_KEY, token);
    return;
  }
  await SecureStore.setItemAsync(TEMP_TOKEN_KEY, token);
}

export async function getTempToken() {
  if (Platform.OS === "web") {
    return AsyncStorage.getItem(TEMP_TOKEN_KEY);
  }
  return SecureStore.getItemAsync(TEMP_TOKEN_KEY);
}

export async function removeTempToken() {
  if (Platform.OS === "web") {
    await AsyncStorage.removeItem(TEMP_TOKEN_KEY);
    return;
  }
  await SecureStore.deleteItemAsync(TEMP_TOKEN_KEY);
}
