/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      /* ── Apple-inspired color palette ── */
      colors: {
        apple: {
          blue:   '#007aff',
          green:  '#34c759',
          orange: '#ff9500',
          red:    '#ff3b30',
          purple: '#af52de',
          gray:   '#8e8e93',
        },
        surface:      '#ffffff',
        surfaceAlt:   '#f5f5f7',
        surfaceDark:  '#000000',
        surfaceDarkAlt: '#1c1c1e',
        textPrimary:    '#1d1d1f',
        textSecondary:  '#86868b',
      },
      /* ── Typography — mimic SF Pro via system stack ── */
      fontFamily: {
        sans: [
          '-apple-system', 'BlinkMacSystemFont', '"SF Pro Display"',
          '"SF Pro Text"', '"Helvetica Neue"', 'Arial', 'sans-serif',
        ],
      },
      /* ── Subtle, premium shadows ── */
      boxShadow: {
        'soft':    '0 2px 16px rgba(0,0,0,0.04)',
        'card':    '0 4px 24px rgba(0,0,0,0.06)',
        'cardHover': '0 8px 40px rgba(0,0,0,0.10)',
        'modal':   '0 24px 80px rgba(0,0,0,0.18)',
      },
      /* ── Consistent easing ── */
      transitionTimingFunction: {
        'apple': 'cubic-bezier(0.25, 0.1, 0.25, 1)',
      },
      /* ── Keyframes for fade-up on scroll ── */
      keyframes: {
        fadeUp: {
          '0%':   { opacity: '0', transform: 'translateY(24px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        'fade-up': 'fadeUp 0.6s cubic-bezier(0.25,0.1,0.25,1) forwards',
      },
    },
  },
  plugins: [],
}
