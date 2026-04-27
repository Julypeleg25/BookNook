import { useMemo, useState, useEffect } from "react";

export const useAvatarImage = (initialAvatar: File | null) => {
  const [file, setFile] = useState<File | null>(null);

  const previewUrl = useMemo(() => {
    const source = file ?? initialAvatar;
    return source ? URL.createObjectURL(source) : undefined;
  }, [file, initialAvatar]);

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  return {
    file,
    previewUrl,
    setFile,
  };
};
