import React, { useRef, useState, useEffect, useMemo } from "react";
import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  IconButton,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material";
import { FiCamera, FiImage, FiRefreshCw, FiUploadCloud } from "react-icons/fi";

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
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [cameraOpen, setCameraOpen] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);

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

  useEffect(() => {
    if (!cameraOpen) return;

    let activeStream: MediaStream | null = null;

    navigator.mediaDevices
      .getUserMedia({ video: true })
      .then((mediaStream) => {
        activeStream = mediaStream;
        setStream(mediaStream);
        setCameraError(null);
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
        }
      })
      .catch(() => {
        setCameraError("Camera access is unavailable. Upload an image from your device instead.");
      });

    return () => {
      activeStream?.getTracks().forEach((track) => track.stop());
      setStream(null);
    };
  }, [cameraOpen]);

  const takePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.drawImage(video, 0, 0);
    canvas.toBlob((blob) => {
      if (!blob) return;

      const file = new File([blob], "post-image.jpg", { type: "image/jpeg" });
      onChange(file);
      setCameraOpen(false);
    }, "image/jpeg");
  };

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
            Required. Use a clear photo or graphic that represents your review.
          </Typography>
        </Stack>
        <Stack direction="row" spacing={1}>
          <Tooltip title="Upload image">
            <IconButton
              onClick={() => fileInputRef.current?.click()}
              color="primary"
              aria-label="Upload image"
            >
              <FiUploadCloud size={20} />
            </IconButton>
          </Tooltip>
          <Tooltip title="Take photo">
            <IconButton
              onClick={() => setCameraOpen(true)}
              color="primary"
              aria-label="Take photo"
            >
              <FiCamera size={20} />
            </IconButton>
          </Tooltip>
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
          aspectRatio: { xs: "4 / 3", sm: "16 / 10" },
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

      {preview && (
        <Stack direction={{ xs: "column", sm: "row" }} spacing={1}>
          <Button
            variant="outlined"
            onClick={() => fileInputRef.current?.click()}
            startIcon={<FiRefreshCw size={16} />}
            sx={{ width: { xs: "100%", sm: "fit-content" } }}
          >
            Replace Image
          </Button>
          <Button
            variant="outlined"
            onClick={() => setCameraOpen(true)}
            startIcon={<FiCamera size={16} />}
            sx={{ width: { xs: "100%", sm: "fit-content" } }}
          >
            Take New Photo
          </Button>
        </Stack>
      )}

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

      <Dialog
        open={cameraOpen}
        onClose={() => setCameraOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogContent>
          {cameraError ? (
            <Alert severity="warning">{cameraError}</Alert>
          ) : (
            <video
              ref={videoRef}
              autoPlay
              playsInline
              style={{ width: "100%", borderRadius: 12, backgroundColor: "#111827" }}
            />
          )}
          <canvas ref={canvasRef} hidden />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCameraOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={takePhoto} disabled={!stream}>
            Capture
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default PostImageUpload;
