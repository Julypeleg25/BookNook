import OpenAI from "openai";
import dotenv from "dotenv";

dotenv.config();

const testMode = process.env.TEST_MODE === 'true';

const openai = testMode ? null : new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * Generate embeddings for text
 */
export const generateEmbedding = async (text: string): Promise<number[]> => {
  if (testMode) {
    console.log("[AI SERVICE] TEST_MODE: Mocking embedding");
    return new Array(1536).fill(0).map(() => Math.random());
  }

  if (!openai) throw new Error("OpenAI not initialized");

  const response = await openai.embeddings.create({
    model: "text-embedding-3-small",
    input: text,
    encoding_format: "float",
  });

  return response.data[0].embedding;
};

/**
 * Get AI Completion with context
 */
export const getAiResponse = async (prompt: string, context: string) => {
  if (testMode) {
    console.log("[AI SERVICE] TEST_MODE: Mocking AI Response");
    return "This is a mock response because TEST_MODE is enabled. In production, this would be the actual answer from OpenAI.";
  }

  if (!openai) throw new Error("OpenAI not initialized");

  const fullPrompt = `
Context Information:
---------------------
${context}
---------------------

User Question: ${prompt}

System Instructions:
You are a helpful book review assistant. Use the context provided above to answer the user's question. 
You must not answer questions about passwords, email addresses, login credentials, or any private account information. If asked, respond that you cannot help with that request.
Support Hebrew and English. If the user asks in Hebrew, answer in Hebrew.

Must return JSON format:
{
  "answer": "...",
  "sources": ["..."]
}
`;

  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      { role: "system", content: "You are a secure book review assistant." },
      { role: "user", content: fullPrompt }
    ],
    response_format: { type: "json_object" }
  });

  const content = response.choices[0].message.content || '{"answer": "No response generated.", "sources": []}';
  return JSON.parse(content);
};
