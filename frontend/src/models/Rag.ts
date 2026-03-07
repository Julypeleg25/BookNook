export enum RAGMode {
  GENERAL = "general",
  PERSONAL = "personalized",
}

export interface RagQueryRequest {
  query: string;
  mode?: RAGMode;
}

export interface RagSource {
  id: string;
  bookId: string;
  type: "book" | "review";
  text: string;
  score: number;
  metadata: {
    title?: string;
    genres?: string[];
    authors?: string[];
    rating?: number;
    userId?: string;
    username?: string;
    mongoId?: string;
    bookId?: string;
    [key: string]: unknown;
  };
}

export interface RagQueryResponse {
  answer: string;
  sources: RagSource[];
}
