import { API_URL } from "../config";
import type { User } from "./auth";

export type CreateAnfitrionaInput = {
  firstName: string;
  lastName: string;
  phoneNumber: string;
  dateOfBirth: string;
  cedula: string;
  username: string;
  email?: string;
  idDoc?: {
    uri: string;
    name: string;
    type: string;
  };
};

export type CreateAnfitrionaResponse = {
  user: User;
  profile: {
    userId: string;
    dateOfBirth: string;
    cedula: string;
    username: string;
    idDocUrl: string | null;
    idDocPublicId: string | null;
  };
};

function safeJsonParse(text: string) {
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

export async function createAnfitriona(
  input: CreateAnfitrionaInput,
  accessToken: string,
): Promise<CreateAnfitrionaResponse> {
  const formData = new FormData();
  formData.append("firstName", input.firstName);
  formData.append("lastName", input.lastName);
  formData.append("phoneNumber", input.phoneNumber);
  formData.append("dateOfBirth", input.dateOfBirth);
  formData.append("cedula", input.cedula);
  formData.append("username", input.username);
  if (input.email) {
    formData.append("email", input.email);
  }
  if (input.idDoc) {
    formData.append(
      "idDoc",
      {
        uri: input.idDoc.uri,
        name: input.idDoc.name,
        type: input.idDoc.type,
      } as unknown as Blob,
    );
  }

  const response = await fetch(`${API_URL}/anfitrionas`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    body: formData,
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

  return data as CreateAnfitrionaResponse;
}
