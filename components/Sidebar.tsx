"use client";

import React from "react";
import {
  MessageSquare,
  Plus,
  Trash2,
  X,
  LogOut,
  User as UserIcon,
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  chatId: string | null;
  history: Array<{ id: string; title: string; updatedAt: string }>;
  messageCount: number;
  onSelectChat: (id: string) => void;
  onNewChat: () => void;
  onDeleteChat: (id: string, e: React.MouseEvent) => void;
}

const Sidebar: React.FC<SidebarProps> = ({
  isOpen,
  onClose,
  chatId,
  history,
  messageCount,
  onSelectChat,
  onNewChat,
  onDeleteChat,
}) => {
  const { user, logout } = useAuth();
  const MAX_MESSAGES = 20;

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar Container */}
      <div
        className={`
        fixed  inset-0 md:relative z-50 flex flex-col h-full w-[320px] 
        bg-[#1E1F20] border-r border-gray-200 dark:border-gray-800
        transition-transform duration-300 ease-in-out
        ${isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
      `}
      >
        {/* Header */}
        <div className="p-4 flex items-center justify-between border-b border-gray-200 dark:border-gray-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
              <UserIcon className="w-4 h-4 text-blue-600 dark:text-blue-300" />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-200 truncate max-w-[120px]">
                {user?.name}
              </span>
              <span className="text-[10px] text-gray-400 truncate max-w-[120px]">
                Free Plan
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="md:hidden text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* New Chat Button */}
        <div className="p-4">
          <button
            onClick={onNewChat}
            className="flex items-center justify-center w-full gap-2 px-4 py-2 text-sm font-medium  rounded-lg bg-[#E5E5E5] hover:bg-[#E5E5E5]/80  text-gray-700 font-medium shadow-lg shadow-black/40 transition-all disabled:opacity-60 transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" />
            New Chat
          </button>

          {/* Usage Stats */}
          <div className="mt-3">
            <div className="flex justify-between text-[10px] text-gray-400 mb-1">
              <span>Messages Used</span>
              <span>
                {messageCount} / {MAX_MESSAGES}
              </span>
            </div>
            <div className="w-full h-1.5 bg-[#363636] rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  messageCount >= MAX_MESSAGES ? "bg-red-500" : "bg-[#E5E5E5]"
                }`}
                style={{
                  width: `${Math.min(
                    (messageCount / MAX_MESSAGES) * 100,
                    100
                  )}%`,
                }}
              />
            </div>
          </div>
        </div>

        {/* Chat List */}
        <div className="flex-1 overflow-y-auto px-3 py-2 space-y-1">
          <h3 className="px-2 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
            Recent
          </h3>
          {history.map((chat) => (
            <div
              key={chat.id}
              onClick={() => onSelectChat(chat.id)}
              className={`
                group relative flex items-center gap-3 px-4 py-3 text-sm rounded-full cursor-pointer transition-all
                ${
                  chatId === chat.id
                    ? "bg-[#1F3760] text-gray-900 dark:text-white font-medium shadow-sm"
                    : "text-gray-600 dark:text-gray-400 hover:bg-gray-200/50 dark:hover:bg-gray-800/50 hover:text-gray-900 dark:hover:text-gray-200"
                }
              `}
            >
              <MessageSquare className="w-4 h-4 flex-shrink-0" />
              <span className="truncate flex-1 text-left">{chat.title}</span>

              <button
                onClick={(e) => onDeleteChat(chat.id, e)}
                className="opacity-0 group-hover:opacity-100 p-1 hover:bg-gray-300 dark:hover:bg-gray-700 rounded text-gray-500 hover:text-red-500 transition-all"
                title="Delete chat"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            </div>
          ))}

          {history.length === 0 && (
            <div className="text-center py-8 px-4">
              <p className="text-xs text-gray-400">No conversation history.</p>
            </div>
          )}
        </div>

        {/* Footer / Logout */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-800">
          <button
            onClick={logout}
            className="flex items-center justify-center w-full gap-2 px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
