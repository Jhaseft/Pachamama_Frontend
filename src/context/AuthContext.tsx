import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import type { User } from "../services/auth";
import {
  getAccessToken,
  getUser,
  removeAccessToken,
  removeUser,
  removeTempToken,
  setAccessToken,
  setUser,
} from "../storage/authStorage";

type AuthContextValue = {
  accessToken: string | null;
  user: User | null;
  isHydrated: boolean;
  hydrate: () => Promise<void>;
  setSession: (token: string, user: User) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [accessToken, setAccessTokenState] = useState<string | null>(null);
  const [user, setUserState] = useState<User | null>(null);
  const [isHydrated, setIsHydrated] = useState(false);

  const hydrate = useCallback(async () => {
    const [storedToken, storedUser] = await Promise.all([
      getAccessToken(),
      getUser(),
    ]);
    setAccessTokenState(storedToken ?? null);
    setUserState(storedUser ?? null);
    setIsHydrated(true);
  }, []);

  const setSession = useCallback(async (token: string, nextUser: User) => {
    await Promise.all([setAccessToken(token), setUser(nextUser)]);
    setAccessTokenState(token);
    setUserState(nextUser);
  }, []);

  const logout = useCallback(async () => {
    await Promise.all([removeAccessToken(), removeUser(), removeTempToken()]);
    setAccessTokenState(null);
    setUserState(null);
  }, []);

  useEffect(() => {
    void hydrate();
  }, [hydrate]);

  const value = useMemo(
    () => ({ accessToken, user, isHydrated, hydrate, setSession, logout }),
    [accessToken, user, isHydrated, hydrate, setSession, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth debe usarse dentro de AuthProvider");
  }
  return context;
}
