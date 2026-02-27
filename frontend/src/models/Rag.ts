export enum RAGMode {
  GLOBAL = "GLOBAL",
  PERSONAL = "PERSONAL",
}

export interface RagQueryRequest {
  query: string;
  mode?: RAGMode;
}

export interface RagSource {
  id: string;
  score: number;
  payload: {
    title?: string;
    content?: string;
    description?: string;
    type: "book" | "review";
    [key: string]: any;
  };
}

export interface RagQueryResponse {
  answer: string;
  sources: RagSource[];
}
