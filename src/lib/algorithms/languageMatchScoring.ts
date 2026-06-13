import { updateVibeScore } from './watchTimeTracking';

export const calculateLanguageScore = (vibe: any) => {
  if (typeof window === 'undefined') return 5;
  const finalLangs = JSON.parse(
    localStorage.getItem("skrimchat_final_langs") || "null"
  );

  if (!finalLangs || !vibe.language) {
    return 5;
  }

  const userLangs = finalLangs.languages; // e.g. ["Telugu","Hindi","English"]
  const primaryMatch = userLangs.indexOf(vibe.language);

  let additionalMatch = -1;
  if (vibe.additionalLanguages && Array.isArray(vibe.additionalLanguages)) {
    vibe.additionalLanguages.forEach((lang: string) => {
      const idx = userLangs.indexOf(lang);
      if (idx !== -1 && (additionalMatch === -1 || idx < additionalMatch)) {
        additionalMatch = idx;
      }
    });
  }

  let score = 0;

  if (primaryMatch === 0) {
    score = 20;
  } else if (primaryMatch === 1) {
    score = 15;
  } else if (primaryMatch === 2) {
    score = 10;
  } else if (primaryMatch > 2) {
    score = 5;
  } else if (additionalMatch !== -1) {
    score = 8;
  } else {
    score = 0;
  }

  return score;
};

export const applyLanguageScores = (allVibes: any[]) => {
  allVibes.forEach(vibe => {
    const score = calculateLanguageScore(vibe);
    updateVibeScore(vibe.id, "language", score);
  });
};
