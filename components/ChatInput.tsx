"use client";

import React, { useState, useRef, useEffect } from "react";
import { Send, Loader2 } from "lucide-react";
import { PlaceholdersAndVanishInput } from "./ui/placeholders-and-vanish-input";

interface ChatInputProps {
  onSend: (message: string) => void;
  isLoading: boolean;
  onTyping?: (isTyping: boolean) => void;
}

const ChatInput: React.FC<ChatInputProps> = ({
  onSend,
  isLoading,
  onTyping,
}) => {
  const [input, setInput] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    onSend(input);
    setInput("");
  };

  return (
    <div className="w-full max-w-3xl mx-auto p-4 relative z-10">
      <PlaceholdersAndVanishInput
        placeholders={[
          "Ask Genome anything...",
          "Explain this code...",
          "Generate ideas...",
        ]}
        onChange={(e) => setInput(e.target.value)}
        onSubmit={handleSubmit}
      />

      <div className="text-center mt-2">
        <p className="text-xs text-gray-600">
          Powered by Gemini 2.5 Flash. AI can make mistakes. Developed by
          Anubhav Agrawal
        </p>
      </div>
    </div>
  );
};

export default ChatInput;
