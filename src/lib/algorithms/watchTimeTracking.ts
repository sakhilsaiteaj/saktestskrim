import React from 'react';

export const updateVibeScore = (vibeId: string, signal: string, score: number) => {
  if (typeof window === 'undefined') return;
  const key = "skrimchat_vibe_scores";
  const scores = JSON.parse(localStorage.getItem(key) || "{}");

  if (!scores[vibeId]) {
    scores[vibeId] = {
      vibeId: vibeId,
      watchTimeScore: 0,
      rewatchScore: 0,
      languageScore: 0,
      regionalScore: 0,
      timeOfDayScore: 0,
      saveScore: 0,
      shareScore: 0,
      totalScore: 0,
      lastUpdated: Date.now()
    };
  }

  scores[vibeId][`${signal}Score`] = score;

  // Recalculate total:
  scores[vibeId].totalScore =
    (scores[vibeId].watchTimeScore || 0) +
    (scores[vibeId].rewatchScore || 0) +
    (scores[vibeId].languageScore || 0) +
    (scores[vibeId].regionalScore || 0) +
    (scores[vibeId].timeOfDayScore || 0) +
    (scores[vibeId].saveScore || 0) +
    (scores[vibeId].shareScore || 0);

  scores[vibeId].lastUpdated = Date.now();

  localStorage.setItem(key, JSON.stringify(scores));
};

export const calculateWatchScore = (watchData: any) => {
  let score = 0;

  if (watchData.watchPercent >= 100) score += 10;
  else if (watchData.watchPercent >= 80) score += 7;
  else if (watchData.watchPercent >= 50) score += 4;
  else if (watchData.watchPercent >= 25) score += 2;
  else score += 0;

  if (watchData.watchSessions > 1) score += 3;
  if (watchData.watchSessions > 3) score += 2;

  if (watchData.pauses > 5) score -= 2;

  return score;
};

export const saveWatchTime = (vibe: any, totalMs: number, pauses: number) => {
  if (typeof window === 'undefined') return;
  const key = "skrimchat_watch_times";
  const data = JSON.parse(localStorage.getItem(key) || "{}");

  if (!data[vibe.id]) {
    data[vibe.id] = {
      vibeId: vibe.id,
      totalWatchMs: 0,
      watchSessions: 0,
      avgWatchMs: 0,
      videoDurationMs: vibe.duration * 1000 || 15000, // Safe fallback
      watchPercent: 0,
      pauses: 0,
      lastWatched: null
    };
  }

  data[vibe.id].totalWatchMs += totalMs;
  data[vibe.id].watchSessions++;
  data[vibe.id].pauses += pauses;
  data[vibe.id].lastWatched = Date.now();
  data[vibe.id].avgWatchMs = data[vibe.id].totalWatchMs / data[vibe.id].watchSessions;
  
  if (data[vibe.id].videoDurationMs > 0) {
    data[vibe.id].watchPercent = Math.min((data[vibe.id].avgWatchMs / data[vibe.id].videoDurationMs) * 100, 100);
  }

  localStorage.setItem(key, JSON.stringify(data));

  updateVibeScore(vibe.id, "watchTime", calculateWatchScore(data[vibe.id]));
};

export const trackDropOff = (vibe: any, videoRef: React.RefObject<HTMLVideoElement | null>) => {
  if (typeof window === 'undefined') return;
  const video = videoRef.current;
  if (!video || !video.duration) return;

  const dropPercent = Math.floor((video.currentTime / video.duration) * 100);
  const key = "skrimchat_dropoff";
  const data = JSON.parse(localStorage.getItem(key) || "{}");

  if (!data[vibe.id]) {
    data[vibe.id] = [];
  }

  data[vibe.id].push(dropPercent);
  localStorage.setItem(key, JSON.stringify(data));
};

export const getSortedVibes = (allVibes: any[]) => {
  if (typeof window === 'undefined') return allVibes;
  const scores = JSON.parse(localStorage.getItem("skrimchat_vibe_scores") || "{}");

  return [...allVibes].sort((a, b) => {
    const scoreA = scores[a.id]?.totalScore || 0;
    const scoreB = scores[b.id]?.totalScore || 0;
    return scoreB - scoreA;
  });
};
