import { create } from "zustand";

interface User {
  id: string;
  email: string;
  name?: string;
  avatar?: string;
}

interface UserStore {
  user: User | null;
  accessToken: string | null;
  setUser: (user: User | null) => void;
  setTokens: (accessToken: string, refreshToken?: string) => void;
  logout: () => void;
  fetchUser: () => Promise<void>;
  refreshToken: () => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
}

export const useUserStore = create<UserStore>((set, get) => ({
  user: null,
  accessToken: localStorage.getItem("accessToken") || null,
  setUser: (user) => set({ user }),
  setTokens: (accessToken, refreshToken) => {
    set({ accessToken });
    localStorage.setItem("accessToken", accessToken);
    if (refreshToken) localStorage.setItem("refreshToken", refreshToken);
  },
  logout: () => {
    set({ user: null, accessToken: null });
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
  },
  fetchUser: async () => {
  const res = await fetch("http://localhost:3000/me", {
    credentials: "include",
  });

  if (!res.ok) {
    set({ user: null });
    return;
  }

  const user = await res.json();
  set({ user });
},

  refreshToken: async () => {
    try {
      const response = await fetch("http://localhost:3000/refresh", {
        method: "POST",
        credentials: "include",
      });
      if (response.ok) {
        const { accessToken } = await response.json();
        get().setTokens(accessToken);
        await get().fetchUser();
      } else {
        get().logout();
      }
    } catch (error) {
      console.error("Failed to refresh token:", error);
      get().logout();
    }
  },
  login: async (email, password) => {
    const response = await fetch("http://localhost:3000/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ email, password }),
    });
    if (response.ok) {
      const { accessToken } = await response.json();
      get().setTokens(accessToken);
      await get().fetchUser();
    } else {
      throw new Error("Login failed");
    }
  },
  register: async (name, email, password) => {
    const response = await fetch("http://localhost:3000/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password }),
    });
    if (!response.ok) {
      throw new Error("Registration failed");
    }
  },
}));
