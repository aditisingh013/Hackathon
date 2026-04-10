import React from 'react';
import { motion } from 'framer-motion';

/*
 * KpiCard — Apple-clean metric card.
 * change prop accepts: string, number, or { val, time } object.
 */
export default function KpiCard({ title, value, change, positive, icon }) {
  // Safely format change regardless of whether it's a string or {val, time} object
  const changeLabel = change
    ? typeof change === 'object'
      ? `${positive ? '+' : '-'}${change.val}% / ${change.time}`
      : change
    : null;

  return (
    <motion.div
      whileHover={{ scale: 1.02, y: -2 }}
      transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
      className="bg-white dark:bg-surfaceDarkAlt rounded-2xl shadow-soft p-6 flex flex-col gap-4 cursor-default"
    >
      {/* Icon */}
      <div className="w-10 h-10 rounded-xl bg-surfaceAlt dark:bg-white/5 flex items-center justify-center text-apple-blue">
        {icon}
      </div>

      {/* Value */}
      <div>
        <p className="text-3xl font-bold tracking-tight text-textPrimary dark:text-white">
          {value}
        </p>
        <div className="flex items-center gap-2 mt-1">
          <p className="text-sm text-textSecondary dark:text-gray-500">
            {title}
          </p>
          {changeLabel && (
            <span className={`text-xs font-medium ${positive ? 'text-apple-green' : 'text-apple-red'}`}>
              {changeLabel}
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
}
