import React, { useState, useMemo } from "react";
import {
  Box,
  TextField,
  Button,
  Typography,
  Paper,
  CircularProgress,
  Alert,
  ToggleButtonGroup,
  ToggleButton,
  Divider,
  Tooltip,
} from "@mui/material";
import { Send as SendIcon, AutoAwesome as AiIcon } from "@mui/icons-material";
import { useRag } from "@hooks/useRag";
import { RAGMode } from "@models/Rag";
import { MarkdownMessage } from "./MarkdownMessage";

export const RagAssistant: React.FC = () => {
  const [query, setQuery] = useState("");
  const [mode, setMode] = useState<RAGMode>(RAGMode.GENERAL);
  const { loading, error, response, fetchAiResponse } = useRag();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim() || loading) return;
    fetchAiResponse(query, mode);
  };

  const handleModeChange = (
    _event: React.MouseEvent<HTMLElement>,
    newMode: RAGMode | null
  ) => {
    if (newMode !== null) {
      setMode(newMode);
    }
  };

  return (
    <Box sx={{ maxWidth: 800, mx: "auto", p: { xs: 2, md: 4 } }}>
      <Paper
        elevation={0}
        sx={{
          p: 4,
          mb: 4,
          border: "1px solid",
          borderColor: "divider",
          borderRadius: 3,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", mb: 3, gap: 1.5 }}>
          <AiIcon color="primary" sx={{ fontSize: 32 }} />
          <Typography variant="h4" component="h1" sx={{ fontWeight: "bold" }}>
            BookNook AI
          </Typography>
        </Box>

        <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
          {mode === RAGMode.PERSONAL
            ? "Personal book helper based on what you like"
            : "General book assistant that can answer questions about books, authors, generes, and more."}
        </Typography>

        <form onSubmit={handleSubmit}>
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle2" sx={{ mb: 1.5, display: "block", fontWeight: "bold" }}>
              Pick Mode
            </Typography>
            <ToggleButtonGroup
              value={mode}
              exclusive
              onChange={handleModeChange}
              size="small"
              color="primary"
              aria-label="search mode"
              sx={{ gap: 1, "& .MuiToggleButton-root": { border: "1px solid !important", borderRadius: "8px !important" } }}
            >
              <Tooltip title="based on all data">
                <ToggleButton value={RAGMode.GENERAL}>
                  General
                </ToggleButton>
              </Tooltip>
               <Tooltip title="based on your preferences">
                <ToggleButton value={RAGMode.PERSONAL}>
                  Personal Helper
                </ToggleButton>
              </Tooltip>
            </ToggleButtonGroup>
          </Box>

          <TextField
            fullWidth
            multiline
            rows={3}
            variant="outlined"
            placeholder={mode === RAGMode.PERSONAL
              ? "e.g. Based on what I like, what should I read next?"
              : "e.g.  recommend a liked romance book"}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            disabled={loading}
            sx={{
              mb: 3,
              "& .MuiOutlinedInput-root": { borderRadius: 3 }
            }}
          />

          <Button
            type="submit"
            variant="contained"
            size="large"
            disabled={loading || !query.trim()}
            startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <SendIcon />}
            fullWidth
            sx={{ borderRadius: 3, py: 1.5, textTransform: "none", fontSize: "1.1rem" }}
          >
            {loading ? "Consulting Records..." : "Ask"}
          </Button>
        </form>
      </Paper>

      {error && (
        <Alert severity="error" sx={{ mb: 4, borderRadius: 3 }}>
          {error}
        </Alert>
      )}

      {response && (
        <Paper elevation={0} sx={{ p: 4, border: "1px solid", borderColor: "divider", borderRadius: 3 }}>
          <Typography variant="h6" sx={{ mb: 2, fontWeight: "bold", color: "primary.main" }}>
            AI Assistant
          </Typography>

          <MarkdownMessage content={response.answer} />

        </Paper>
      )}
    </Box>
  );
};
