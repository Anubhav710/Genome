import React, { useState, useEffect } from "react";
import { Sparkles } from "lucide-react";

const LOADING_TEXTS = [
  "Genome is thinking...",
  "Analyzing your request...",
  "Generating response...",
  "Just a moment...",
];

const ThinkingIndicator: React.FC = () => {
  const [textIndex, setTextIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setTextIndex((prev) => (prev + 1) % LOADING_TEXTS.length);
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex items-center space-x-3 px-5 py-4 bg-[#E5E5E5] rounded-2xl rounded-tl-none border border-gray-100 shadow-sm w-fit animate-in fade-in slide-in-from-bottom-2 duration-300">
      <div className="relative flex-shrink-0">
        <div className="absolute inset-0 bg-blue-100 rounded-full animate-ping opacity-50"></div>
      </div>

      <div className="flex flex-col justify-center min-w-[120px]">
        <span className="text-sm font-medium text-gray-600 transition-all duration-300">
          {LOADING_TEXTS[textIndex]}
        </span>
      </div>

      <div className="flex space-x-1 flex-shrink-0">
        <div
          className="w-1.5 h-1.5 bg-gray-700 rounded-full animate-bounce"
          style={{ animationDelay: "0ms" }}
        ></div>
        <div
          className="w-1.5 h-1.5 bg-gray-700 rounded-full animate-bounce"
          style={{ animationDelay: "150ms" }}
        ></div>
        <div
          className="w-1.5 h-1.5 bg-gray-700 rounded-full animate-bounce"
          style={{ animationDelay: "300ms" }}
        ></div>
      </div>
    </div>
  );
};

export default ThinkingIndicator;
