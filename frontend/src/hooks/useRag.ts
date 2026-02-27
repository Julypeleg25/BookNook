import { useState, useCallback, useRef, useEffect } from "react";
import { ragService } from "@api/services/ragService";
import { RagQueryRequest, RagQueryResponse, RAGMode } from "@models/Rag";

export const useRag = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [response, setResponse] = useState<RagQueryResponse | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const fetchAiResponse = useCallback(async (query: string, mode: RAGMode = RAGMode.GLOBAL) => {
    if (!query.trim()) return;

    // Reset state and cancel previous request
    setError(null);
    setLoading(true);
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();

    try {
      const data: RagQueryRequest = { query, mode };
      const result = await ragService.query(data, abortControllerRef.current.signal);
      setResponse(result);
    } catch (err: any) {
      if (err.name === "CanceledError" || err.name === "AbortError") {
        return;
      }
      const message = err.response?.data?.error || err.message || "An unexpected error occurred.";
      setError(message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  return {
    loading,
    error,
    response,
    fetchAiResponse,
  };
};
