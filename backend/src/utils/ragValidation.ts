const MAX_QUERY_LENGTH = 500;
const SEARCHABLE_TEXT_REGEX = /[\p{L}\p{N}]/u;
const SUPPORTED_QUERY_REGEX = /^[\p{L}\p{N}\s'"?!.,:;()[\]\-_/]+$/u;

export const validateRagQuery = (query: unknown): { isValid: boolean; normalizedQuery?: string; error?: string } => {
  if (typeof query !== "string") {
    return { isValid: false, error: "Question is required." };
  }

  const normalizedQuery = query.trim();

  if (!normalizedQuery) {
    return { isValid: false, error: "Question is required." };
  }

  if (normalizedQuery.length > MAX_QUERY_LENGTH) {
    return {
      isValid: false,
      error: `Question must be ${MAX_QUERY_LENGTH} characters or fewer.`,
    };
  }

  if (!SEARCHABLE_TEXT_REGEX.test(normalizedQuery)) {
    return { isValid: false, error: "Question must contain searchable text." };
  }

  if (!SUPPORTED_QUERY_REGEX.test(normalizedQuery)) {
    return {
      isValid: false,
      error: "Question contains unsupported characters.",
    };
  }

  return { isValid: true, normalizedQuery };
};
