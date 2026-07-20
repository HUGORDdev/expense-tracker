"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
  useCallback,
} from "react";
import { useRouter } from "next/navigation";
import { clearToken, getToken, setToken } from "@/utils/api";
import { login as loginService, register as registerService, logout as logoutService } from "@/services/authService";
import type { AuthCredentials, RegisterPayload, User } from "@/types";

interface AuthContextValue {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (credentials: AuthCredentials) => Promise<void>;
  register: (payload: RegisterPayload) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const USER_STORAGE_KEY = "expense_tracker_user";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // Restaure la session au chargement de l'application (persistance)
  useEffect(() => {
    const token = getToken();
    const storedUser = typeof window !== "undefined" ? localStorage.getItem(USER_STORAGE_KEY) : null;

    if (token && storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch {
        setUser(null);
      }
    }
    setIsLoading(false);
  }, []);

  const persistSession = useCallback((token: string, nextUser: User) => {
    setToken(token);
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(nextUser));
    setUser(nextUser);
  }, []);

  const login = useCallback(
    async (credentials: AuthCredentials) => {
      const { token, user: loggedInUser } = await loginService(credentials);
      persistSession(token, loggedInUser);
      router.push("/dashboard");
    },
    [persistSession, router]
  );

  const register = useCallback(
    async (payload: RegisterPayload) => {
      const { token, user: newUser } = await registerService(payload);
      persistSession(token, newUser);
      router.push("/dashboard");
    },
    [persistSession, router]
  );

  const logout = useCallback(async () => {
    await logoutService();
    clearToken();
    localStorage.removeItem(USER_STORAGE_KEY);
    setUser(null);
    router.push("/login");
  }, [router]);

  return (
    <AuthContext.Provider
      value={{ user, isLoading, isAuthenticated: !!user, login, register, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth doit être utilisé à l'intérieur de <AuthProvider>");
  return ctx;
}
