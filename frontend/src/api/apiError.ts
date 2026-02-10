import { AxiosError } from "axios";

interface ApiErrorResponseData {
  message?: string;
  error?: string;
  code?: string;
}

export class ApiError extends Error {
  status?: number;
  code?: string;
  details?: unknown;

  constructor(message: string, status?: number, code?: string, details?: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

export const mapAxiosError = (error: AxiosError<ApiErrorResponseData>): ApiError => {
  if (error.response) {
    const data = error.response.data;
    return new ApiError(
      data?.message ?? data?.error ?? "Request failed",
      error.response.status,
      data?.code,
      data,
    );
  }

  if (error.request) {
    return new ApiError("Network error – server not reachable");
  }

  return new ApiError(error.message);
};
