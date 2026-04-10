import React from 'react';

export default function KpiCard({ title, value, change, icon, isPositiveChange }) {
  return (
    <div className="glass-panel p-5 flex flex-col hover:shadow-lg transition-shadow duration-300">
      <div className="flex justify-between items-start mb-4">
        <div className="p-3 bg-primary-50 dark:bg-slate-800 rounded-xl text-primary-600 dark:text-primary-400">
          {icon}
        </div>
        {change && (
          <span className={`text-sm font-semibold px-2 py-1 rounded-full ${
            isPositiveChange === false 
              ? 'bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400' 
              : 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400'
          }`}>
            {change}
          </span>
        )}
      </div>
      <div>
        <h3 className="text-3xl font-bold text-slate-800 dark:text-slate-100">{value}</h3>
        <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mt-1">{title}</p>
      </div>
    </div>
  );
}
