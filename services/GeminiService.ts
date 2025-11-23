import { GoogleGenAI, Content } from "@google/genai";
import { Message, Role } from "../types";

// Initialize the API client on the server
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// Using Gemini 2.5 Flash for high speed and low latency streaming
const MODEL_NAME = "gemini-2.5-flash";

export class GeminiService {
  /**
   * Generates a streaming response from Gemini based on message history.
   * Designed to be called from a Server Component or Route Handler.
   */
  async *streamChat(
    message: string,
    history: Message[]
  ): AsyncGenerator<string, void, unknown> {
    // Convert application history to Gemini SDK format
    const formattedHistory: Content[] = history.map((msg) => ({
      role: msg.role === Role.USER ? "user" : "model",
      parts: [{ text: msg.text }],
    }));

    const chat = ai.chats.create({
      model: MODEL_NAME,
      history: formattedHistory,
      config: {
        systemInstruction:
          "You are a helpful, knowledgeable, and concise AI assistant. Format your responses with clear markdown when appropriate.",
      },
    });

    try {
      const resultStream = await chat.sendMessageStream({ message });

      for await (const chunk of resultStream) {
        if (chunk.text) {
          yield chunk.text;
        }
      }
    } catch (error) {
      console.error("Error in Gemini stream:", error);
      throw error;
    }
  }
}

export const geminiService = new GeminiService();
