import { awardPoints } from '../../components/PulsePointsSystem';
import { updateVibeScore } from './watchTimeTracking';

export const SESSION_ID = `session_${Date.now()}`;

export const getCurrentSessionId = () => SESSION_ID;

export const calculateRewatchScore = (rewatchData: any) => {
  let score = 0;
  score += (rewatchData.rewatchCount || 0) * 5;
  return Math.min(score, 25);
};

export const checkRewatch = (vibe: any, watchPercent: number) => {
  if (watchPercent < 50) return;
  if (typeof window === 'undefined') return;

  const key = "skrimchat_rewatch_data";
  const data = JSON.parse(localStorage.getItem(key) || "{}");

  const sessionKey = `skrimchat_rewatch_session_tracked_${vibe.id}_${SESSION_ID}`;
  if (localStorage.getItem(sessionKey)) {
      // Already tracked this specific view session basically
      // To strictly follow prompt, "A rewatch is counted when reaching 50%+ again"
      // we need to avoid counting 50% over and over in the same loop without a reset.
      // But typically we track once per play loop. If the user loops, we count again.
  }

  if (!data[vibe.id]) {
    data[vibe.id] = {
      vibeId: vibe.id,
      firstWatchedAt: Date.now(),
      rewatchCount: 0,
      lastRewatchAt: null,
      rewatchSessions: []
    };
  } else {
    // Prevent counting multiple times for the exact same watch cycle
    const lastSession = data[vibe.id].rewatchSessions[data[vibe.id].rewatchSessions.length - 1];
    if (lastSession && (Date.now() - lastSession.watchedAt < 5000)) {
        return; // Debounce
    }
    
    data[vibe.id].rewatchCount++;
    data[vibe.id].lastRewatchAt = Date.now();
    data[vibe.id].rewatchSessions.push({
      watchedAt: Date.now(),
      sessionId: getCurrentSessionId()
    });

    awardPoints(1, "rewatch"); // The prompt says this. But there's also the points UI inside VinesScreen maybe.

    const rewatchScore = calculateRewatchScore(data[vibe.id]);
    updateVibeScore(vibe.id, "rewatch", rewatchScore);

    // Dispatch event for UI
    if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('skrimchat_rewatch_indicator', { detail: { vibeId: vibe.id } }));
        window.dispatchEvent(new CustomEvent('skrimchat_rewatch_updated'));
    }
  }

  localStorage.setItem(key, JSON.stringify(data));
};
