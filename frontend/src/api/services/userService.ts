import { axiosClient } from "../axios/axiosClient";
import { endpoints } from "../endpoints";

export interface User {
  id: string;
  name: string;
  username: string;
  avatar: string;
}

export const userService = {
  getCurrentUser(): Promise<User> {
    return axiosClient.get<User>(endpoints.users.me).then((res) => res.data);
  },

  updateCurrentUser(data: Partial<User>): Promise<User> {
    const formData = new FormData();
    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined) formData.append(key, value as string | Blob);
    });

    return axiosClient.put<User>(endpoints.users.me, formData).then((res) => res.data);
  },
};
