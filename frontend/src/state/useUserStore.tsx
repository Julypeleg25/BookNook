import { create } from "zustand";

interface UserStoreProps {
  id: string;
  username: string;
  name: string;
  avatar: string;
  setId: (id: string) => void;
  setUsername: (username: string) => void;
  setName: (name: string) => void;
  setAvatar: (avatar: string) => void;
}

const useUserStore = create<UserStoreProps>((set) => ({
  id: "",
  username: "",
  name: "",
  avatar: "",
  setId: (id: string) => set({ id }),
  setUsername: (username: string) => set({ username }),
  setName: (name: string) => set({ name }),
  setAvatar: (avatar: string) => set({ avatar }),
}));

export default useUserStore;
