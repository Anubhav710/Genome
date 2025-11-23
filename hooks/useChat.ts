import { useState, useCallback, useEffect } from "react";
import { Message, Role } from "../types";
import { useAuth } from "../contexts/AuthContext";

export const useChat = () => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [chatId, setChatId] = useState<string | null>(null);
  const [chatHistory, setChatHistory] = useState<
    Array<{ id: string; title: string; updatedAt: string }>
  >([]);
  const [messageCount, setMessageCount] = useState(0);

  // Fetch History and Usage
  const refreshHistory = useCallback(async () => {
    if (!user?.id) return;
    try {
      const res = await fetch(`/api/history?userId=${user.id}`);
      if (res.ok) {
        const data = await res.json();
        setChatHistory(data.chats || []);
        setMessageCount(data.messageCount || 0);
      }
    } catch (e) {
      console.error("Failed to fetch history");
    }
  }, [user?.id]);

  useEffect(() => {
    if (user?.id) {
      refreshHistory();
    } else {
      setMessages([]);
      setChatHistory([]);
      setMessageCount(0);
      setChatId(null);
    }
  }, [refreshHistory, user?.id]);

  // Load a specific chat
  const loadChat = useCallback(
    async (id: string) => {
      if (!user?.id) return;
      setIsLoading(true);
      setChatId(id);
      setMessages([]); // Clear current view
      setError(null);

      try {
        const res = await fetch(`/api/chat/${id}?userId=${user.id}`);
        if (res.ok) {
          const data = await res.json();
          setMessages(data.messages);
        } else {
          setError("Failed to load chat");
        }
      } catch (e) {
        setError("Network error");
      } finally {
        setIsLoading(false);
      }
    },
    [user?.id]
  );

  // Start new chat
  const clearChat = useCallback(() => {
    setMessages([]);
    setChatId(null);
    setError(null);
  }, []);

  const deleteChat = useCallback(
    async (id: string) => {
      if (!user?.id) return;
      try {
        await fetch(`/api/history?id=${id}&userId=${user.id}`, {
          method: "DELETE",
        });
        await refreshHistory();
        if (chatId === id) {
          clearChat();
        }
      } catch (e) {
        console.error(e);
      }
    },
    [user?.id, refreshHistory, chatId, clearChat]
  );

  const sendMessage = useCallback(
    async (text: string) => {
      if (!user?.id) {
        setError("Please log in to send messages.");
        return;
      }

      setIsLoading(true);
      setError(null);

      // 1. Add User Message
      const userMessage: Message = {
        id: Date.now().toString(),
        role: Role.USER,
        text: text.trim(),
        timestamp: Date.now(),
      };

      const updatedHistory = [...messages, userMessage];
      setMessages(updatedHistory);

      // 2. Add Placeholder
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
        // 3. Fetch
        const response = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            message: text,
            history: updatedHistory,
            userId: user.id,
            chatId,
          }),
        });

        if (response.status === 403) {
          const errorText = await response.text();
          throw new Error(errorText);
        }

        if (!response.ok) throw new Error(response.statusText);

        // Check for new Chat ID in headers
        const newChatId = response.headers.get("X-Chat-Id");
        if (newChatId && newChatId !== chatId) {
          setChatId(newChatId);
        }

        // Refresh history/counts in background
        refreshHistory();

        const reader = response.body?.getReader();
        const decoder = new TextDecoder();
        if (!reader) throw new Error("No reader");

        let accumulatedText = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          const chunk = decoder.decode(value, { stream: true });
          accumulatedText += chunk;

          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === modelMessageId
                ? { ...msg, text: accumulatedText }
                : msg
            )
          );
        }

        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === modelMessageId ? { ...msg, isStreaming: false } : msg
          )
        );
      } catch (err: any) {
        console.error(err);
        setError(err.message || "Something went wrong.");
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === modelMessageId
              ? { ...msg, isStreaming: false, error: true, text: msg.text }
              : msg
          )
        );
        // Remove the failed message if it was empty
        setMessages((prev) => {
          const last = prev[prev.length - 1];
          if (last.id === modelMessageId && !last.text) {
            return prev.slice(0, -1);
          }
          return prev;
        });
      } finally {
        setIsLoading(false);
      }
    },
    [messages, user?.id, chatId, refreshHistory]
  );

  return {
    messages,
    isLoading,
    error,
    sendMessage,
    clearChat,
    chatId,
    chatHistory,
    loadChat,
    deleteChat,
    user,
    messageCount,
  };
};
