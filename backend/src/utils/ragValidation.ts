import { z } from "zod";

export const MAX_RAG_QUERY_LENGTH = 500;
const SEARCHABLE_TEXT_REGEX = /[\p{L}\p{N}]/u;
const SUPPORTED_QUERY_REGEX = /^[\p{L}\p{N}\s'"?!.,:;()[\]\-_/]+$/u;

export const RagQueryRequestSchema = z
  .object({
    query: z
      .string({ error: "Question is required." })
      .trim()
      .min(1, "Question is required.")
      .max(MAX_RAG_QUERY_LENGTH, `Question must be ${MAX_RAG_QUERY_LENGTH} characters or fewer.`)
      .refine((value) => SEARCHABLE_TEXT_REGEX.test(value), "Question must contain searchable text.")
      .refine((value) => SUPPORTED_QUERY_REGEX.test(value), "Question contains unsupported characters."),
  })
  .strict();

export type RagQueryRequest = z.infer<typeof RagQueryRequestSchema>;

export const parseRagQueryRequest = (body: unknown): { query: string } => {
  return RagQueryRequestSchema.parse(body);
};
