import { UserDto } from "@shared/dtos/user.dto";
import { create } from "zustand";

interface UserStoreProps {
  user: UserDto;
  setUser: (user: UserDto) => void;
  isAuthenticated: boolean;
  setIsAuthenticated: (isAuthenticated: boolean) => void;
  resetUser: () => void;
}

const defaultUser = { avatar: "", id: "", name: "", username: "", email: "" };

const useUserStore = create<UserStoreProps>((set) => ({
  user: defaultUser,
  setUser: (user) => set({ user, isAuthenticated: true }),
  resetUser: () => set({ user: defaultUser, isAuthenticated: false }),
  isAuthenticated: false,
  setIsAuthenticated: (isAuthenticated: boolean) => set({ isAuthenticated }),
}));

export default useUserStore;
