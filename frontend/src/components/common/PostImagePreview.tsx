import { Box } from "@mui/material";

interface PostImagePreviewProps {
  preview: string;
}

const PostImagePreview = ({ preview }: PostImagePreviewProps) => (
  <>
    <Box
      component="img"
      src={preview}
      alt=""
      aria-hidden="true"
      decoding="async"
      draggable={false}
      sx={{
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
        objectFit: "cover",
        filter: "blur(22px)",
        transform: "scale(1.08)",
        opacity: 0.42,
      }}
    />
    <Box
      sx={{
        position: "absolute",
        inset: 0,
        bgcolor: "rgba(11, 17, 20, 0.34)",
      }}
    />
    <Box
      component="img"
      src={preview}
      alt="Post preview"
      decoding="async"
      draggable={false}
      sx={{
        position: "relative",
        zIndex: 1,
        width: "100%",
        height: "100%",
        objectFit: "contain",
        display: "block",
        imageRendering: "auto",
      }}
    />
  </>
);

export default PostImagePreview;
