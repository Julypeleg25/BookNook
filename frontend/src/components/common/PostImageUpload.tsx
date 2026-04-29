import React, { useRef, useState, useEffect, useMemo } from "react";
import {
  Alert,
  Box,
  Button,
  Stack,
  Typography,
} from "@mui/material";
import { FiImage, FiUploadCloud } from "react-icons/fi";

interface PostImageUploadProps {
  value: File | string | null;
  onChange: (file: File) => void;
  error?: boolean;
  helperText?: string;
}

const PostImageUpload = ({
  value,
  onChange,
  error = false,
  helperText,
}: PostImageUploadProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isDragging, setIsDragging] = useState(false);

  const preview = useMemo(
    () => (value instanceof File ? URL.createObjectURL(value) : value || ""),
    [value],
  );

  useEffect(() => {
    return () => {
      if (preview && value instanceof File) {
        URL.revokeObjectURL(preview);
      }
    };
  }, [preview, value]);

  const handleFile = (file?: File) => {
    if (file?.type.startsWith("image/")) {
      onChange(file);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    handleFile(file);
    e.target.value = "";
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    handleFile(e.dataTransfer.files?.[0]);
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
      <Stack
        direction={{ xs: "column", sm: "row" }}
        justifyContent="space-between"
        alignItems={{ xs: "flex-start", sm: "center" }}
        gap={1.5}
      >
        <Stack spacing={0.5}>
          <Typography variant="subtitle1" fontWeight={800}>
            Post Image
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Use a clear photo or graphic that represents your review.
          </Typography>
        </Stack>
        <Stack direction={{ xs: "column", sm: "row" }} spacing={1} sx={{ width: { xs: "100%", sm: "auto" } }}>
          <Button
            variant="outlined"
            onClick={() => fileInputRef.current?.click()}
            startIcon={<FiUploadCloud size={16} />}
            sx={{ width: { xs: "100%", sm: "fit-content" } }}
          >
            Upload Image
          </Button>
        </Stack>
      </Stack>

      <Box
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        onClick={() => !preview && fileInputRef.current?.click()}
        sx={{
          width: "100%",
          maxWidth: { xs: "100%", sm: "34rem", md: "40rem" },
          height: { xs: "11rem", sm: "13rem", md: "15rem" },
          mx: "auto",
          bgcolor: preview ? "grey.50" : "rgba(91, 111, 106, 0.04)",
          borderRadius: "12px",
          overflow: "hidden",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          border: "2px dashed",
          borderColor: error ? "error.main" : isDragging ? "primary.main" : "divider",
          cursor: preview ? "default" : "pointer",
          transition: "border-color 0.2s ease, background-color 0.2s ease",
        }}
      >
        {preview ? (
          <Box
            component="img"
            src={preview}
            alt="Post preview"
            sx={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              display: "block",
            }}
          />
        ) : (
          <Stack spacing={1.25} alignItems="center" sx={{ px: 3, textAlign: "center" }}>
            <Box
              sx={{
                width: 52,
                height: 52,
                borderRadius: "50%",
                display: "grid",
                placeItems: "center",
                bgcolor: "rgba(91, 111, 106, 0.12)",
                color: "primary.main",
              }}
            >
              <FiImage size={24} />
            </Box>
            <Typography fontWeight={800}>Drop an image here</Typography>
            <Typography variant="body2" color="text.secondary">
              or browse from your device
            </Typography>
          </Stack>
        )}
      </Box>

      {helperText ? (
        <Alert severity={error ? "error" : "info"} sx={{ py: 0 }}>
          {helperText}
        </Alert>
      ) : null}

      <input
        ref={fileInputRef}
        hidden
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
      />

    </Box>
  );
};

export default PostImageUpload;
