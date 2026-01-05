import { AxiosError } from "axios";

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

export const mapAxiosError = (error: AxiosError): ApiError => {
  if (error.response) {
    return new ApiError(
      (error.response.data as any)?.message ?? "Request failed",
      error.response.status,
      (error.response.data as any)?.code,
      error.response.data,
    );
  }

  if (error.request) {
    return new ApiError("Network error – server not reachable");
  }

  return new ApiError(error.message);
};
