import { AxiosError } from "axios";

export interface ApiErrorResponseData {
  message?: string;
  error?: string;
  code?: string;
  details?: Record<string, string[]>;
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
    const firstDetail = data?.details
      ? Object.values(data.details).flat()[0]
      : undefined;
    return new ApiError(
      firstDetail ?? data?.message ?? data?.error ?? "Request failed",
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
  details?: Record<string, string[]>;
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
    const firstDetail = error.details?.details
      ? Object.values(error.details.details).flat()[0]
      : undefined;
    return firstDetail ?? error.details?.error ?? error.details?.message ?? error.message;
  }

  if (isAxiosLikeError(error)) {
    const firstDetail = error.response?.data?.details
      ? Object.values(error.response.data.details).flat()[0]
      : undefined;
    return (
      firstDetail ??
      error.response?.data?.message ??
      error.response?.data?.error ??
      fallback
    );
  }

  return error instanceof Error ? error.message : fallback;
};
