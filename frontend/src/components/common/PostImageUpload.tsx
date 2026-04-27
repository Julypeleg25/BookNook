import React, { useRef, useState, useEffect } from "react";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
} from "@mui/material";

interface PostImageUploadProps {
  value: File | string | null;
  onChange: (file: File) => void;
}

const PostImageUpload = ({ value, onChange }: PostImageUploadProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [cameraOpen, setCameraOpen] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);

  const preview =
    value instanceof File ? URL.createObjectURL(value) : value || "";

  useEffect(() => {
    if (!cameraOpen) return;

    navigator.mediaDevices.getUserMedia({ video: true }).then((mediaStream) => {
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    });

    return () => {
      stream?.getTracks().forEach((t) => t.stop());
    };
  }, [cameraOpen, stream]);

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

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) onChange(file);
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
      {preview && (
        <Box
          sx={{
            width: "100%",
            maxWidth: "32rem",
            aspectRatio: "16 / 10",
            bgcolor: "grey.100",
            borderRadius: 2,
            overflow: "hidden",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Box
            component="img"
            src={preview}
            alt="Post preview"
            sx={{
              width: "100%",
              height: "100%",
              objectFit: "contain",
              display: "block",
            }}
          />
        </Box>
      )}

        <Button
          variant="outlined"
          onClick={() => fileInputRef.current?.click()}
          sx={{width: 240}}
        >
          Upload Image
        </Button>

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
          <video
            ref={videoRef}
            autoPlay
            playsInline
            style={{ width: "100%", borderRadius: 8 }}
          />
          <canvas ref={canvasRef} hidden />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCameraOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={takePhoto}>
            Capture
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default PostImageUpload;
