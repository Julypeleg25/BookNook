import { GoogleGenerativeAI } from "@google/generative-ai";
import { ENV } from "@config/config";

const genAI = new GoogleGenerativeAI(ENV.GEMINI_API_KEY!);

export interface GenerationOptions {
    mode: "general" | "personalized";
}

export const generateAnswer = async (
    query: string,
    context: string,
    opts: GenerationOptions
): Promise<string> => {
    try {
        const model = genAI.getGenerativeModel({
            model: "gemini-2.5-flash",
            generationConfig: {
                temperature: 0.4,
            }
        });

        const systemInstruction = opts.mode === "personalized"
            ? `You are the 'Personal Book Helper'. 
               You will receive two sections: <USER_PROFILE> and <GLOBAL_KNOWLEDGE>.
               
               ANTI-HALLUCINATION RULES:
               1. NEVER attribute opinions found in <GLOBAL_KNOWLEDGE> to the user in <USER_PROFILE> unless the names match exactly.
               2. If <USER_PROFILE> contains 'NEW_USER', do not invent a persona. Instead, say: 'Since we're just getting to know each other, I’ve pulled some popular titles based on your search, but I’d love to know your favorite genres!'
               3. Use the 'Inferred Interests' in the profile to explain WHY you are recommending a book (e.g., 'You recently liked a review of [Book X], so I think you'll enjoy this...').
               
               Tone: Warm, helpful, and deeply personal.`
            : `You are a 'Professional Librarian'.
               Provide factual, objective, and helpful information based on <GLOBAL_KNOWLEDGE>.
               Do not use personal pronouns like 'I recommend for you' or reference personal profiles.
               Tone: Neutral and formal.`;

        const prompt = `
${systemInstruction}

CONTEXT:
${context}

USER QUERY:
${query}

Please provide a concise and helpful response based STRICTLY on the context provided.
`.trim();

        const result = await model.generateContent(prompt);
        return result.response.text();
    } catch (err: any) {
        console.error("[GenerationService] Gemini generation failed:", err);
        throw err;
    }
};