import React, { useRef, useState, useEffect, useMemo } from "react";
import {
  Alert,
  Box,
  Button,
  Stack,
  Typography,
} from "@mui/material";
import { FiUploadCloud } from "react-icons/fi";
import { resolveMediaUrl } from "@/utils/mediaUtils";
import PostImageEmptyState from "./PostImageEmptyState";
import PostImagePreview from "./PostImagePreview";

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
    () => (value instanceof File ? URL.createObjectURL(value) : resolveMediaUrl(value ?? undefined) || ""),
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
          maxWidth: { xs: "100%", sm: "44rem", md: "52rem" },
          height: { xs: "17rem", sm: "23rem", md: "30rem" },
          mx: "auto",
          bgcolor: preview ? "#101418" : "rgba(91, 111, 106, 0.04)",
          borderRadius: "16px",
          overflow: "hidden",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          border: "2px dashed",
          borderColor: error ? "error.main" : isDragging ? "primary.main" : preview ? "divider" : "divider",
          cursor: preview ? "default" : "pointer",
          position: "relative",
          boxShadow: preview ? "0 18px 40px rgba(31, 41, 51, 0.14)" : "none",
          transition: "border-color 0.2s ease, background-color 0.2s ease, box-shadow 0.2s ease",
        }}
      >
        {preview ? (
          <PostImagePreview preview={preview} />
        ) : (
          <PostImageEmptyState />
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
