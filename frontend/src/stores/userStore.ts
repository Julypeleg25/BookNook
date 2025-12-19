import { create } from "zustand";

interface User {
  _id: string;
  googleId: string;
  name: string;
  email: string;
  avatar: string;
  createdAt: string;
  __v: number;
}

interface UserStore {
  user: User | null;
  setUser: (user: User | null) => void;
  logout: () => void;
  fetchUser: () => Promise<void>;
}

export const useUserStore = create<UserStore>((set) => ({
  user: null,
  setUser: (user) => set({ user }),
  logout: () => set({ user: null }),
  fetchUser: async () => {
    try {
      const response = await fetch("http://localhost:3000/me", {
        credentials: "include",
      });
      if (response.ok) {
        const user = await response.json();
        set({ user });
      } else {
        set({ user: null });
      }
    } catch (error) {
      console.error("Failed to fetch user:", error);
      set({ user: null });
    }
  },
}));
