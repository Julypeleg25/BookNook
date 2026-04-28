import { useCallback, useEffect, useRef, useState } from "react";
import { ragService } from "@api/services/ragService";
import type { RagQueryRequest, RagQueryResponse } from "@models/Rag";
import { RAGMode } from "@models/Rag";
import { getErrorMessage } from "@/api/apiError";

export interface RagConversationItem {
  id: string;
  mode: RAGMode;
  query: string;
  response?: RagQueryResponse;
  error?: string;
  createdAt: Date;
}

const createId = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(16).slice(2)}`;

export const useRag = () => {
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState<RagConversationItem[]>([]);
  const abortControllerRef = useRef<AbortController | null>(null);

  const cancel = useCallback(() => {
    abortControllerRef.current?.abort();
    abortControllerRef.current = null;
    setLoading(false);
  }, []);

  const clearHistory = useCallback(() => {
    cancel();
    setHistory([]);
  }, [cancel]);

  const fetchAiResponse = useCallback(async (query: string, mode: RAGMode = RAGMode.GENERAL) => {
    const normalizedQuery = query.trim();
    if (!normalizedQuery || loading) return;

    const requestId = createId();
    const createdAt = new Date();

    abortControllerRef.current?.abort();
    abortControllerRef.current = new AbortController();
    setLoading(true);
    setHistory((previous) => [
      ...previous,
      {
        id: requestId,
        mode,
        query: normalizedQuery,
        createdAt,
      },
    ]);

    try {
      const data: RagQueryRequest = { query: normalizedQuery, mode };
      const result = await ragService.query(data, abortControllerRef.current.signal);
      setHistory((previous) =>
        previous.map((item) =>
          item.id === requestId ? { ...item, response: result } : item,
        ),
      );
    } catch (err: unknown) {
      const errorName = err instanceof Error ? err.name : "";
      if (errorName === "CanceledError" || errorName === "AbortError") {
        setHistory((previous) => previous.filter((item) => item.id !== requestId));
        return;
      }

      const message = getErrorMessage(err, "An unexpected error occurred.");
      setHistory((previous) =>
        previous.map((item) =>
          item.id === requestId ? { ...item, error: message } : item,
        ),
      );
    } finally {
      setLoading(false);
      abortControllerRef.current = null;
    }
  }, [loading]);

  useEffect(() => cancel, [cancel]);

  return {
    cancel,
    clearHistory,
    fetchAiResponse,
    history,
    loading,
  };
};
