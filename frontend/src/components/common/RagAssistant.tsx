import React, { useState } from "react";
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Divider,
  IconButton,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import {
  AutoAwesome as AiIcon,
  Clear as ClearIcon,
  Send as SendIcon,
} from "@mui/icons-material";
import { FiBookOpen, FiRefreshCw } from "react-icons/fi";
import { useRag, type RagConversationItem } from "@hooks/useRag";
import { MarkdownMessage } from "./MarkdownMessage";

const QUERY_MAX_LENGTH = 500;

const EXAMPLE_PROMPTS = [
  "Recommend a teen book with a good story about friendship",
  "Find me a slow-burn romance that's rated well",
  "Suggest a good mystery book for an adult",
];

export const RagAssistant: React.FC = () => {
  const [query, setQuery] = useState("");
  const { clearHistory, fetchAiResponse, history, loading } = useRag();
  const trimmedQuery = query.trim();
  const isTooLong = query.length > QUERY_MAX_LENGTH;
  const canSubmit = Boolean(trimmedQuery) && !loading && !isTooLong;
  const currentItem = history[0];

  const submitQuery = (nextQuery: string) => {
    void fetchAiResponse(nextQuery);
    setQuery("");
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!canSubmit) return;
    submitQuery(trimmedQuery);
  };

  const handleQueryKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key !== "Enter" || event.shiftKey) return;

    event.preventDefault();
    if (!canSubmit) return;

    submitQuery(trimmedQuery);
  };

  return (
    <Box sx={{ maxWidth: "76rem", mx: "auto" }}>
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", lg: "minmax(22rem, 0.75fr) minmax(0, 1.25fr)" },
          gap: 3,
          alignItems: "start",
        }}
      >
        <Paper
          elevation={0}
          sx={{
            p: { xs: 2.5, md: 3 },
            border: "1px solid",
            borderColor: "divider",
            borderRadius: 3,
            bgcolor: "background.paper",
            position: { lg: "sticky" },
            top: { lg: 24 },
          }}
        >
          <Stack spacing={3}>
            <Stack spacing={1}>
              <Stack direction="row" spacing={1.5} alignItems="center">
                <Box
                  sx={{
                    width: 42,
                    height: 42,
                    borderRadius: "50%",
                    display: "grid",
                    placeItems: "center",
                    bgcolor: "rgba(91, 111, 106, 0.12)",
                    color: "primary.main",
                  }}
                >
                  <AiIcon />
                </Box>
                <Box>
                  <Typography variant="h4" fontWeight={800}>
                    AI Assistant
                  </Typography>
                  <Typography color="text.secondary">
                    Ask for book recommendations and start reading!
                  </Typography>
                </Box>
              </Stack>
            </Stack>

            <Divider />

            <form onSubmit={handleSubmit}>
              <Stack spacing={1.5}>
                <TextField
                  fullWidth
                  multiline
                  minRows={5}
                  maxRows={8}
                  label="Ask a book question"
                  placeholder="Recommend a character-driven fantasy book"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  onKeyDown={handleQueryKeyDown}
                  disabled={loading}
                  error={isTooLong}
                  helperText={`${query.length}/${QUERY_MAX_LENGTH}${isTooLong ? " - shorten your question" : ""}`}
                />

                <Stack direction={{ xs: "column", sm: "row" }} spacing={1}>
                  <Button
                    type="submit"
                    variant="contained"
                    size="large"
                    disabled={!canSubmit}
                    startIcon={loading ? <CircularProgress size={18} color="inherit" /> : <SendIcon />}
                    fullWidth
                  >
                    {loading ? "Thinking..." : "Ask"}
                  </Button>
                  <Button
                    variant="outlined"
                    size="large"
                    onClick={clearHistory}
                    disabled={history.length === 0 || loading}
                    startIcon={<ClearIcon />}
                    fullWidth
                  >
                    Clear
                  </Button>
                </Stack>
              </Stack>
            </form>

            <Box>
              <Typography fontWeight={800} sx={{ mb: 1 }}>
                Try asking
              </Typography>
              <Stack spacing={1}>
                {EXAMPLE_PROMPTS.map((prompt) => (
                  <Button
                    key={prompt}
                    variant="outlined"
                    onClick={() => setQuery(prompt)}
                    disabled={loading}
                    sx={{ justifyContent: "flex-start", textAlign: "left" }}
                  >
                    {prompt}
                  </Button>
                ))}
              </Stack>
            </Box>
          </Stack>
        </Paper>

        <Stack spacing={2.5}>
          {!currentItem ? (
            <Paper
              elevation={0}
              sx={{
                p: { xs: 3, md: 4 },
                border: "1px solid",
                borderColor: "divider",
                borderRadius: 3,
                bgcolor: "background.paper",
                minHeight: "24rem",
                display: "grid",
                placeItems: "center",
                textAlign: "center",
              }}
            >
              <Stack spacing={1.5} alignItems="center" maxWidth="32rem">
                <FiBookOpen size={34} color="#5B6F6A" />
                <Typography variant="h5" fontWeight={800}>
                  Your reading assistant is ready
                </Typography>
                <Typography color="text.secondary">
                  Ask for recommendations, compare genres, or explore what BookNook readers are saying.
                </Typography>
              </Stack>
            </Paper>
          ) : (
            <ConversationCard
              item={currentItem}
              loading={loading}
              onRetry={() => {
                if (loading) return;
                submitQuery(currentItem.query);
              }}
            />
          )}

          {loading && (
            <Paper
              elevation={0}
              sx={{
                p: 2,
                border: "1px solid",
                borderColor: "divider",
                borderRadius: 3,
                bgcolor: "background.paper",
              }}
            >
              <Stack direction="row" spacing={1.5} alignItems="center">
                <CircularProgress size={22} />
                <Typography color="text.secondary">
                  Thinking...
                </Typography>
              </Stack>
            </Paper>
          )}
        </Stack>
      </Box>
    </Box>
  );
};

interface ConversationCardProps {
  item: RagConversationItem;
  loading: boolean;
  onRetry: () => void;
}

const ConversationCard = ({ item, loading, onRetry }: ConversationCardProps) => (
  <Paper
    elevation={0}
    sx={{
      border: "1px solid",
      borderColor: "divider",
      borderRadius: 3,
      bgcolor: "background.paper",
      overflow: "hidden",
    }}
  >
    <Stack spacing={2.5} sx={{ p: { xs: 2.5, md: 3 } }}>
      <Stack direction="row" justifyContent="space-between" alignItems="flex-start" gap={2}>
        <Box>
          <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
            <Chip size="small" label="BookNook AI" color="primary" />
          </Stack>
          <Typography variant="h6" fontWeight={800}>
            {item.query}
          </Typography>
        </Box>
        {item.error && (
          <IconButton onClick={onRetry} aria-label="Retry question" size="small" disabled={loading}>
            <FiRefreshCw size={18} />
          </IconButton>
        )}
      </Stack>

      {item.error ? (
        <Alert severity="error" action={<Button onClick={onRetry} disabled={loading}>Retry</Button>}>
          {item.error}
        </Alert>
      ) : item.response ? (
        <>
          {item.response.sourceCount === 0 && (
            <Alert severity="info">
              Here is a broad recommendation to get you started.
            </Alert>
          )}
          <Box
            sx={{
              p: { xs: 2, md: 2.5 },
              borderRadius: 2,
              bgcolor: "rgba(91, 111, 106, 0.035)",
            }}
          >
            <MarkdownMessage content={item.response.answer} />
          </Box>
        </>
      ) : null}
    </Stack>
  </Paper>
);
