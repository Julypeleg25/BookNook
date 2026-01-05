import { UserDto } from "@shared/dtos/user.dto";
import { axiosClient } from "../axios/axiosClient";
import { endpoints } from "../endpoints";

export const userService = {
  getCurrentUser(): Promise<UserDto> {
    return axiosClient.get<UserDto>(endpoints.users.me).then((res) => res.data);
  },

  updateCurrentUser(data: Partial<UserDto>): Promise<UserDto> {
    const formData = new FormData();
    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined) formData.append(key, value as string | Blob);
    });

    return axiosClient
      .put<UserDto>(endpoints.users.me, formData)
      .then((res) => res.data);
  },
};
