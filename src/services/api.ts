import { API_URL } from "../config";
import { getAccessToken } from "../storage/authStorage";

function buildUrl(path: string) {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return `${API_URL}${normalized}`;
}

function safeJsonParse(text: string) {
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

export async function apiFetch<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const url = buildUrl(path);
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (options.headers) {
    Object.assign(headers, options.headers);
  }

  const token = await getAccessToken();
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  const rawText = await response.text();
  const data = rawText ? safeJsonParse(rawText) : null;

  if (!response.ok) {
    const rawMessage = data && (data.message || data.error);
    let message = `Error ${response.status}: solicitud fallida`;
    if (Array.isArray(rawMessage)) {
      message = rawMessage.join(", ");
    } else if (typeof rawMessage === "string") {
      message = rawMessage;
    }
    throw new Error(message);
  }

  return data as T;
}
