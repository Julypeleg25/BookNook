import { useCallback, useEffect, useRef, useState } from "react";
import { ragService } from "@api/services/ragService";
import type { RagQueryRequest, RagQueryResponse } from "@models/Rag";
import { getErrorMessage } from "@/api/apiError";

export interface RagConversationItem {
  id: string;
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
  const loadingRef = useRef(false);
  const [history, setHistory] = useState<RagConversationItem[]>([]);
  const abortControllerRef = useRef<AbortController | null>(null);

  const cancel = useCallback(() => {
    abortControllerRef.current?.abort();
    abortControllerRef.current = null;
    setLoading(false);
    loadingRef.current = false;
  }, []);

  const clearHistory = useCallback(() => {
    cancel();
    setHistory([]);
  }, [cancel]);

  const fetchAiResponse = useCallback(async (query: string) => {
    const normalizedQuery = query.trim();
    if (!normalizedQuery || loadingRef.current) return;

    const requestId = createId();
    const createdAt = new Date();

    abortControllerRef.current?.abort();
    abortControllerRef.current = new AbortController();
    
    loadingRef.current = true;
    setLoading(true);

    setHistory([
      {
        id: requestId,
        query: normalizedQuery,
        createdAt,
      },
    ]);

    try {
      const data: RagQueryRequest = { query: normalizedQuery };
      const result = await ragService.query(data, abortControllerRef.current.signal);
      setHistory((previous) =>
        previous.map((item) =>
          item.id === requestId ? { ...item, response: result } : item,
        ),
      );
    } catch (err: unknown) {
      const errorName = err instanceof Error ? err.name : "";
      if (errorName === "CanceledError" || errorName === "AbortError") {
        setHistory([]);
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
      loadingRef.current = false;
      abortControllerRef.current = null;
    }
  }, []);

  useEffect(() => cancel, [cancel]);

  return {
    cancel,
    clearHistory,
    fetchAiResponse,
    history,
    loading,
  };
};
