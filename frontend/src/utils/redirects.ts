export const DEFAULT_AUTH_REDIRECT = "/posts";

interface RedirectLocationLike {
  pathname: string;
  search?: string;
  hash?: string;
}

export const buildRedirectTarget = ({
  pathname,
  search = "",
  hash = "",
}: RedirectLocationLike): string => `${pathname}${search}${hash}`;

export const normalizeRedirectTarget = (
  target: unknown,
  fallback: string = DEFAULT_AUTH_REDIRECT
): string => {
  if (typeof target !== "string") {
    return fallback;
  }

  if (!target.startsWith("/") || target.startsWith("//")) {
    return fallback;
  }

  return target;
};
