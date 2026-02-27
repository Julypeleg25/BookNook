import { Request, Response, NextFunction } from "express";
import rateLimit from "express-rate-limit";

// SENSITIVE KEYWORDS (English & Hebrew)
const SENSITIVE_KEYWORDS = [
  "password", "email", "login", "credentials", "token", "api key", "session",
  "private data", "reset", "auth", "סיסמה", "אימייל", "פרטי חשבון", "התחברות",
  "סודי", "מפתח", "גישה"
];

// PATTERNS FOR SENSITIVE DATA
const SENSITIVE_PATTERNS = [
  /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/, // Emails
  /\b(bearer|token|apikey)\b/i, // Tokens
  /ignore previous instructions/i, // Prompt Injection
  /reveal system info/i,
  /print database content/i,
  /show me hidden data/i
];

/**
 * MANDATORY REFUSAL RESPONSE
 */
export const REFUSAL_RESPONSE = {
  answer: "I cannot help with that request.",
  sources: []
};

/**
 * Security Filter Middleware
 * Blocks sensitive queries before they reach LLM or Vector Store
 */
export const securityFilter = (req: Request, res: Response, next: NextFunction) => {
  const { query } = req.body;

  if (!query || typeof query !== 'string') {
    return next();
  }

  const normalizedQuery = query.toLowerCase();

  // 1. Keyword check
  const hasSensitiveKeyword = SENSITIVE_KEYWORDS.some(keyword => normalizedQuery.includes(keyword.toLowerCase()));
  
  // 2. Pattern check
  const hasSensitivePattern = SENSITIVE_PATTERNS.some(pattern => pattern.test(normalizedQuery));

  if (hasSensitiveKeyword || hasSensitivePattern) {
    console.warn(`[SECURITY ALERT] Rejected query: "${query}" | Reason: Sensitive ${hasSensitiveKeyword ? 'Keyword' : 'Pattern'}`);
    // You could also log to a file or a dedicated audit DB here
    return res.status(200).json(REFUSAL_RESPONSE);
  }

  next();
};

/**
 * RAG API Rate Limiter
 * Protects OpenAI credits from abuse
 */
export const ragRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 50, // Limit each IP to 50 requests per window
  message: {
    answer: "Too many requests. Please try again later.",
    sources: []
  },
  standardHeaders: true,
  legacyHeaders: false,
});
