import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { awardPoints } from './PulsePointsSystem';
import { updateBlazeRun } from './BlazeRunSystem';

export interface WatchCountData {
  sessionCount: number;
  todayCount: number;
  totalAllTime: number;
  bestDayCount: number;
  lastResetDate: string;
  sessionMilestonesClaimed: number[];
  todayMilestonesClaimed: number[];
}

const STORAGE_KEY = "skrimchat_watch_count";

export const getLocalYMD = (d: Date) => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const date = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${date}`;
};

export const getWatchCountData = (): WatchCountData => {
  if (typeof window === 'undefined') {
    return { sessionCount: 0, todayCount: 0, totalAllTime: 0, bestDayCount: 0, lastResetDate: getLocalYMD(new Date()), sessionMilestonesClaimed: [], todayMilestonesClaimed: [] };
  }
  const defaultData: WatchCountData = {
    sessionCount: 0,
    todayCount: 0,
    totalAllTime: 0,
    bestDayCount: 0,
    lastResetDate: getLocalYMD(new Date()),
    sessionMilestonesClaimed: [],
    todayMilestonesClaimed: []
  };
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultData;
    const d = JSON.parse(raw);
    if (typeof d.bestDayCount !== 'number') d.bestDayCount = 0;
    return { ...defaultData, ...d };
  } catch {
    return defaultData;
  }
};

export const initWatchSession = () => {
  if (typeof window === 'undefined') return;
  const data = getWatchCountData();
  data.sessionCount = 0;
  data.sessionMilestonesClaimed = [];
  
  const today = getLocalYMD(new Date());
  if (data.lastResetDate !== today) {
    if (data.todayCount > data.bestDayCount) {
        data.bestDayCount = data.todayCount;
    }
    data.todayCount = 0;
    data.todayMilestonesClaimed = [];
    data.lastResetDate = today;
  }

  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
};

const SESSION_MILESTONES = [
  { count: 5, points: 10, message: "5 Vibes! 🔥", subtext: "You're on fire!" },
  { count: 10, points: 25, message: "10 Vibes! ⚡", subtext: "Electric session!" },
  { count: 20, points: 60, message: "20 Vibes! 💜", subtext: "Vibe Marathon!" },
  { count: 30, points: 100, message: "30 Vibes! 👑", subtext: "Legendary session!" },
  { count: 50, points: 200, message: "50 Vibes! 🌟", subtext: "Unstoppable!" }
];

const DAILY_MILESTONES = [
  { count: 10, points: 15, message: "10 Today! ⚡", subtext: "+15 bonus points!" },
  { count: 25, points: 40, message: "25 Today! 🔥", subtext: "+40 bonus points!" },
  { count: 50, points: 100, message: "50 Today! 💜", subtext: "Daily Legend!" }
];

const watchedThisSession = new Set<string>();

export const onVibeReachedHalf = (vibeId: string) => {
  if (!watchedThisSession.has(vibeId)) {
    watchedThisSession.add(vibeId);
    countVibeWatched();
  }
};

const countVibeWatched = () => {
  const data = getWatchCountData();
  const today = getLocalYMD(new Date());

  if (data.lastResetDate !== today) {
    if (data.todayCount > data.bestDayCount) {
        data.bestDayCount = data.todayCount;
    }
    data.todayCount = 0;
    data.todayMilestonesClaimed = [];
    data.lastResetDate = today;
  }

  data.sessionCount++;
  data.todayCount++;
  data.totalAllTime++;
  
  if (data.todayCount > data.bestDayCount) {
      data.bestDayCount = data.todayCount;
  }

  checkWatchMilestones(data);

  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  updateBlazeRun();

  if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('skrimchat_watch_count_updated'));
  }
};

const checkWatchMilestones = (data: WatchCountData) => {
  let rewardToTrigger: any = null;

  SESSION_MILESTONES.forEach(m => {
    if (data.sessionCount === m.count && !data.sessionMilestonesClaimed.includes(m.count)) {
      awardPoints(m.points, `session_${m.count}`);
      data.sessionMilestonesClaimed.push(m.count);
      rewardToTrigger = m;
    }
  });

  DAILY_MILESTONES.forEach(m => {
    if (data.todayCount === m.count && !data.todayMilestonesClaimed.includes(m.count)) {
      awardPoints(m.points, `daily_${m.count}`);
      data.todayMilestonesClaimed.push(m.count);
      rewardToTrigger = m; // Safe overwrite since milestones counts are distinct
    }
  });

  if (rewardToTrigger && typeof window !== 'undefined') {
     window.dispatchEvent(new CustomEvent('skrimchat_watch_reward', { detail: rewardToTrigger }));
  }
};

export function WatchRewardBanner() {
    const [reward, setReward] = useState<any>(null);

    useEffect(() => {
        const handler = (e: any) => {
            setReward(e.detail);
            setTimeout(() => setReward(null), 2500);
        };
        window.addEventListener('skrimchat_watch_reward', handler);
        return () => window.removeEventListener('skrimchat_watch_reward', handler);
    }, []);

    return (
        <AnimatePresence>
            {reward && (
                <motion.div
                    initial={{ y: -100, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: -100, opacity: 0 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                    className="fixed top-16 left-4 right-4 z-[150] pointer-events-none"
                >
                    <div className="bg-[#1a1a1a]/80 backdrop-blur-md border-l-4 border-l-[#B026FF] border-y border-r border-white/10 shadow-[0_0_20px_rgba(176,38,255,0.3)] rounded-r-xl rounded-l-sm p-4 flex flex-col mx-auto max-w-sm">
                        <h4 className="text-sm font-black text-white flex items-center gap-1.5 whitespace-pre-wrap">{reward.message}</h4>
                        <p className="text-xs font-bold text-[#00F0FF] mt-0.5">{reward.subtext} You earned +{reward.points} ⚡ Pulse Pts!</p>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}

export function VibesWatchCounter() {
    const [data, setData] = useState<WatchCountData>(getWatchCountData());

    useEffect(() => {
        const load = () => setData(getWatchCountData());
        load();
        window.addEventListener('skrimchat_watch_count_updated', load);
        return () => window.removeEventListener('skrimchat_watch_count_updated', load);
    }, []);

    const getNextMilestone = () => {
        const nextDaily = DAILY_MILESTONES.find(m => m.count > data.todayCount);
        const nextSession = SESSION_MILESTONES.find(m => m.count > data.sessionCount);
        
        let next = null;
        let type = '';
        
        if (nextDaily && nextSession) {
            if ((nextDaily.count - data.todayCount) <= (nextSession.count - data.sessionCount)) {
                next = nextDaily;
                type = 'today';
            } else {
                next = nextSession;
                type = 'session';
            }
        } else if (nextDaily) {
            next = nextDaily;
            type = 'today';
        } else if (nextSession) {
            next = nextSession;
            type = 'session';
        }
        
        return { next, type };
    };

    const { next, type } = getNextMilestone();
    const count = type === 'today' ? data.todayCount : data.sessionCount;
    const isNear = next && (next.count - count <= 2 && next.count - count > 0);

    return (
        <div className="absolute top-20 left-1/2 -translate-x-1/2 z-20 pointer-events-none w-max">
            <div className={`px-3 py-1 rounded-full backdrop-blur-md text-xs font-bold transition-all shadow-lg border ${isNear ? 'bg-[#B026FF]/30 text-white border-[#B026FF]/50' : 'bg-black/40 text-white/80 border-white/10'}`}>
                {isNear && next ? (
                    <span>⚡ {(type === 'today' ? data.todayCount : data.sessionCount)}/{next.count} vibes {type} → +{next.points} pts at {next.count}!</span>
                ) : (
                    <span>⚡ {data.todayCount} vibes today</span>
                )}
            </div>
        </div>
    );
}

export function WatchStatsProfile() {
    const [data, setData] = useState<WatchCountData>(getWatchCountData());

    useEffect(() => {
        const load = () => setData(getWatchCountData());
        window.addEventListener('skrimchat_watch_count_updated', load);
        return () => window.removeEventListener('skrimchat_watch_count_updated', load);
    }, []);

    const nextDaily = DAILY_MILESTONES.find(m => m.count > data.todayCount);

    return (
        <div className="w-full max-w-sm mb-5 bg-[#141414] border border-white/10 rounded-xl p-4 shadow-lg">
            <div className="flex justify-between items-center mb-3">
                <span className="text-sm font-black text-white flex items-center gap-1.5">
                    📊 VIBE STATS
                </span>
            </div>
            <div className="h-px w-full bg-white/10 mb-3" />
            <div className="space-y-2 text-xs font-bold">
                <div className="flex justify-between">
                    <span className="text-gray-400">Total Watched</span>
                    <span className="text-white">{data.totalAllTime.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                    <span className="text-gray-400">Today</span>
                    <span className="text-white">{data.todayCount} vibes</span>
                </div>
                <div className="flex justify-between">
                    <span className="text-gray-400">This Session</span>
                    <span className="text-white">{data.sessionCount} vibes</span>
                </div>
                <div className="flex justify-between">
                    <span className="text-gray-400">Best Day</span>
                    <span className="text-[#00F0FF]">{data.bestDayCount} vibes</span>
                </div>
            </div>
            
            {nextDaily && (
                <div className="mt-4 pt-3 border-t border-white/10 text-[11px] font-bold text-[#B026FF] text-center">
                    ⚡ Watch {nextDaily.count - data.todayCount} more vibe{nextDaily.count - data.todayCount > 1 ? 's' : ''} today for +{nextDaily.points} bonus pts!
                </div>
            )}
        </div>
    );
}
