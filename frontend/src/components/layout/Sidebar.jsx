import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Users, BellAlert, BrainCircuit, Activity } from 'lucide-react';

export default function Sidebar() {
  const navItems = [
    { name: 'Dashboard', path: '/', icon: <LayoutDashboard size={20} /> },
    { name: 'Employees', path: '/employees', icon: <Users size={20} /> },
    { name: 'Alerts', path: '/alerts', icon: <BellAlert size={20} /> },
    { name: 'AI Assistant', path: '/ai-assistant', icon: <BrainCircuit size={20} /> },
  ];

  return (
    <aside className="w-64 flex-shrink-0 glass-panel border-r-0 border-y-0 rounded-none sm:block hidden min-h-screen">
      <div className="h-16 flex items-center px-6 border-b border-slate-200/50 dark:border-slate-700/50">
        <div className="flex items-center gap-2 text-primary-600 dark:text-primary-400">
          <Activity size={24} strokeWidth={2.5} />
          <span className="text-lg font-bold tracking-tight">Oasis<span className="text-slate-800 dark:text-slate-100">Analytics</span></span>
        </div>
      </div>

      <div className="p-4 flex flex-col gap-2">
        <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2 px-2">Menu</p>
        {navItems.map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 font-medium text-sm ${
                isActive
                  ? 'bg-primary-50 text-primary-700 dark:bg-primary-900/30 dark:text-primary-400 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-200'
              }`
            }
          >
            {item.icon}
            {item.name}
          </NavLink>
        ))}
      </div>
      
      <div className="absolute bottom-8 left-4 right-4">
        <div className="p-4 rounded-xl bg-gradient-to-br from-indigo-500 rounded-2xl to-primary-600 text-white shadow-lg relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-20"><BrainCircuit size={48} /></div>
          <h4 className="font-semibold text-sm mb-1 relative z-10">Burnout Buddy AI</h4>
          <p className="text-xs text-indigo-100 mb-3 relative z-10">Your enterprise AI health assistant</p>
          <button className="bg-white text-primary-600 text-xs font-semibold px-3 py-1.5 rounded-lg w-full shadow-sm hover:bg-slate-50 transition relative z-10">
            Ask AI
          </button>
        </div>
      </div>
    </aside>
  );
}
