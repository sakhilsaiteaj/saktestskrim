import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { awardPoints } from './PulsePointsSystem';
import { Flame } from 'lucide-react';

export interface BlazeRunData {
  currentBlazeRun: number;
  longestBlazeRun: number;
  lastWatchDate: string | null;
  todayWatchCount: number;
  requiredPerDay: number;
  blazeRunStartDate: string | null;
  milestonesClaimed: number[];
}

const STORAGE_KEY = "skrimchat_watch_blaze_run";

export const getLocalYMD = (d: Date) => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const date = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${date}`;
};

export const getBlazeRunData = (): BlazeRunData => {
  if (typeof window === 'undefined') return { currentBlazeRun: 0, longestBlazeRun: 0, lastWatchDate: null, todayWatchCount: 0, requiredPerDay: 3, blazeRunStartDate: null, milestonesClaimed: [] };
  return JSON.parse(
    localStorage.getItem(STORAGE_KEY) || JSON.stringify({
      currentBlazeRun: 0,
      longestBlazeRun: 0,
      lastWatchDate: null,
      todayWatchCount: 0,
      requiredPerDay: 3,
      blazeRunStartDate: null,
      milestonesClaimed: []
    })
  );
};

export const updateBlazeRun = () => {
    const data = getBlazeRunData();
    const now = new Date();
    const today = getLocalYMD(now);
    
    // Calculate yesterday without timezone shift bugs
    const yesterdayDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1);
    const yesterday = getLocalYMD(yesterdayDate);

    let milestoneToTrigger: any = null;
    let brokenBlazeRun: number = 0;
    let achievedRun: number = 0;

    if (data.lastWatchDate === today) {
        data.todayWatchCount++;
    } else if (data.lastWatchDate === yesterday) {
        data.todayWatchCount = 1;
        data.lastWatchDate = today;
    } else if (data.lastWatchDate === null) {
        data.todayWatchCount = 1;
        data.lastWatchDate = today;
        data.blazeRunStartDate = today;
    } else {
        brokenBlazeRun = data.currentBlazeRun;
        data.currentBlazeRun = 0;
        data.todayWatchCount = 1;
        data.lastWatchDate = today;
        data.blazeRunStartDate = today;
    }

    if (data.todayWatchCount === data.requiredPerDay) {
        data.currentBlazeRun++;
        if (data.currentBlazeRun > data.longestBlazeRun) {
            data.longestBlazeRun = data.currentBlazeRun;
        }
        achievedRun = data.currentBlazeRun;

        const milestones = [
            { days: 3, points: 25, badge: "🔥", title: "3 Day Blaze Run!" },
            { days: 7, points: 75, badge: "⚡", title: "Week Warrior!" },
            { days: 14, points: 150, badge: "💜", title: "2 Week Legend!" },
            { days: 30, points: 400, badge: "👑", title: "Month Master!" },
            { days: 60, points: 1000, badge: "🌟", title: "Unstoppable!" },
            { days: 100, points: 2500, badge: "💯", title: "100 Day God!" }
        ];

        for (const m of milestones) {
            if (data.currentBlazeRun === m.days && !data.milestonesClaimed.includes(m.days)) {
                awardPoints(m.points, `blaze_run_${m.days}`);
                data.milestonesClaimed.push(m.days);
                milestoneToTrigger = m;
            }
        }
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));

    if (typeof window !== 'undefined') {
        if (brokenBlazeRun > 0 && data.todayWatchCount === 1 && brokenBlazeRun > 2) {
            // Only whine if it was a substantial run
            window.dispatchEvent(new CustomEvent('skrimchat_blaze_run_broken', { detail: { lostDays: brokenBlazeRun } }));
        }
        if (achievedRun > 0) {
            window.dispatchEvent(new CustomEvent('skrimchat_blaze_run_achieved', { detail: { days: achievedRun } }));
            // Also update any listening profile UI
            window.dispatchEvent(new CustomEvent('skrimchat_blaze_run_updated'));
        } else {
            window.dispatchEvent(new CustomEvent('skrimchat_blaze_run_updated'));
        }
        if (milestoneToTrigger) {
            window.dispatchEvent(new CustomEvent('skrimchat_blaze_run_milestone', { detail: milestoneToTrigger }));
        }
    }
};

export function BlazeRunProfileCard() {
    const [data, setData] = useState<BlazeRunData>(getBlazeRunData);

    useEffect(() => {
        const handleUpdate = () => setData(getBlazeRunData());
        window.addEventListener('skrimchat_blaze_run_updated', handleUpdate);
        
        // Also check if they missed yesterday when opening profile.
        const d = getBlazeRunData();
        const today = getLocalYMD(new Date());
        const yesterdayDate = new Date();
        yesterdayDate.setDate(yesterdayDate.getDate() - 1);
        const yesterday = getLocalYMD(yesterdayDate);
        
        if (d.lastWatchDate && d.lastWatchDate !== today && d.lastWatchDate !== yesterday && d.currentBlazeRun > 0) {
            // Silently reset
            d.currentBlazeRun = 0;
            localStorage.setItem(STORAGE_KEY, JSON.stringify(d));
            setData(d);
        }

        return () => window.removeEventListener('skrimchat_blaze_run_updated', handleUpdate);
    }, []);

    const progress = Math.min((data.todayWatchCount / data.requiredPerDay) * 100, 100);
    const isActive = data.currentBlazeRun > 0 || data.todayWatchCount > 0;
    
    return (
        <div className="w-full max-w-sm mb-5 bg-[#141414] border border-white/10 rounded-xl p-4 shadow-lg relative overflow-hidden">
            {isActive && (
                <div className="absolute top-0 right-0 w-32 h-32 bg-[#FF6B00]/10 blur-[40px] rounded-full pointer-events-none" />
            )}
            
            <div className="flex justify-between items-start mb-3 relative z-10">
                <div>
                     <h3 className={`text-sm font-black flex items-center gap-1.5 ${isActive ? 'text-white' : 'text-gray-500'}`}>
                         <Flame className={`w-4 h-4 ${isActive ? 'text-[#FF6B00] fill-[#FF6B00]' : ''}`} /> 
                         {data.currentBlazeRun} Day Blaze Run
                     </h3>
                     <p className="text-[11px] font-bold text-gray-500 mt-0.5">Best: {data.longestBlazeRun} days</p>
                </div>
            </div>

            <div className="relative z-10">
                <div className="flex justify-between text-xs font-bold mb-1.5">
                    <span className="text-gray-400">
                        {data.todayWatchCount >= data.requiredPerDay 
                            ? "🔥 Today's run complete!" 
                            : `Watch ${data.requiredPerDay - data.todayWatchCount} more vibe${data.requiredPerDay - data.todayWatchCount > 1 ? 's' : ''} today!`
                        }
                    </span>
                    <span className={isActive ? 'text-[#B026FF]' : 'text-gray-500'}>{Math.min(data.todayWatchCount, data.requiredPerDay)}/{data.requiredPerDay} today</span>
                </div>
                <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                    <div 
                        className={`h-full transition-all duration-500 ${data.todayWatchCount >= data.requiredPerDay ? 'bg-gradient-to-r from-[#FF6B00] to-[#FFD700]' : (isActive ? 'bg-[#B026FF]' : 'bg-gray-600')}`} 
                        style={{ width: `${progress}%` }} 
                    />
                </div>
            </div>
        </div>
    );
}

export function GlobalBlazeRunUI() {
    const navigate = useNavigate();
    const [milestone, setMilestone] = useState<any>(null);
    const [brokenInfo, setBrokenInfo] = useState<{lostDays: number} | null>(null);
    const [showReminder, setShowReminder] = useState(false);

    useEffect(() => {
        const handleMilestone = (e: any) => {
            setMilestone(e.detail);
            setTimeout(() => setMilestone(null), 4000);
        };
        const handleBroken = (e: any) => {
            setBrokenInfo(e.detail);
            setTimeout(() => setBrokenInfo(null), 3000);
        };

        window.addEventListener('skrimchat_blaze_run_milestone', handleMilestone);
        window.addEventListener('skrimchat_blaze_run_broken', handleBroken);

        // Reminder logic
        const checkReminder = () => {
            const data = getBlazeRunData();
            const h = new Date().getHours();
            const today = getLocalYMD(new Date());
            const reminderKey = `skrimchat_blaze_reminder_${today}`;
            
            if (h >= 20 && data.todayWatchCount < data.requiredPerDay && data.currentBlazeRun > 0) {
                if (!localStorage.getItem(reminderKey)) {
                    setShowReminder(true);
                    localStorage.setItem(reminderKey, "true");
                    setTimeout(() => setShowReminder(false), 5000);
                }
            }
        };
        checkReminder();
        const int = setInterval(checkReminder, 60000);

        return () => {
            window.removeEventListener('skrimchat_blaze_run_milestone', handleMilestone);
            window.removeEventListener('skrimchat_blaze_run_broken', handleBroken);
            clearInterval(int);
        };
    }, []);

    return (
        <>
            {/* MILESTONE POPUP */}
            <AnimatePresence>
                {milestone && (
                    <motion.div 
                        initial={{ opacity: 0 }} 
                        animate={{ opacity: 1 }} 
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80 backdrop-blur-md p-6"
                        onClick={() => setMilestone(null)}
                    >
                        {/* Particles / Glow */}
                        <div className="absolute inset-0 overflow-hidden pointer-events-none">
                            <motion.div 
                                animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0.8, 0] }}
                                transition={{ duration: 2, repeat: Infinity }}
                                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-[#B026FF]/30 rounded-full blur-[60px]"
                            />
                        </div>

                        <motion.div 
                            initial={{ scale: 0.8, y: 50 }} 
                            animate={{ scale: 1, y: 0 }} 
                            exit={{ scale: 0.8, y: 50 }}
                            className="bg-[#111] border border-[#B026FF]/50 rounded-3xl p-8 max-w-sm w-full text-center relative z-10 shadow-[0_0_50px_rgba(176,38,255,0.3)]"
                        >
                            <motion.div 
                                animate={{ scale: [1, 1.2, 1] }} 
                                transition={{ duration: 1, repeat: Infinity }}
                                className="text-5xl mb-4 font-black text-transparent bg-clip-text bg-gradient-to-br from-[#00F0FF] to-[#B026FF] flex items-center justify-center gap-2 drop-shadow-[0_0_10px_#B026FF]"
                            >
                                ⚡ {milestone.days} ⚡
                            </motion.div>
                            <h2 className="text-2xl font-black text-white uppercase tracking-wider mb-1">{milestone.title}</h2>
                            <p className="text-sm font-bold text-[#FF6B00] mb-6">{milestone.days} Day Blaze Run! 🔥</p>
                            
                            <div className="bg-[#B026FF]/20 border border-[#B026FF]/40 rounded-xl px-4 py-3 mb-6 inline-block">
                                <span className="text-white font-bold">You earned +{milestone.points} ⚡ Pulse Pts!</span>
                            </div>

                            <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden mb-2">
                                <div className="h-full bg-gradient-to-r from-[#B026FF] to-[#FFD700] w-full" />
                            </div>
                            <p className="text-xs font-bold text-gray-500 mb-6">{milestone.days} days</p>

                            <button 
                                className="bg-white/10 hover:bg-white/20 text-white font-bold py-3 px-6 rounded-xl w-full transition-colors"
                                onClick={() => setMilestone(null)}
                            >
                                🎉 Awesome!
                            </button>
                        </motion.div>
                    </motion.div>
                )}

                {/* BROKEN POPUP */}
                {brokenInfo && (
                    <motion.div 
                        initial={{ y: -100, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: -100, opacity: 0 }}
                        className="fixed top-16 left-4 right-4 z-[150] cursor-pointer"
                        onClick={() => { setBrokenInfo(null); navigate('/'); }}
                    >
                        <div className="bg-[#1a1a1a] border border-red-500/30 shadow-[0_0_30px_rgba(255,0,0,0.15)] rounded-2xl p-4 flex gap-4 max-w-md mx-auto">
                            <div className="text-3xl mt-1">💔</div>
                            <div>
                                <h4 className="text-base font-black text-white mb-1">Blaze Run Lost</h4>
                                <p className="text-xs text-gray-400 font-medium mb-2">Your {brokenInfo.lostDays} day Blaze Run ended. Start a new one today!</p>
                                <span className="text-[10px] uppercase tracking-wider font-bold text-[#FF6B00]">Watch Vibes →</span>
                            </div>
                        </div>
                    </motion.div>
                )}

                {/* REMINDER POPUP */}
                {showReminder && (
                    <motion.div 
                        initial={{ y: -100, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: -100, opacity: 0 }}
                        className="fixed top-16 left-4 right-4 z-[150] cursor-pointer"
                        onClick={() => { setShowReminder(false); navigate('/'); }}
                    >
                        <div className="bg-gradient-to-r from-[#B026FF]/90 to-[#FF6B00]/90 border border-white/20 shadow-[0_0_30px_rgba(176,38,255,0.3)] rounded-2xl p-4 flex gap-3 max-w-md mx-auto backdrop-blur-md">
                            <Flame className="text-white w-6 h-6 mt-0.5 shrink-0" />
                            <div>
                                <h4 className="text-sm font-black text-white mb-0.5 h-auto leading-tight">Don't break your Blaze Run!</h4>
                                <p className="text-[11px] text-white/90 font-medium leading-tight">Watch 1 more vibe to keep your Blaze Run alive!</p>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
