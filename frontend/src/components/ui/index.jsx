import React from 'react';
import { clsx } from 'clsx';

/* ────────────────────────────────────────────────────
   Shared UI primitives — Apple-minimal design system
   All components use soft shadows, generous rounding,
   and ample whitespace for a premium feel.
   ──────────────────────────────────────────────────── */

// ── BADGE — soft pill with semantic color ──
export function Badge({ text, type }) {
  const styles = {
    High:    'bg-red-50 text-red-500 dark:bg-red-500/10 dark:text-red-400',
    Medium:  'bg-orange-50 text-orange-500 dark:bg-orange-500/10 dark:text-orange-400',
    Low:     'bg-green-50 text-green-600 dark:bg-green-500/10 dark:text-green-400',
    Default: 'bg-gray-100 text-gray-500 dark:bg-white/5 dark:text-gray-400',
  };
  return (
    <span className={clsx(
      'inline-flex items-center px-2.5 py-1 text-[11px] font-semibold rounded-full tracking-wide',
      styles[text] || styles[type] || styles.Default,
    )}>
      {text}
    </span>
  );
}

// ── CARD — clean white panel with subtle shadow ──
export function Card({ children, className, hover = false }) {
  return (
    <div className={clsx(
      'bg-white dark:bg-surfaceDarkAlt rounded-2xl shadow-soft',
      'transition-all duration-300 ease-apple',
      hover && 'hover:shadow-cardHover hover:scale-[1.02]',
      className,
    )}>
      {children}
    </div>
  );
}

// ── SKELETON — loading placeholder ──
export function Skeleton({ className }) {
  return (
    <div className={clsx(
      'animate-pulse rounded-2xl bg-gray-100 dark:bg-white/5',
      className,
    )} />
  );
}

// ── PAGE HEADER — large Apple-style title ──
export function PageHeader({ title, subtitle, children }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-2">
      <div>
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-textPrimary dark:text-white">
          {title}
        </h1>
        {subtitle && (
          <p className="text-base text-textSecondary dark:text-gray-400 mt-2 max-w-xl leading-relaxed">
            {subtitle}
          </p>
        )}
      </div>
      {children && <div className="flex items-center gap-3">{children}</div>}
    </div>
  );
}

// ── EMPTY STATE ──
export function EmptyState({ icon, title, desc }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 gap-4 text-textSecondary">
      <div className="text-5xl opacity-40">{icon}</div>
      <p className="font-semibold text-lg text-textPrimary dark:text-white">{title}</p>
      {desc && <p className="text-sm max-w-sm text-center">{desc}</p>}
    </div>
  );
}
