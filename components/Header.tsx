import { Github, Menu, Sparkles } from "lucide-react";
import Link from "next/link";
import React from "react";

interface HeaderProps {
  setSidebarOpen: (open: boolean) => void;
}

const Header: React.FC<HeaderProps> = ({ setSidebarOpen }) => {
  return (
    <header className="flex-none sticky top-0 z-10 transition-colors duration-300">
      <div className="  px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 -ml-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 md:hidden"
          >
            <Menu className="w-5 h-5 text-gray-600 dark:text-gray-300" />
          </button>

          <h1 className="text-[#C4C7C5] font-bold text-2xl">Genome</h1>
        </div>

        <div className="flex items-center gap-5">
          {/* Github Link */}
          <Link
            href="https://github.com/Anubhav710"
            target="_blank"
            rel="noreferrer"
            className="p-2 text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100 transition-colors"
            title="GitHub"
          >
            <Github className="w-5 h-5" />
          </Link>
          {/* Portfolio Link */}
          <Link
            href="https://codewithanubhav.netlify.app/" // example portfolio link, change as needed
            target="_blank"
            rel="noreferrer"
            className="p-2 text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100 transition-colors flex items-center gap-1"
            title="Check out my portfolio"
          >
            <Sparkles className="w-5 h-5" />
            <span className="hidden sm:inline text-sm font-medium">
              Portfolio
            </span>
          </Link>
        </div>
      </div>
    </header>
  );
};

export default Header;
