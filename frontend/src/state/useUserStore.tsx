import { UserDto } from "@shared/dtos/user.dto";
import { create } from "zustand";

interface UserStoreProps {
  user: UserDto;
  setUser: (user: UserDto) => void;
  isAuthenticated: boolean;
  setIsAuthenticated: (isAuthenticated: boolean) => void;
}

const useUserStore = create<UserStoreProps>((set) => ({
  user: { id: "", username: "", name: "", avatar: "", email: "" },
  setUser: (user) => set({ user }),
  isAuthenticated: false,
  setIsAuthenticated: (isAuthenticated: boolean) => set({ isAuthenticated }),
}));

export default useUserStore;
