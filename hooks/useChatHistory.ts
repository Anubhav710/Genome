import { useState, useCallback, useEffect } from "react";
import { Message, Role } from "../types";

const STORAGE_KEY = "gemini_chat_history";

export const useChatHistory = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  // Load from local storage on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed)) {
            // Reset isStreaming to false for any messages that might have been interrupted
            const sanitized = parsed.map((msg: Message) => ({
              ...msg,
              isStreaming: false,
            }));
            setMessages(sanitized);
          }
        }
      } catch (err) {
        console.error("Failed to load chat history:", err);
      } finally {
        setIsInitialized(true);
      }
    }
  }, []);

  // Save to local storage whenever messages change
  useEffect(() => {
    // Only save if we've finished checking storage on mount to avoid overwriting with empty array
    if (isInitialized && typeof window !== "undefined") {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
      } catch (err) {
        console.error("Failed to save chat history:", err);
      }
    }
  }, [messages, isInitialized]);

  const sendMessage = useCallback(
    async (text: string) => {
      setIsLoading(true);
      setError(null);

      // 1. Add User Message
      const userMessage: Message = {
        id: Date.now().toString(),
        role: Role.USER,
        text: text.trim(),
        timestamp: Date.now(),
      };

      // Keep a local reference to the updated history for the API call
      const updatedHistory = [...messages, userMessage];

      setMessages(updatedHistory);

      // 2. Add Placeholder for Model Message
      const modelMessageId = (Date.now() + 1).toString();
      const initialModelMessage: Message = {
        id: modelMessageId,
        role: Role.MODEL,
        text: "",
        isStreaming: true,
        timestamp: Date.now(),
      };

      setMessages((prev) => [...prev, initialModelMessage]);

      try {
        // 3. Fetch from API Route
        const response = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            message: text,
            // Exclude the optimistically added model message from the history sent to server
            history: updatedHistory,
          }),
        });

        if (!response.ok) {
          throw new Error(response.statusText);
        }

        const reader = response.body?.getReader();
        const decoder = new TextDecoder();

        if (!reader) throw new Error("No reader available");

        let accumulatedText = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value, { stream: true });
          accumulatedText += chunk;

          // Functional update to ensure we are updating the specific message ID with fresh content
          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === modelMessageId
                ? { ...msg, text: accumulatedText }
                : msg
            )
          );
        }

        // 4. Finalize Message
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === modelMessageId ? { ...msg, isStreaming: false } : msg
          )
        );
      } catch (err) {
        console.error("Failed to send message", err);
        setError("Something went wrong. Please try again.");

        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === modelMessageId
              ? {
                  ...msg,
                  isStreaming: false,
                  error: true,
                  text: msg.text + "\n\n[Error generating response]",
                }
              : msg
          )
        );
      } finally {
        setIsLoading(false);
      }
    },
    [messages]
  );

  const clearChat = useCallback(() => {
    setMessages([]);
    setError(null);
    if (typeof window !== "undefined") {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, []);

  return {
    messages,
    isLoading,
    error,
    sendMessage,
    clearChat,
  };
};
