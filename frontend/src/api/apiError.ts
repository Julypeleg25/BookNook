import { AxiosError } from "axios";

export interface ApiErrorResponseData {
  message?: string;
  error?: string;
  code?: string;
}

export class ApiError extends Error {
  status?: number;
  code?: string;
  details?: ApiErrorResponseData;

  constructor(
    message: string,
    status?: number,
    code?: string,
    details?: ApiErrorResponseData,
  ) {
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

interface AxiosLikeErrorData {
  message?: string;
  error?: string;
}

interface AxiosLikeError {
  response?: {
    data?: AxiosLikeErrorData;
  };
}

const isAxiosLikeError = (error: unknown): error is AxiosLikeError =>
  typeof error === "object" && error !== null && "response" in error;

export const getErrorMessage = (
  error: unknown,
  fallback: string,
): string => {
  if (error instanceof ApiError) {
    return error.details?.error ?? error.details?.message ?? error.message;
  }

  if (isAxiosLikeError(error)) {
    return (
      error.response?.data?.message ??
      error.response?.data?.error ??
      fallback
    );
  }

  return error instanceof Error ? error.message : fallback;
};
