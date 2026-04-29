import env from "@/config/env";

const LOCAL_HOSTNAMES = new Set(["localhost", "127.0.0.1"]);
const UPLOADS_PATH_PREFIX = "/uploads/";
const LEADING_SLASHES_PATTERN = /^\/+/;

const isBrowser = () => typeof window !== "undefined";

const isLocalhost = (hostname: string) => LOCAL_HOSTNAMES.has(hostname);

const isAbsoluteUrl = (url: string) => {
  try {
    return Boolean(new URL(url));
  } catch {
    return false;
  }
};

const getUploadBaseUrl = () => {
  if (!isBrowser()) {
    return env.API_BASE_URL;
  }

  return isLocalhost(window.location.hostname)
    ? env.API_BASE_URL
    : window.location.origin;
};

export const resolveMediaUrl = (url?: string) => {
  const trimmedUrl = url?.trim();
  if (!trimmedUrl) return undefined;
  if (isAbsoluteUrl(trimmedUrl)) return trimmedUrl;

  const normalizedPath = trimmedUrl.startsWith(UPLOADS_PATH_PREFIX)
    ? trimmedUrl
    : `${UPLOADS_PATH_PREFIX}${trimmedUrl.replace(LEADING_SLASHES_PATTERN, "")}`;

  return `${getUploadBaseUrl()}${normalizedPath}`;
};
