"use client";

import React, { useEffect, useRef, useState } from "react";
import { useChat } from "../hooks/useChat";
import { useAuth } from "../contexts/AuthContext";
import ChatInput from "../components/ChatInput";
import MessageBubble from "../components/MessageBubble";
import ThinkingIndicator from "../components/ThinkingIndicator";
import Sidebar from "../components/Sidebar";
import AuthForm from "../components/AuthForm";
import { ThemeToggle } from "../components/ThemeToggle";
import { Sparkles, AlertCircle } from "lucide-react";
import { Role } from "../types";
import Header from "../components/Header";
import Background3D from "../components/Background3D";
import Image from "next/image";

export default function Home() {
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
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isTyping, setIsTyping] = useState(false);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  if (authLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#131314]">
        <div className="spinner">
          <div></div>
          <div></div>
          <div></div>
          <div></div>
          <div></div>
          <div></div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-[#131314] transition-colors duration-300 flex flex-col relative overflow-hidden">
        {/* Render 3D Background on Login too */}
        <Background3D isTyping={false} position={[0, 0, 0]} />
        <div className="absolute top-4 right-4 z-10">
          <ThemeToggle />
        </div>
        <div className="z-10 w-full">
          <AuthForm />
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen   bg-[#131314] text-gray-100 transition-colors duration-300 relative overflow-hidden ">
      {/* 3D Background Layer */}
      <Background3D position={[1, 0, 0]} />

      {/* Sidebar */}
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        chatId={chatId}
        history={chatHistory}
        messageCount={messageCount}
        onSelectChat={(id) => {
          loadChat(id);
          setSidebarOpen(false);
        }}
        onNewChat={() => {
          clearChat();
          setSidebarOpen(false);
        }}
        onDeleteChat={deleteChat}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-full overflow-hidden w-full relative z-10">
        {/* Header */}
        <Header setSidebarOpen={setSidebarOpen} />

        {/* Main Chat Area */}
        <main className="flex-1 overflow-y-auto w-full scroll-smooth">
          <div className="max-w-5xl mx-auto px-4 py-8">
            {/* Welcome Screen */}
            {messages.length === 0 && (
              <div className="flex flex-col items-center justify-center h-[60vh] text-center opacity-0 animate-[fadeIn_0.5s_ease-out_forwards]">
                <div className="w-16 h-16 bg-linear-to-tr from-gray-300 to-gray-900 rounded-2xl flex items-center justify-center mb-6 shadow-xl shadow-blue-500/20">
                  <Image
                    src={"/logo.png"}
                    alt="logo"
                    width={120}
                    height={120}
                  />
                </div>
                <h2 className="text-2xl font-bold text-white mb-2">
                  Welcome, {user.name}
                </h2>
                <p className="text-gray-400 max-w-md">
                  Unlock powerful, human-like AI conversations with Genome.
                  Start by asking anything.
                </p>
              </div>
            )}

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
                messages[messages.length - 1].text === "" && (
                  <ThinkingIndicator />
                )}

              {/* Error Message */}
              {error && (
                <div className="flex justify-center my-4 animate-in fade-in slide-in-from-bottom-2">
                  <div className="bg-red-900/20 text-red-400 px-4 py-3 rounded-xl text-sm border border-red-800 shadow-sm flex items-center gap-2 max-w-md">
                    <AlertCircle className="w-5 h-5 flex-shrink-0" />
                    <p>{error}</p>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>
          </div>
        </main>

        {/* Footer / Input Area */}
        <footer className="flex-none bg-gradient-to-t from-[#131314] via-[#131314] to-transparent pt-4 pb-6 transition-colors duration-300">
          <ChatInput
            onSend={sendMessage}
            isLoading={isLoading}
            onTyping={setIsTyping}
          />
        </footer>
      </div>
    </div>
  );
}
