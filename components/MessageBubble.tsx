import React, { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Copy, Check } from "lucide-react";
import { Message, Role } from "../types";

interface MessageBubbleProps {
  message: Message;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({ message }) => {
  const isUser = message.role === Role.USER;
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    if (!message.text) return;
    try {
      await navigator.clipboard.writeText(message.text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy text:", err);
    }
  };

  return (
    <div
      className={`flex w-full font-google-sans-code ${
        isUser ? "justify-end" : "justify-start"
      } mb-6 group`}
    >
      <div
        className={`relative max-w-[85%] sm:max-w-[75%] px-5 py-3.5 
          ${
            isUser
              ? "bg-[#282A2C] text-white rounded-2xl rounded-tr-none"
              : "bg-[rgba(0,0,0,0.1)] border-l     backdrop-blur-md  rounded-tl-none rounded-2xl"
          }
        `}
      >
        <div
          className={`text-sm sm:text-base leading-relaxed wrap-break-word ${
            isUser ? "text-white" : "text-white"
          }`}
        >
          {isUser ? (
            <div className="whitespace-pre-wrap font-google-sans-code">
              {message.text}
            </div>
          ) : (
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                p: ({ node, ...props }) => (
                  <p className="mb-2 last:mb-0" {...props} />
                ),
                ul: ({ node, ...props }) => (
                  <ul className="list-disc ml-4 mb-2 space-y-1" {...props} />
                ),
                ol: ({ node, ...props }) => (
                  <ol className="list-decimal ml-4 mb-2 space-y-1" {...props} />
                ),
                li: ({ node, ...props }) => <li className="" {...props} />,
                a: ({ node, ...props }) => (
                  <a
                    className="text-blue-600 hover:underline underline-offset-2"
                    target="_blank"
                    rel="noopener noreferrer"
                    {...props}
                  />
                ),
                blockquote: ({ node, ...props }) => (
                  <blockquote
                    className="border-l-4 border-gray-300 pl-4 italic my-2 text-gray-600"
                    {...props}
                  />
                ),
                code({ node, inline, className, children, ...props }: any) {
                  const match = /language-(\w+)/.exec(className || "");
                  return !inline ? (
                    <div className="relative my-3 rounded-lg overflow-hidden bg-gray-900">
                      <div className="flex items-center justify-between px-4 py-2 bg-gray-800 text-xs text-gray-400">
                        <span>{match ? match[1] : "text"}</span>
                      </div>
                      <div className="overflow-x-auto">
                        <pre
                          className="p-4 text-gray-100 text-sm  leading-relaxed"
                          {...props}
                        >
                          <code>{children}</code>
                        </pre>
                      </div>
                    </div>
                  ) : (
                    <code
                      className="bg-gray-100 text-gray-800 px-1.5 py-0.5 rounded text-sm  border border-gray-200"
                      {...props}
                    >
                      {children}
                    </code>
                  );
                },
                h1: ({ node, ...props }) => (
                  <h1
                    className="text-xl font-bold mb-3 mt-4 first:mt-0"
                    {...props}
                  />
                ),
                h2: ({ node, ...props }) => (
                  <h2 className="text-lg font-bold mb-2 mt-3" {...props} />
                ),
                h3: ({ node, ...props }) => (
                  <h3 className="text-base font-bold mb-2 mt-3" {...props} />
                ),
                table: ({ node, ...props }) => (
                  <div className="overflow-x-auto mb-4 rounded-lg border border-gray-200">
                    <table
                      className="min-w-full divide-y divide-gray-200"
                      {...props}
                    />
                  </div>
                ),
                th: ({ node, ...props }) => (
                  <th
                    className="px-3 py-2 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    {...props}
                  />
                ),
                td: ({ node, ...props }) => (
                  <td
                    className="px-3 py-2 text-sm text-gray-700 border-t border-gray-200"
                    {...props}
                  />
                ),
                hr: ({ node, ...props }) => (
                  <hr className="my-4 border-gray-200" {...props} />
                ),
              }}
            >
              {message.text}
            </ReactMarkdown>
          )}
        </div>

        {/* Footer: Timestamp and Actions */}
        <div
          className={`flex items-center mt-1 ${
            isUser
              ? "justify-end text-blue-100"
              : "justify-between text-gray-400"
          }`}
        >
          <div className={`text-[10px] opacity-60 flex items-center gap-1`}>
            <span>
              {new Date(message.timestamp).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
            {message.isStreaming && !isUser && (
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
            )}
          </div>

          {!isUser && message.text && (
            <button
              onClick={handleCopy}
              className="p-1 -mr-1 rounded-md hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-all opacity-0 group-hover:opacity-100 focus:opacity-100"
              aria-label="Copy response"
              title="Copy to clipboard"
            >
              {copied ? (
                <Check className="w-3.5 h-3.5 text-green-500" />
              ) : (
                <Copy className="w-3.5 h-3.5" />
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default MessageBubble;
