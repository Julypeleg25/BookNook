import { useMemo, useState, useEffect } from "react";

export const useAvatarImage = (initialAvatar: File | null) => {
  const [file, setFile] = useState<File | null>(null);

  const previewUrl = useMemo(() => {
    if (!file)
      return initialAvatar ? URL.createObjectURL(initialAvatar) : undefined;
  }, [file, initialAvatar]);

  useEffect(() => {
    return () => {
      if (file && previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [file, previewUrl]);

  return {
    file,
    previewUrl,
    setFile,
  };
};
