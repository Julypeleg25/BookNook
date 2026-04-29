import { resolveMediaUrl } from "./mediaUtils";

export const getAvatarSrcUrl = (userAvatar?: string) => {
  return resolveMediaUrl(userAvatar);
};
