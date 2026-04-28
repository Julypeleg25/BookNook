import React, { useRef } from "react";
import { Avatar, Button, Box } from "@mui/material";

interface ImageUploadProps {
  value: File | string | null;
  onChange: (file: File) => void;
  disabled?: boolean;
}

const ImageUpload = ({ value, onChange, disabled = false }: ImageUploadProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const getPreview = () => {
    if (value instanceof File) {
      return URL.createObjectURL(value);
    }
    return value || "";
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      onChange(file);
    }
  };

  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: "1rem" }}>
      <Avatar src={getPreview()} sx={{ width: "6rem", height: "6rem" }} />
      <input
        type="file"
        accept="image/*"
        capture="user"
        hidden
        ref={fileInputRef}
        onChange={handleFileChange}
      />
      <Button
        variant="outlined"
        onClick={() => fileInputRef.current?.click()}
        disabled={disabled}
      >
        Change Profile Picture
      </Button>
    </Box>
  );
};

export default ImageUpload;
