import React, { useState } from "react";
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
  List,
  ListItem,
  ListItemText,
  Chip,
  Link,
} from "@mui/material";
import { Link as RouterLink } from "react-router-dom";
import { Send as SendIcon, AutoAwesome as AiIcon } from "@mui/icons-material";
import { useRag } from "@hooks/useRag";
import { RAGMode } from "@models/Rag";

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
      <Paper elevation={0} sx={{ p: 4, mb: 4, border: "1px solid", borderColor: "divider" }}>
        <Box sx={{ display: "flex", alignItems: "center", mb: 3, gap: 1.5 }}>
          <AiIcon color="primary" sx={{ fontSize: 32 }} />
          <Typography variant="h4" component="h1">
            BookNook AI Assistant
          </Typography>
        </Box>

        <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
          Ask anything about books, reviews, or your personal library.
        </Typography>

        <form onSubmit={handleSubmit}>
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle2" sx={{ mb: 1.5, display: "block" }}>
              Search Mode
            </Typography>
            <ToggleButtonGroup
              value={mode}
              exclusive
              onChange={handleModeChange}
              size="small"
              color="primary"
              aria-label="search mode"
            >
              <ToggleButton value={RAGMode.GENERAL} aria-label="global search">
                Global (All Books)
              </ToggleButton>
              <ToggleButton value={RAGMode.PERSONAL} aria-label="personal library">
                My Library
              </ToggleButton>
            </ToggleButtonGroup>
          </Box>

          <TextField
            fullWidth
            multiline
            rows={4}
            placeholder="e.g. Can you recommend a mystery book with a female protagonist?"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            disabled={loading}
            sx={{ mb: 3 }}
          />

          <Button
            type="submit"
            variant="contained"
            size="large"
            disabled={loading || !query.trim()}
            startIcon={loading ? <CircularProgress size={20} /> : <SendIcon />}
            fullWidth
          >
            {loading ? "Thinking..." : "Send Request"}
          </Button>
        </form>
      </Paper>

      {error && (
        <Alert severity="error" sx={{ mb: 4, borderRadius: 3 }}>
          {error}
        </Alert>
      )}

      {response && (
        <Paper elevation={0} sx={{ p: 4, border: "1px solid", borderColor: "divider" }}>
          <Typography variant="h5" sx={{ mb: 2 }}>
            Response
          </Typography>
          <Typography
            variant="body1"
            sx={{
              whiteSpace: "pre-wrap",
              mb: 4,
              color: "text.primary",
              lineHeight: 1.8,
            }}
          >
            {response.answer}
          </Typography>

          {response.sources.length > 0 && (
            <>
              <Divider sx={{ mb: 3 }} />
              <Typography variant="subtitle2" sx={{ mb: 2 }}>
                Sources & Context
              </Typography>
              <List disablePadding>
                {response.sources.map((source: any, index) => {
                  let linkTo = "";
                  let displaySource = "";

                  if (source.payload?.type === "review") {
                    const bookId = source.payload.bookId;
                    linkTo = `/book/${bookId}`;
                    displaySource = `Review for Book: ${source.payload.bookTitle || "Unknown"}`;
                  } else if (source.payload?.type === "book") {
                    const bookId = source.payload.mongoId;
                    linkTo = `/book/${bookId}`;
                    displaySource = `Book Details: ${source.payload.title}`;
                  } else {
                    displaySource = String(source);
                  }

                  return (
                    <ListItem
                      key={`${source.id || index}-${index}`}
                      disableGutters
                      sx={{
                        mb: 1,
                        p: 2,
                        bgcolor: "rgba(0,0,0,0.02)",
                        borderRadius: 2,
                        display: "block",
                      }}
                    >
                      <Box sx={{ display: "flex", alignItems: "center", mb: 0.5, gap: 1 }}>

                        {linkTo ? (
                          <Link component={RouterLink} to={linkTo} color="primary" underline="hover">
                            <Typography variant="subtitle2" component="span">
                              {displaySource}
                            </Typography>
                          </Link>
                        ) : (
                          <Typography variant="subtitle2" component="span">
                            {displaySource}
                          </Typography>
                        )}
                      </Box>

                    </ListItem>
                  )
                })}
              </List>
            </>
          )}
        </Paper>
      )}
    </Box>
  );
};
