import {
  Box,
  Button,
  CircularProgress,
  Divider,
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
import type React from "react";
import { EXAMPLE_PROMPTS, QUERY_MAX_LENGTH } from "./ragAssistantPrompts";

interface RagAssistantPanelProps {
  canSubmit: boolean;
  historyLength: number;
  isTooLong: boolean;
  loading: boolean;
  query: string;
  onClear: () => void;
  onExampleClick: (prompt: string) => void;
  onQueryChange: (query: string) => void;
  onQueryKeyDown: (event: React.KeyboardEvent<HTMLDivElement>) => void;
  onSubmit: (event: React.FormEvent) => void;
}

const RagAssistantPanel = ({
  canSubmit,
  historyLength,
  isTooLong,
  loading,
  query,
  onClear,
  onExampleClick,
  onQueryChange,
  onQueryKeyDown,
  onSubmit,
}: RagAssistantPanelProps) => (
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

      <form onSubmit={onSubmit}>
        <Stack spacing={1.5}>
          <TextField
            fullWidth
            multiline
            minRows={5}
            maxRows={8}
            label="Ask a book question"
            placeholder="Recommend a character-driven fantasy book"
            value={query}
            onChange={(event) => onQueryChange(event.target.value)}
            onKeyDown={onQueryKeyDown}
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
              onClick={onClear}
              disabled={historyLength === 0 || loading}
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
              onClick={() => onExampleClick(prompt)}
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
);

export default RagAssistantPanel;
