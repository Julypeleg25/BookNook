import { UpdateUserRequestDTO, UserDto } from "@shared/dtos/user.dto";
import { axiosClient } from "../axios/axiosClient";
import { endpoints } from "../endpoints";

interface UpdateUserResponse {
  message: string;
  user: UserDto;
}

const isFile = (value: unknown): value is File => value instanceof File;

export const userService = {
  async getCurrentUser(): Promise<UserDto> {
    const res = await axiosClient.get<UserDto>(endpoints.users.me);
    return res.data;
  },

  async updateCurrentUser(data: UpdateUserRequestDTO): Promise<UpdateUserResponse> {
    const formData = new FormData();

    Object.entries(data).forEach(([key, value]) => {
      if (value !== null && value !== undefined) {
        if (isFile(value)) {
          formData.append(key, value as unknown as Blob);
        } else {
          formData.append(key, String(value));
        }
      }
    });

    const res = await axiosClient.patch<UpdateUserResponse>(
      endpoints.users.updateMe,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );

    return res.data;
  },
};
