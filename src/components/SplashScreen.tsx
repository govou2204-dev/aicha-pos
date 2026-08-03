import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { BookOpen, Sparkles, ShoppingBag, ChevronLeft } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const SplashScreen: React.FC = () => {
  const { splashVisible, dismissSplash, settings } = useApp();
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!splashVisible) return;
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => dismissSplash(), 400);
          return 100;
        }
        return prev + 5;
      });
    }, 80);

    return () => clearInterval(interval);
  }, [splashVisible, dismissSplash]);

  return (
    <AnimatePresence>
      {splashVisible && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 0.98 }}
          transition={{ duration: 0.4, ease: 'easeInOut' }}
          className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-gradient-to-br from-indigo-950 via-slate-900 to-violet-950 text-white p-6 overflow-hidden"
        >
          {/* Background Ambient Glow */}
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-500/15 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-10 right-10 w-72 h-72 bg-violet-500/15 rounded-full blur-3xl pointer-events-none" />

          {/* Logo Container */}
          <motion.div
            initial={{ scale: 0.7, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            transition={{ duration: 0.6, type: 'spring', stiffness: 120 }}
            className="flex flex-col items-center text-center max-w-md w-full"
          >
            <div className="relative mb-6">
              <div className="w-24 h-24 rounded-3xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-violet-500 p-1 shadow-2xl shadow-indigo-500/30 flex items-center justify-center transform hover:rotate-3 transition-transform">
                <div className="w-full h-full bg-slate-900 rounded-[22px] flex items-center justify-center">
                  <BookOpen className="w-12 h-12 text-indigo-400" />
                </div>
              </div>
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 12, repeat: Infinity, ease: 'linear' }}
                className="absolute -top-2 -right-2 text-amber-400"
              >
                <Sparkles className="w-7 h-7" />
              </motion.div>
            </div>

            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight bg-gradient-to-r from-indigo-300 via-violet-200 to-amber-200 bg-clip-text text-transparent mb-2">
              {settings.libraryName || '📚 Aïcha POS Pro'}
            </h1>
            <p className="text-indigo-300/80 font-medium text-sm md:text-base mb-8">
              نظام إدارة المبيعات والمخزون والمحاسبة المتكامل v1.0
            </p>

            {/* Loading Bar */}
            <div className="w-full bg-slate-800/80 backdrop-blur rounded-full h-2.5 mb-3 p-0.5 border border-slate-700/50">
              <motion.div
                className="bg-gradient-to-r from-indigo-500 to-violet-500 h-full rounded-full shadow-lg shadow-indigo-500/50"
                style={{ width: `${progress}%` }}
              />
            </div>

            <div className="flex items-center justify-between w-full text-xs text-slate-400 font-mono">
              <span>جاري تحميل قاعدة البيانات المحلية...</span>
              <span>{progress}%</span>
            </div>

            {/* Quick Dismiss Button */}
            <button
              onClick={dismissSplash}
              className="mt-8 inline-flex items-center gap-2 px-5 py-2.5 text-xs font-semibold bg-white/10 hover:bg-white/20 border border-white/15 rounded-xl transition-all text-indigo-200 hover:text-white"
            >
              <span>تخطي والبدء فوراً</span>
              <ChevronLeft className="w-4 h-4" />
            </button>
          </motion.div>

          {/* Footer Info */}
          <div className="absolute bottom-6 text-center text-xs text-slate-400/80">
            <p>تطوير: <span className="font-semibold text-emerald-300">Elyes</span> • إصدار 20 أوت 2026</p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
