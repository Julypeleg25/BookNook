import env from "@/config/env";

export const getAvatarSrcUrl = (userAvatar?: string) => {
  if (!userAvatar) return undefined;
  if (userAvatar.startsWith("http")) return userAvatar;
  return userAvatar.startsWith("/uploads/")
    ? `${env.API_BASE_URL}${userAvatar}`
    : `${env.API_BASE_URL}/uploads/${userAvatar}`;
};
