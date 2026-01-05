import { User } from "@/api/services/userService";
import { create } from "zustand";

interface UserStoreProps {
  user: User;
  setUser: (user: User) => void;
  isAuthenticated: boolean;
  setIsAuthenticated: (isAuthenticated: boolean) => void;
}

const useUserStore = create<UserStoreProps>((set) => ({
  user: { id: "", username: "", name: "", avatar: "" },
  setUser: (user) => set({ user }),
  isAuthenticated: false,
  setIsAuthenticated: (isAuthenticated: boolean) => set({ isAuthenticated }),
}));

export default useUserStore;
