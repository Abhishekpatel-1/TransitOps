import { createContext, useContext, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api, sessionStore } from "@/lib/api";
import type { User, Role } from "@/types";

type AuthContextValue = {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  can: (...roles: Role[]) => boolean;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(() => sessionStore.get()?.user ?? null);
  const navigate = useNavigate();

  const value = useMemo<AuthContextValue>(() => ({
    user,
    async login(email, password) {
      const session = await api<{ user: User; accessToken: string; refreshToken: string }>("/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password })
      });
      sessionStore.set(session);
      setUser(session.user);
      navigate("/");
    },
    logout() {
      sessionStore.clear();
      setUser(null);
      navigate("/login");
    },
    can(...roles) {
      return Boolean(user && roles.includes(user.role));
    }
  }), [navigate, user]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const value = useContext(AuthContext);
  if (!value) throw new Error("useAuth must be used inside AuthProvider");
  return value;
}
