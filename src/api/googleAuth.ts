import axios from "axios";
import { API_URL } from "../config";

export async function apiGoogleLoginCliente(idToken: string) {
  const res = await axios.post(`${API_URL}/auth/google-login`, { idToken });
  return res.data as { access_token: string; user: any };
}

export async function apiGoogleLoginAnfitriona(idToken: string) {
  const res = await axios.post(`${API_URL}/auth/google-login-anfitriona`, { idToken });
  return res.data as { access_token: string; user: any };
}

export async function apiCompleteGoogleAnfitrioneProfile(
  data: { firstName: string; lastName: string; username: string; cedula: string; dateOfBirth: string; referralCode?: string },
  idDocFile: { uri: string; name: string; type: string } | null,
  token: string,
) {
  const formData = new FormData();
  formData.append("firstName", data.firstName);
  formData.append("lastName", data.lastName);
  formData.append("username", data.username);
  formData.append("cedula", data.cedula);
  formData.append("dateOfBirth", data.dateOfBirth);
  if (data.referralCode) formData.append("referralCode", data.referralCode);
  if (idDocFile) {
    formData.append("idDoc", { uri: idDocFile.uri, name: idDocFile.name, type: idDocFile.type } as any);
  }
  const res = await axios.post(`${API_URL}/auth/complete-google-anfitriona-profile`, formData, {
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "multipart/form-data" },
  });
  return res.data as { access_token: string; user: any };
}

export async function apiSetPassword(
  data: { password: string; confirmPassword: string },
  token: string,
) {
  const res = await axios.post(`${API_URL}/auth/set-password`, data, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data as { message: string };
}

export async function apiCompleteGoogleClientProfile(
  data: { firstName: string; lastName?: string; phoneNumber?: string; password: string; confirmPassword: string },
  token: string,
) {
  const res = await axios.post(`${API_URL}/auth/complete-google-client-profile`, data, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data as { access_token: string; user: any };
}
