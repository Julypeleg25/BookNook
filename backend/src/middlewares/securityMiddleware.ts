import { Request, Response, NextFunction } from "express";
import rateLimit from "express-rate-limit";

const SENSITIVE_KEYWORDS = [
  "password", "email", "login", "credentials", "token", "api key", "session",
  "private data", "reset", "auth", "סיסמה", "אימייל", "פרטי חשבון", "התחברות",
  "סודי", "מפתח", "גישה"
];

const SENSITIVE_PATTERNS = [
  /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/,
  /\b(bearer|token|apikey)\b/i,
  /ignore previous instructions/i,
  /reveal system info/i,
  /print database content/i,
  /show me hidden data/i
];


export const REFUSAL_RESPONSE = {
  answer: "I cannot help with that request.",
  sources: []
};

export const securityFilter = (req: Request, res: Response, next: NextFunction) => {
  const { query } = req.body;

  if (!query || typeof query !== 'string') {
    return next();
  }

  const normalizedQuery = query.toLowerCase();

  const hasSensitiveKeyword = SENSITIVE_KEYWORDS.some(keyword => normalizedQuery.includes(keyword.toLowerCase()));

  const hasSensitivePattern = SENSITIVE_PATTERNS.some(pattern => pattern.test(normalizedQuery));

  if (hasSensitiveKeyword || hasSensitivePattern) {
    console.warn(`[SECURITY ALERT] Rejected query: "${query}" | Reason: Sensitive ${hasSensitiveKeyword ? 'Keyword' : 'Pattern'}`);
    return res.status(200).json(REFUSAL_RESPONSE);
  }

  next();
};


export const ragRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 50,
  message: {
    answer: "Too many requests. Please try again later.",
    sources: []
  },
  standardHeaders: true,
  legacyHeaders: false,
});
