import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';

/*
 * RecommendationCard — AI insight card.
 * Design: clean white surface, subtle left accent via type color,
 *         hover elevation for interactivity.
 */

const typeColors = {
  workload: 'bg-apple-blue',
  break:    'bg-apple-green',
  morale:   'bg-apple-orange',
  growth:   'bg-apple-purple',
};

export default function RecommendationCard({ rec }) {
  return (
    <motion.div
      whileHover={{ scale: 1.01, y: -2 }}
      transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
      className="bg-white dark:bg-surfaceDarkAlt rounded-2xl shadow-soft p-6 flex gap-4 cursor-default"
    >
      {/* Color accent bar */}
      <div className={`w-1 rounded-full shrink-0 ${typeColors[rec.type] || typeColors.workload}`} />

      <div className="flex-1 min-w-0">
        <h4 className="text-base font-semibold text-textPrimary dark:text-white tracking-tight">
          {rec.title}
        </h4>
        <p className="text-sm text-textSecondary dark:text-gray-400 mt-1 leading-relaxed">
          {rec.text}
        </p>

        {/* Meta row */}
        <div className="flex items-center justify-between mt-4">
          {rec.affectedCount && (
            <span className="text-xs text-textSecondary dark:text-gray-500">
              {rec.affectedCount} people affected
            </span>
          )}
          <button className="inline-flex items-center gap-1.5 text-sm font-medium text-apple-blue hover:opacity-70 transition-opacity">
            {rec.action}
            <ArrowRight size={14} />
          </button>
        </div>
      </div>
    </motion.div>
  );
}
