import env from "@/config/env";

export const getAvatarSrcUrl = (userAvatar?: string) => {
  if (!userAvatar) return undefined;
  return userAvatar.startsWith("http")
    ? userAvatar
    : `${env.API_BASE_URL}/uploads/${userAvatar}`;
};
