import React from 'react';
import { useTheme } from '../../context/ThemeContext';
import { Sun, Moon, Bell } from 'lucide-react';

/*
 * TopNavbar — Sticky glassmorphism header.
 * Apple-inspired: transparent background with blur,
 * minimal controls aligned right, no clutter.
 */
export default function TopNavbar() {
  const { isDark, toggleTheme } = useTheme();

  return (
    <header className="h-14 px-6 flex items-center justify-between glass dark:glass-dark border-b border-gray-100/60 dark:border-white/5 sticky top-0 z-10 shrink-0">

      {/* Left — greeting */}
      <h2 className="text-[14px] font-medium text-textSecondary hidden sm:block">
        Good morning, Admin
      </h2>

      {/* Right — actions */}
      <div className="flex items-center gap-1 ml-auto">

        {/* Theme toggle */}
        <button
          onClick={toggleTheme}
          className="p-2.5 rounded-full text-textSecondary hover:bg-surfaceAlt dark:hover:bg-white/5 transition-colors duration-200"
          title="Toggle theme"
        >
          {isDark ? <Sun size={17} /> : <Moon size={17} />}
        </button>

        {/* Notifications */}
        <div className="relative">
          <button className="p-2.5 rounded-full text-textSecondary hover:bg-surfaceAlt dark:hover:bg-white/5 transition-colors duration-200">
            <Bell size={17} />
          </button>
          <span className="absolute top-2 right-2 w-2 h-2 bg-apple-red rounded-full" />
        </div>

        {/* Divider */}
        <div className="w-px h-5 bg-gray-200 dark:bg-white/10 mx-2" />

        {/* Avatar */}
        <button className="flex items-center gap-2.5 hover:opacity-70 transition-opacity">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-apple-blue to-blue-600 flex items-center justify-center text-white text-[11px] font-semibold">
            AD
          </div>
          <div className="hidden md:block text-left">
            <p className="text-[13px] font-medium text-textPrimary dark:text-white leading-none">Admin</p>
            <p className="text-[10px] text-textSecondary mt-0.5">HR Manager</p>
          </div>
        </button>
      </div>
    </header>
  );
}
