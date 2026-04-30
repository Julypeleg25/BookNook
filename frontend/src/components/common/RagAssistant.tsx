import React, { useState } from "react";
import {
  Box,
} from "@mui/material";
import { useRag } from "@hooks/useRag";
import RagAssistantConversation from "./RagAssistantConversation";
import RagAssistantPanel from "./RagAssistantPanel";
import { QUERY_MAX_LENGTH } from "./ragAssistantPrompts";

export const RagAssistant: React.FC = () => {
  const [query, setQuery] = useState("");
  const { clearHistory, fetchAiResponse, history, loading } = useRag();
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
        <RagAssistantPanel
          canSubmit={canSubmit}
          historyLength={history.length}
          isTooLong={isTooLong}
          loading={loading}
          query={query}
          onClear={clearHistory}
          onExampleClick={setQuery}
          onQueryChange={setQuery}
          onQueryKeyDown={handleQueryKeyDown}
          onSubmit={handleSubmit}
        />

        <RagAssistantConversation
          currentItem={currentItem}
          loading={loading}
          onRetry={() => {
            if (!currentItem || loading) return;
            setQuery(currentItem.query);
            void fetchAiResponse(currentItem.query);
          }}
        />
      </Box>
    </Box>
  );
};
