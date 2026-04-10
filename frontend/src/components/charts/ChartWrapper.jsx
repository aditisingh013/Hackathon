import React from 'react';
import { Card } from '../ui';

/*
 * ChartWrapper — Clean container for Recharts visualizations.
 * Design: generous padding, soft title hierarchy, no heavy borders.
 */
export default function ChartWrapper({ title, subtitle, children, className = '' }) {
  return (
    <Card className={`p-6 sm:p-8 ${className}`}>
      {title && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-textPrimary dark:text-white tracking-tight">
            {title}
          </h3>
          {subtitle && (
            <p className="text-sm text-textSecondary dark:text-gray-500 mt-1">
              {subtitle}
            </p>
          )}
        </div>
      )}
      {children}
    </Card>
  );
}
