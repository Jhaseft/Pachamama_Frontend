export interface SendOtpRequest {
  email: string;
}

export interface VerifyOtpRequest {
  email: string;
  code: string;
}

export interface VerifyOtpResponse {
  needsProfile: boolean;
  tempToken: string;
}

export interface CompleteAnfitrioneRegistrationRequest {
  tempToken: string;
  firstName: string;
  lastName: string;
  referralCode?: string;
  password: string;
  confirmPassword: string;
  username: string;
  dateOfBirth: string;
  cedula: string;
  idDoc?: { uri: string; name: string; type: string };
}

export interface AnfitrioneProfile {
  id: string;
  userId: string;
  username: string;
  cedula: string;
  idDocUrl: string | null;
  idDocPublicId: string | null;
  dateOfBirth: string;
}

export interface RegisterAnfitrioneResponse {
  access_token: string;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    phoneNumber: string | null;
    email: string | null;
    role: 'ANFITRIONA';
  };
  profile: AnfitrioneProfile;
}
