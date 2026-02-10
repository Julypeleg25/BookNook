import { UserDto } from "@shared/dtos/user.dto";
import { create } from "zustand";

interface UserStoreState {
  user: UserDto;
  isAuthenticated: boolean;
  setUser: (user: UserDto) => void;
  setIsAuthenticated: (isAuthenticated: boolean) => void;
  resetUser: () => void;
}

const defaultUser: UserDto = {
  id: "",
  username: "",
  avatar: "",
  email: "",
};

const useUserStore = create<UserStoreState>((set) => ({
  user: defaultUser,
  isAuthenticated: false,
  setUser: (user) => set({ user, isAuthenticated: true }),
  resetUser: () => set({ user: defaultUser, isAuthenticated: false }),
  setIsAuthenticated: (isAuthenticated) => set({ isAuthenticated }),
}));

export default useUserStore;
