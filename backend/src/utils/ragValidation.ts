export const validateRagQuery = (query: string): { isValid: boolean, error?: string } => {
    if (!query || typeof query !== "string") {
        return { isValid: false, error: "Query is required and must be a string." };
    }

    if (query.length > 500) {
        return { isValid: false, error: "Query exceeds maximum allowed length." };
    }

    const strippedQuery = query.replace(/[0-9\s!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?£€]/g, "");

    if (strippedQuery.length === 0) {
        return { isValid: false, error: "Query must contain searchable text." };
    }

    const forbiddenExtendedRegex = /[À-ž]/;


    const englishAndHebrewRegex = /^[a-zA-Z\u0590-\u05FF]+$/;

    if (forbiddenExtendedRegex.test(strippedQuery) || !englishAndHebrewRegex.test(strippedQuery)) {
        return { isValid: false, error: "Only Hebrew and English queries are supported." };
    }

    return { isValid: true };
};
