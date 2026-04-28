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
  StopCircleOutlined as StopIcon,
} from "@mui/icons-material";
import { FiBookOpen, FiRefreshCw } from "react-icons/fi";
import { useRag, type RagConversationItem } from "@hooks/useRag";
import type { RagSource } from "@models/Rag";
import { MarkdownMessage } from "./MarkdownMessage";

const QUERY_MAX_LENGTH = 500;

const EXAMPLE_PROMPTS = [
  "Recommend thoughtful fantasy books with strong character arcs",
  "What are good romance books for someone who likes emotional slow burns?",
  "Find books similar to mystery reviews people liked",
];

export const RagAssistant: React.FC = () => {
  const [query, setQuery] = useState("");
  const { cancel, clearHistory, fetchAiResponse, history, loading } = useRag();
  const trimmedQuery = query.trim();
  const isTooLong = query.length > QUERY_MAX_LENGTH;
  const canSubmit = Boolean(trimmedQuery) && !loading && !isTooLong;
  const currentItem = history[0];

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!canSubmit) return;
    void fetchAiResponse(trimmedQuery);
    setQuery("");
  };

  const handleQueryKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key !== "Enter" || event.shiftKey) return;

    event.preventDefault();
    if (!canSubmit) return;

    void fetchAiResponse(trimmedQuery);
    setQuery("");
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
                    BookNook AI
                  </Typography>
                  <Typography color="text.secondary">
                    Ask for book ideas, patterns, and next-read guidance.
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
                  {loading ? (
                    <Button variant="outlined" size="large" onClick={cancel} startIcon={<StopIcon />} fullWidth>
                      Stop
                    </Button>
                  ) : (
                    <Button
                      variant="outlined"
                      size="large"
                      onClick={clearHistory}
                      disabled={history.length === 0}
                      startIcon={<ClearIcon />}
                      fullWidth
                    >
                      Clear
                    </Button>
                  )}
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
                setQuery(currentItem.query);
                void fetchAiResponse(currentItem.query);
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
                  Finding a good answer...
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
            <Typography variant="caption" color="text.secondary">
              {item.createdAt.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
            </Typography>
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
          <SourcesList sources={item.response.sources} />
        </>
      ) : null}
    </Stack>
  </Paper>
);

const SourcesList = ({ sources }: { sources: RagSource[] }) => {
  if (sources.length === 0) return null;

  return (
    <Box>
      <Typography fontWeight={800} sx={{ mb: 1 }}>
        Sources used
      </Typography>
      <Box
        display="grid"
        gridTemplateColumns={{ xs: "1fr", md: "1fr 1fr" }}
        gap={1.25}
      >
        {sources.slice(0, 4).map((source) => {
          const title =
            typeof source.metadata.title === "string"
              ? source.metadata.title
              : source.type === "review"
                ? "Reader review"
                : "Book result";
          const subtitle =
            Array.isArray(source.metadata.authors) && source.metadata.authors.length > 0
              ? source.metadata.authors.join(", ")
              : source.metadata.username
                ? `@${source.metadata.username}`
                : source.type;

          return (
            <Box
              key={source.id}
              sx={{
                p: 1.5,
                border: "1px solid",
                borderColor: "divider",
                borderRadius: 2,
              }}
            >
              <Typography fontWeight={800} noWrap title={title}>
                {title}
              </Typography>
              <Typography variant="body2" color="text.secondary" noWrap title={String(subtitle)}>
                {subtitle}
              </Typography>
              <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                <Chip size="small" label={source.type} variant="outlined" />
                <Chip size="small" label={`${Math.round(source.score * 100)}% match`} variant="outlined" />
              </Stack>
            </Box>
          );
        })}
      </Box>
    </Box>
  );
};
