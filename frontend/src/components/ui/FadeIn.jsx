import React from 'react';
import { motion } from 'framer-motion';

/*
 * FadeIn — Scroll-triggered fade-up wrapper (Apple product-page style).
 * Uses Framer Motion 'whileInView' so elements animate in as they scroll
 * into the viewport, exactly like apple.com product sections.
 */
export default function FadeIn({ children, delay = 0, className = '' }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{
        duration: 0.6,
        delay,
        ease: [0.25, 0.1, 0.25, 1],          // Apple's easing curve
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
