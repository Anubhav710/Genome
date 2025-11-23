"use client";
import { useChat } from "@/hooks/useChat";
import { AlertCircle, Sparkles } from "lucide-react";
import React, { useEffect, useRef } from "react";
import MessageBubble from "./MessageBubble";
import ThinkingIndicator from "./ThinkingIndicator";
import { useAuth } from "@/contexts/AuthContext";
import { Role } from "@/types";

const ChatArea = () => {
  const { user, isLoading: authLoading } = useAuth();
  const {
    messages,
    isLoading,
    error,
    sendMessage,
    clearChat,
    chatId,
    chatHistory,
    loadChat,
    deleteChat,
    messageCount,
  } = useChat();

  const messagesEndRef = useRef<HTMLDivElement>(null);
  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  console.log(messages);

  return (
    <main className="flex-1 overflow-y-auto w-full scroll-smooth">
      <div className="max-w-3xl mx-auto px-4 py-8">
        {/* Welcome Screen */}
        {/* {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-[60vh] text-center opacity-0 animate-[fadeIn_0.5s_ease-out_forwards]">
            <div className="w-16 h-16 bg-linear-to-tr from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mb-6 shadow-xl shadow-blue-500/20">
              <Sparkles className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">
              Welcome, {user?.name}
            </h2>
            <p className="text-gray-500 dark:text-gray-400 max-w-md">
              Experience real-time AI conversations powered by Google's Gemini
              2.5 Flash model. Ask anything to get started.
            </p>
          </div>
        )} */}

        {/* Messages List */}
        <div className="space-y-6 pb-4">
          {messages.map((msg) => {
            if (
              msg.role === Role.MODEL &&
              msg.text === "" &&
              (isLoading || msg.isStreaming)
            ) {
              return null;
            }
            return <MessageBubble key={msg.id} message={msg} />;
          })}

          {/* Loading Indicator */}
          {isLoading &&
            messages.length > 0 &&
            messages[messages.length - 1].role === Role.MODEL &&
            messages[messages.length - 1].text === "" && <ThinkingIndicator />}

          {/* Error Message */}
          {error && (
            <div className="flex justify-center my-4 animate-in fade-in slide-in-from-bottom-2">
              <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 px-4 py-3 rounded-xl text-sm border border-red-100 dark:border-red-800 shadow-sm flex items-center gap-2 max-w-md">
                <AlertCircle className="w-5 h-5 shrink-0" />
                <p>{error}</p>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>
    </main>
  );
};

export default ChatArea;
