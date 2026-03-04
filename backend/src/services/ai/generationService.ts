import { GoogleGenerativeAI } from "@google/generative-ai";
import { ENV } from "@config/config";

const genAI = new GoogleGenerativeAI(ENV.GEMINI_API_KEY);

export const generateAnswer = async (query: string, context: string, opts: any) => {
    try {
        const model = genAI.getGenerativeModel({
            model: "gemini-2.5-flash",
        });

        const systemInstruction = opts.mode === "personalized"
            ? "You are the 'Personal Book Butler'..."
            : "You are a 'Professional Librarian'...";


        const prompt = `
            ${systemInstruction}
            CONTEXT: ${context}
            USER QUERY: ${query}
        `;

        const result = await model.generateContent(prompt);
        return result.response.text();
    } catch (err: any) {
        console.error("Detailed Error:", err);
        throw err;
    }
};