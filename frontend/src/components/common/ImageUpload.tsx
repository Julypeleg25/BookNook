import React, { useEffect, useMemo, useRef } from "react";
import {
  Avatar,
  Box,
  Button,
  IconButton,
  Stack,
  Tooltip,
} from "@mui/material";
import { FiTrash2, FiUploadCloud } from "react-icons/fi";

interface ImageUploadProps {
  value: File | string | null;
  onChange: (file: File) => void;
  onRemove?: () => void;
  compactActions?: boolean;
  disabled?: boolean;
}

const ImageUpload = ({
  value,
  onChange,
  onRemove,
  compactActions = false,
  disabled = false,
}: ImageUploadProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file?.type.startsWith("image/")) {
      onChange(file);
    }
    event.target.value = "";
  };

  return (
    <Stack direction={{ xs: "column", sm: "row" }} spacing={2} alignItems={{ xs: "flex-start", sm: "center" }}>
      <Avatar src={preview} sx={{ width: "6rem", height: "6rem" }} />
      <Box>
        <Stack direction="row" spacing={1}>
          {compactActions ? (
            <>
              <Tooltip title="Upload image">
                <span>
                  <IconButton
                    onClick={() => fileInputRef.current?.click()}
                    disabled={disabled}
                    aria-label="Upload profile photo"
                    sx={{ border: "1px solid", borderColor: "divider" }}
                  >
                    <FiUploadCloud size={18} />
                  </IconButton>
                </span>
              </Tooltip>
              {onRemove && preview && (
                <Tooltip title="Remove photo">
                  <span>
                    <IconButton
                      onClick={onRemove}
                      disabled={disabled}
                      aria-label="Remove profile photo"
                      color="error"
                      sx={{ border: "1px solid", borderColor: "divider" }}
                    >
                      <FiTrash2 size={18} />
                    </IconButton>
                  </span>
                </Tooltip>
              )}
            </>
          ) : (
            <>
              <Button
                variant="outlined"
                onClick={() => fileInputRef.current?.click()}
                disabled={disabled}
                startIcon={<FiUploadCloud size={16} />}
              >
                Upload Image
              </Button>
              {onRemove && preview && (
                <Button
                  variant="outlined"
                  color="error"
                  onClick={onRemove}
                  disabled={disabled}
                  startIcon={<FiTrash2 size={16} />}
                >
                  Remove
                </Button>
              )}
            </>
          )}
        </Stack>
      </Box>

      <input
        type="file"
        accept="image/*"
        hidden
        ref={fileInputRef}
        onChange={handleFileChange}
      />

    </Stack>
  );
};

export default ImageUpload;
