import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';

export function RewatchIndicator() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const handler = () => {
      setShow(true);
      setTimeout(() => setShow(false), 2000); // 2 seconds
    };
    window.addEventListener('skrimchat_rewatch_indicator', handler);
    return () => window.removeEventListener('skrimchat_rewatch_indicator', handler);
  }, []);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, scale: 0.9 }}
          transition={{ duration: 0.2 }}
          className="fixed top-20 left-4 z-[100] pointer-events-none"
        >
          <div className="bg-[#1a1a1a]/80 backdrop-blur-md border border-[#B026FF] shadow-[0_0_15px_rgba(176,38,255,0.3)] rounded-full px-3 py-1.5 flex items-center gap-2">
            <span className="text-sm">🔄</span>
            <div className="flex flex-col">
              <span className="text-[10px] font-bold text-white uppercase tracking-wider leading-none mb-0.5">Watched again</span>
              <span className="text-[10px] font-black text-[#00F0FF] leading-none">+1 ⚡</span>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
