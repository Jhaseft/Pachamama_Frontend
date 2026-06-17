import { useState, useCallback } from "react";
import {
  GoogleSignin,
  statusCodes,
} from "@react-native-google-signin/google-signin";

GoogleSignin.configure({
  webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
  iosClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID,
});

export function useGoogleSignIn() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const getIdToken = useCallback(async (): Promise<string | null> => {
    setError("");
    setLoading(true);
    try {
      await GoogleSignin.hasPlayServices();
      await GoogleSignin.signOut();
      const response = await GoogleSignin.signIn();
      const idToken = response.data?.idToken ?? null;
      if (!idToken) {
        setError("No se pudo obtener el token de Google.");
        return null;
      }
      return idToken;
    } catch (err: any) {
      if (err.code === statusCodes.SIGN_IN_CANCELLED) {
        // usuario canceló, no mostrar error
      } else if (err.code === statusCodes.IN_PROGRESS) {
        setError("Inicio de sesión en progreso.");
      } else if (err.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
        setError("Google Play Services no disponible.");
      } else {
        setError("No se pudo iniciar sesión con Google.");
      }
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return { getIdToken, loading, error, setError };
}
