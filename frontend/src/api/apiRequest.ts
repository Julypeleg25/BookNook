import type { AxiosRequestConfig } from "axios";
import { axiosClient } from "./axios/axiosClient";

export const apiRequest = async <T>(
  config: AxiosRequestConfig,
  signal?: AbortSignal,
): Promise<T> => {
  const response = await axiosClient.request<T>({
    ...config,
    signal,
  });

  return response.data;
};
