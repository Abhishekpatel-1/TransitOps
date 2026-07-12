import { toast } from "sonner";
import type { User } from "@/types";

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:4000/api";

type Session = { user: User; accessToken: string; refreshToken: string };

export const sessionStore = {
  get(): Session | null {
    const raw = localStorage.getItem("transitops-session");
    return raw ? JSON.parse(raw) as Session : null;
  },
  set(session: Session) {
    localStorage.setItem("transitops-session", JSON.stringify(session));
  },
  clear() {
    localStorage.removeItem("transitops-session");
  }
};

async function refreshSession() {
  const session = sessionStore.get();
  if (!session?.refreshToken) return null;
  const response = await fetch(`${API_URL}/auth/refresh`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refreshToken: session.refreshToken })
  });
  if (!response.ok) return null;
  const next = await response.json() as Session;
  sessionStore.set(next);
  return next;
}

export async function api<T>(path: string, options: RequestInit = {}, retry = true): Promise<T> {
  const session = sessionStore.get();
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(session?.accessToken ? { Authorization: `Bearer ${session.accessToken}` } : {}),
      ...options.headers
    }
  });
  if (response.status === 401 && retry) {
    const refreshed = await refreshSession();
    if (refreshed) return api<T>(path, options, false);
    sessionStore.clear();
    window.location.href = "/login";
  }
  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: "Request failed" }));
    toast.error(error.message ?? "Request failed");
    throw new Error(error.message ?? "Request failed");
  }
  if (response.status === 204) return undefined as T;
  return response.json() as Promise<T>;
}

export const apiUrl = API_URL;
