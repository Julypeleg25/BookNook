export interface RagQueryRequest {
  query: string;
}

export interface RagSource {
  id: string;
  bookId: string;
  type: "book" | "review";
  score: number;
  metadata: {
    title?: string;
    genres?: string[];
    authors?: string[];
    rating?: number;
    username?: string;
    externalId?: string;
    [key: string]: unknown;
  };
}

export interface RagQueryResponse {
  answer: string;
  sourceCount?: number;
  sources: RagSource[];
}
