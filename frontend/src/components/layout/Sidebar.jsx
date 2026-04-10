import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard, Users, BellRing, BrainCircuit,
  Activity, Sparkles, ChevronRight, Video
} from 'lucide-react';

/*
 * Sidebar — Apple-inspired left navigation.
 * Design decisions:
 *   – Pure white / true-black surface (no gray tints)
 *   – Ultra-thin separator line, not borders
 *   – Active state uses subtle blue background tint
 *   – Generous 60px vertical rhythm on items
 */

const navItems = [
  { name: 'Dashboard',    path: '/',              icon: LayoutDashboard, exact: true },
  { name: 'Employees',    path: '/employees',     icon: Users },
  { name: 'Alerts',       path: '/alerts',        icon: BellRing },
  { name: 'Insights',     path: '/insights',      icon: Sparkles },
  { name: 'AI Assistant', path: '/ai-assistant',  icon: BrainCircuit },
  { name: 'Meeting',      path: '/meeting',       icon: Video },
];

export default function Sidebar() {
  return (
    <aside className="hidden sm:flex w-[240px] flex-col shrink-0 bg-white dark:bg-surfaceDark border-r border-gray-100 dark:border-white/5 h-screen sticky top-0 z-20">

      {/* ── Logo ── */}
      <div className="h-16 flex items-center px-6 shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-apple-blue flex items-center justify-center">
            <Activity size={16} className="text-white" strokeWidth={2.5} />
          </div>
          <div className="leading-tight">
            <span className="text-[15px] font-semibold text-textPrimary dark:text-white tracking-tight">
              Oasis
            </span>
            <span className="block text-[10px] text-textSecondary uppercase tracking-[0.12em] -mt-0.5">
              Analytics
            </span>
          </div>
        </div>
      </div>

      {/* ── Navigation ── */}
      <nav className="flex-1 px-3 pt-4 pb-4 overflow-y-auto">
        <p className="text-[10px] uppercase tracking-[0.12em] font-medium text-textSecondary px-3 mb-3">
          Menu
        </p>
        <div className="space-y-1">
          {navItems.map(({ name, path, icon: Icon, exact }) => (
            <NavLink
              key={name}
              to={path}
              end={exact}
              className={({ isActive }) =>
                `group flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-medium transition-all duration-200 ease-apple ${
                  isActive
                    ? 'bg-apple-blue/8 text-apple-blue dark:bg-apple-blue/15 dark:text-blue-400'
                    : 'text-textSecondary hover:bg-surfaceAlt dark:hover:bg-white/5 hover:text-textPrimary dark:hover:text-white'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <Icon size={18} strokeWidth={isActive ? 2.2 : 1.7} />
                  <span className="flex-1">{name}</span>
                  {isActive && <ChevronRight size={14} className="opacity-40" />}
                </>
              )}
            </NavLink>
          ))}
        </div>
      </nav>

      {/* ── AI Promo — subtle, not loud ── */}
      <div className="px-3 pb-4 shrink-0">
        <div className="p-4 rounded-2xl bg-surfaceAlt dark:bg-white/5">
          <BrainCircuit size={20} className="text-apple-blue mb-2 opacity-80" />
          <h4 className="text-[13px] font-semibold text-textPrimary dark:text-white">
            Burnout Buddy
          </h4>
          <p className="text-[11px] text-textSecondary mt-0.5 mb-3">
            AI-powered workforce coach
          </p>
          <NavLink
            to="/ai-assistant"
            className="block w-full text-center text-[12px] font-medium text-apple-blue bg-apple-blue/8 hover:bg-apple-blue/15 py-2 rounded-lg transition-colors"
          >
            Open Chat →
          </NavLink>
        </div>
      </div>
    </aside>
  );
}
