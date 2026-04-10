import React from 'react';
import { Badge } from '../ui';

/*
 * AlertItem — Compact alert row for dashboard sidebar.
 * Apple-clean: no icon, just severity badge + text.
 */
export default function AlertItem({ alert }) {
  return (
    <div className="flex items-start gap-3 py-3 border-b border-gray-100 dark:border-white/5 last:border-0">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <h4 className="text-sm font-medium text-textPrimary dark:text-white truncate">
            {alert.title}
          </h4>
          <Badge text={alert.severity} />
        </div>
        <p className="text-xs text-textSecondary dark:text-gray-500 line-clamp-1">
          {alert.desc}
        </p>
      </div>
      <span className="text-[11px] text-textSecondary dark:text-gray-600 whitespace-nowrap shrink-0 pt-0.5">
        {alert.time}
      </span>
    </div>
  );
}
