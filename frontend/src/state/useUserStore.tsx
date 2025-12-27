import {create} from "zustand";

interface UserStoreProps {
  id: string;
  username: string;
  name: string;
  avatarUrl: string;
  setId: (id: string) => void;
  setUsername: (username: string) => void;
  setName: (name: string) => void;
  setAvatarUrl: (avatarUrl: string) => void;
}

const useUserStore = create<UserStoreProps>((set) => ({
  id: "",
  username: "",
  name: "",
  avatarUrl: "",
  setId: (id: string) => set({ id }),
  setUsername: (username: string) => set({ username }),
  setName: (name: string) => set({ name }),
  setAvatarUrl: (avatarUrl: string) => set({ avatarUrl }),
}));

export default useUserStore;
