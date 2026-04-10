import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import TopNavbar from './TopNavbar';
import { motion } from 'framer-motion';

/*
 * MainLayout — Full-height flex shell.
 * Background: Apple's signature #f5f5f7 (surfaceAlt).
 * Content area uses smooth Framer Motion page-enter animation.
 */
export default function MainLayout() {
  return (
    <div className="flex h-screen w-full bg-surfaceAlt dark:bg-surfaceDark overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col w-full h-full">
        <TopNavbar />
        <main className="flex-1 overflow-x-hidden overflow-y-auto p-6 sm:p-10 w-full">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
            className="w-full max-w-6xl mx-auto"
          >
            <Outlet />
          </motion.div>
        </main>
      </div>
    </div>
  );
}
