import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  IconButton,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import type { RagConversationItem } from "@hooks/useRag";
import { FiBookOpen, FiRefreshCw } from "react-icons/fi";
import { MarkdownMessage } from "./MarkdownMessage";

interface RagAssistantConversationProps {
  currentItem?: RagConversationItem;
  loading: boolean;
  onRetry: () => void;
}

const RagAssistantConversation = ({
  currentItem,
  loading,
  onRetry,
}: RagAssistantConversationProps) => (
  <Stack spacing={2.5}>
    {!currentItem ? (
      <EmptyConversation />
    ) : (
      <ConversationCard
        item={currentItem}
        loading={loading}
        onRetry={onRetry}
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
);

const EmptyConversation = () => (
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
);

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

export default RagAssistantConversation;
