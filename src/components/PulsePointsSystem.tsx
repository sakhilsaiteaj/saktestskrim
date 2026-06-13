import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate } from 'react-router-dom';

export const getPulseLevel = (points: number) => {
  if (points >= 5000) return { level: 6, name: "🌟 Legend", width: "100%" };
  if (points >= 2500) return { level: 5, name: "👑 Blazing", width: `${((points-2500)/2500)*100}%` };
  if (points >= 1000) return { level: 4, name: "💜 Electric", width: `${((points-1000)/1500)*100}%` };
  if (points >= 500) return { level: 3, name: "🔥 Hot", width: `${((points-500)/500)*100}%` };
  if (points >= 100) return { level: 2, name: "⚡ Rising", width: `${((points-100)/400)*100}%` };
  return { level: 1, name: "🌱 Spark", width: `${(points/100)*100}%` };
}

export const awardPoints = (points: number, reason: string) => {
  const dateKey = new Date().toISOString().split('T')[0];
  const todayKey = `skrimchat_daily_points_${dateKey}`;
  
  // Prevent farming
  const dailyPoints = parseInt(localStorage.getItem(todayKey) || "0", 10);
  if (dailyPoints >= 200) {
    if (typeof window !== 'undefined') {
       window.dispatchEvent(new CustomEvent('skrimchat_points_awarded', {
         detail: { error: '⚡ Daily limit reached! Come back tomorrow!' }
       }));
    }
    return;
  }

  const allowedPoints = Math.min(points, 200 - dailyPoints);
  localStorage.setItem(todayKey, (dailyPoints + allowedPoints).toString());

  // Add points
  const current = JSON.parse(localStorage.getItem("skrimchat_pulse_points") || "0");
  const newTotal = current + allowedPoints;
  localStorage.setItem("skrimchat_pulse_points", JSON.stringify(newTotal));

  // Also update pulse_score to keep other systems happy ideally
  localStorage.setItem("skrimchat_pulse_score", JSON.stringify(newTotal));

  const history = JSON.parse(localStorage.getItem("skrimchat_points_history") || "[]");
  history.push({
    points: allowedPoints,
    reason: reason,
    earnedAt: Date.now()
  });
  localStorage.setItem("skrimchat_points_history", JSON.stringify(history));

  if (typeof window !== 'undefined') {
    let msg = `+${allowedPoints} ⚡`;
    if (reason === "watch_50") msg = `+${allowedPoints} ⚡ Watched!`;
    if (reason === "watch_80") msg = `+${allowedPoints} ⚡ Almost there!`;
    if (reason === "watch_full") msg = `+${allowedPoints} ⚡ Full Watch!`;
    if (reason === "rewatch") msg = `+${allowedPoints} ⚡ Rewatched!`;
    if (reason === "pulse") msg = `+${allowedPoints} ⚡ Pulsed!`;
    if (reason === "comment") msg = `+${allowedPoints} ⚡ Commented!`;
    if (reason === "share") msg = `+${allowedPoints} ⚡ Shared!`;
    if (reason === "save") msg = `+${allowedPoints} ⚡ Saved!`;

    window.dispatchEvent(new CustomEvent('skrimchat_points_awarded', {
      detail: { points: allowedPoints, message: msg, total: newTotal }
    }));
  }
};

export function GlobalPointsDisplay() {
  const navigate = useNavigate();
  const [points, setPoints] = useState<number>(() => {
     return parseInt(localStorage.getItem("skrimchat_pulse_points") || localStorage.getItem("skrimchat_pulse_score") || "0", 10);
  });
  const [toasts, setToasts] = useState<{ id: number, text: string, error?: boolean }[]>([]);

  useEffect(() => {
    let idCounter = 0;
    const handlePointsAwarded = (e: any) => {
      if (e.detail.total !== undefined) {
         setPoints(e.detail.total);
      }
      
      const id = idCounter++;
      const text = e.detail.error || e.detail.message;
      const error = !!e.detail.error;

      setToasts(prev => [...prev, { id, text, error }]);
      setTimeout(() => {
        setToasts(prev => prev.filter(t => t.id !== id));
      }, 1500);
    };

    window.addEventListener('skrimchat_points_awarded', handlePointsAwarded);
    
    // Interval to keep syncing if updated from other tabs
    const syncInt = setInterval(() => {
       const p = parseInt(localStorage.getItem("skrimchat_pulse_points") || localStorage.getItem("skrimchat_pulse_score") || "0", 10);
       setPoints(p);
    }, 2000);

    return () => {
       window.removeEventListener('skrimchat_points_awarded', handlePointsAwarded);
       clearInterval(syncInt);
    };
  }, []);

  return (
    <>
      <div 
        className="fixed top-2 right-4 z-50 pointer-events-auto cursor-pointer"
        onClick={() => navigate('/identity')}
      >
        <div className="bg-black/40 backdrop-blur-md border border-white/10 rounded-full px-3 py-1 flex items-center justify-center shadow-lg">
          <span className="text-white text-xs font-black tracking-wider flex items-center gap-1.5 drop-shadow-md">
            <span className="text-[#B026FF]">⚡</span>
            {points.toLocaleString()}
          </span>
        </div>
      </div>

      <div className="fixed bottom-32 right-6 z-[100] pointer-events-none flex flex-col items-end gap-2">
        <AnimatePresence>
          {toasts.map(toast => (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: 40, scale: 0.8 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -40, scale: 0.8 }}
              transition={{ type: "spring", stiffness: 400, damping: 25 }}
              className="px-4 py-2 rounded-xl backdrop-blur-md bg-black/60 shadow-[0_0_15px_rgba(176,38,255,0.4)] border border-[#B026FF]/30 object-right"
              style={toast.error ? {
                 borderColor: 'rgba(255,0,0,0.5)',
                 boxShadow: '0 0 15px rgba(255,0,0,0.4)'
              } : {}}
            >
              <p className={`text-sm font-black tracking-wide drop-shadow-[0_0_8px_${toast.error ? 'red' : '#B026FF'}] ${toast.error ? 'text-red-400' : 'text-white'}`}>
                 {toast.text}
              </p>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </>
  );
}
