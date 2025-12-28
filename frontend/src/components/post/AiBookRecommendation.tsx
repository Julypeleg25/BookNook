import React, { useState, type CSSProperties } from "react";
import {
  Box,
  TextField,
  Button,
  Typography,
  Paper,
  CircularProgress,
  Stack,
} from "@mui/material";
import { BiSend } from "react-icons/bi";

const EXAMPLE_AI_PROMPT =
  "e.g., I want a mystery novel that i won't be able to put it down...";

interface AiBookRecommendationProps {
  style?: CSSProperties;
  response: string;
}

const AiBookRecommendation = ({
  style,
  response: responseString,
}: AiBookRecommendationProps) => {
  const [prompt, setPrompt] = useState("");
  const [response, setResponse] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!prompt.trim()) return;

    setLoading(true);
    // TODO: Mock AI response - replace with actual API call
    setTimeout(() => {
      setResponse(responseString);
      setLoading(false);
    }, 2000);
  };

  return (
    <Paper
      elevation={2}
      sx={{
        height: "100%",
        p: "2rem",
        borderRadius: "1rem",
        display: "flex",
        flexDirection: "column",
        ...style,
      }}
    >
      <Typography variant="h6" gutterBottom>
        AI Book Recommendation
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: "1rem" }}>
        Describe what kind of book you're looking for, and our AI will help you
        decide if this book fits you.
      </Typography>

      <Stack spacing={2}>
        <TextField
          fullWidth
          multiline
          rows={3}
          label="Your prompt"
          placeholder={EXAMPLE_AI_PROMPT}
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          variant="outlined"
        />

        <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
          <Button
            variant="contained"
            endIcon={<BiSend />}
            onClick={handleSubmit}
            disabled={!prompt.trim() || loading}
          >
            {loading ? (
              <CircularProgress size={"1.4rem"} color="inherit" />
            ) : (
              "Get recommendation"
            )}
          </Button>
        </Box>

        {response && (
          <Box sx={{ mt: "1rem" }}>
            <Typography variant="subtitle1" gutterBottom>
              AI Recommendations:
            </Typography>
            <Paper variant="outlined" sx={{ p: "1rem", bgcolor: "grey.50" }}>
              <Typography variant="body1">{response}</Typography>
            </Paper>
          </Box>
        )}
      </Stack>
    </Paper>
  );
};

export default AiBookRecommendation;
