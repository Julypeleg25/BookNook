import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Avatar,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  Stack,
  Typography,
  Alert,
} from "@mui/material";
import { FiCamera, FiUploadCloud } from "react-icons/fi";

interface ImageUploadProps {
  value: File | string | null;
  onChange: (file: File) => void;
  disabled?: boolean;
}

const ImageUpload = ({ value, onChange, disabled = false }: ImageUploadProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [cameraOpen, setCameraOpen] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
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

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file?.type.startsWith("image/")) {
      onChange(file);
    }
    event.target.value = "";
  };

  const takePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const video = videoRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.drawImage(video, 0, 0);
    canvas.toBlob((blob) => {
      if (!blob) return;

      onChange(new File([blob], "profile-photo.jpg", { type: "image/jpeg" }));
      setCameraOpen(false);
    }, "image/jpeg");
  };

  return (
    <Stack direction={{ xs: "column", sm: "row" }} spacing={2} alignItems={{ xs: "flex-start", sm: "center" }}>
      <Avatar src={preview} sx={{ width: "6rem", height: "6rem" }} />
      <Box>
        <Typography fontWeight={800}>Profile Photo</Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
          Upload an image or take a new photo.
        </Typography>
        <Stack direction={{ xs: "column", sm: "row" }} spacing={1}>
          <Button
            variant="outlined"
            onClick={() => fileInputRef.current?.click()}
            disabled={disabled}
            startIcon={<FiUploadCloud size={16} />}
          >
            Upload Image
          </Button>
          <Button
            variant="outlined"
            onClick={() => setCameraOpen(true)}
            disabled={disabled}
            startIcon={<FiCamera size={16} />}
          >
            Take Photo
          </Button>
        </Stack>
      </Box>

      <input
        type="file"
        accept="image/*"
        hidden
        ref={fileInputRef}
        onChange={handleFileChange}
      />

      <Dialog open={cameraOpen} onClose={() => setCameraOpen(false)} maxWidth="sm" fullWidth>
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
    </Stack>
  );
};

export default ImageUpload;
