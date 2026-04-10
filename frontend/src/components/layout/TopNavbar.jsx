import React from 'react';
import { useTheme } from '../../context/ThemeContext';
import { Sun, Moon, Bell, UserCircle } from 'lucide-react';

export default function TopNavbar() {
  const { isDark, toggleTheme } = useTheme();

  return (
    <header className="h-16 px-6 glass-panel border-b-0 rounded-none rounded-b-none border-x-0 border-t-0 flex items-center justify-between shadow-sm z-10 sticky top-0">
      <div className="flex items-center">
        <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-100 hidden sm:block">
          Good Morning, Admin 👋
        </h2>
      </div>

      <div className="flex items-center gap-4">
        <button
          onClick={toggleTheme}
          className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-slate-500 dark:text-slate-400"
        >
          {isDark ? <Sun size={20} /> : <Moon size={20} />}
        </button>

        <div className="relative">
          <button className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-slate-500 dark:text-slate-400">
            <Bell size={20} />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border border-white dark:border-slate-900"></span>
          </button>
        </div>

        <div className="flex items-center gap-2 pl-2 border-l border-slate-200 dark:border-slate-700">
          <UserCircle size={28} className="text-slate-400" />
          <span className="text-sm font-medium text-slate-700 dark:text-slate-300 hidden md:block">Profile</span>
        </div>
      </div>
    </header>
  );
}
