import { UpdateUserRequestDTO } from "@shared/dtos/user.dto";
import { UserDto } from "@shared/dtos/user.dto";
import { axiosClient } from "../axios/axiosClient";
import { endpoints } from "../endpoints";
import { ApiError } from "../apiError";

export const userService = {
  getCurrentUser(): Promise<UserDto> {
    return axiosClient.get<UserDto>(endpoints.users.me).then((res) => res.data);
  },

  async updateCurrentUser(data: UpdateUserRequestDTO) {
    try {
      const formData = new FormData();

      Object.entries(data).forEach(([key, value]) => {
        if (value !== null && value !== undefined) {
          formData.append(key, value as string | Blob);
        }
      });

      const res = await axiosClient.patch(
        endpoints.users.updateMe,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
    );

      return res.data;
    } catch (err) {
      throw err as ApiError;
    }
  },
};
