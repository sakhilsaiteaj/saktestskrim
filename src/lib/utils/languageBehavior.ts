import { detectTextLanguage } from "./languageDetection";
import { updateFinalLanguages } from "./languageScoring";

export const trackVibeInteraction = (vibe: any, action: string) => {
  const lang = vibe.language || vibe?.metadata?.language || vibe?.contentLanguage;
  // If no language is explicitly set, let's try a fallback or try looking at the vibe.
  // The system requested `const lang = vibe.language`
  // so we will rely on that.
  if (!lang) return;

  const key = "skrimchat_lang_behavior";
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const scores: any = JSON.parse(localStorage.getItem(key) || "{}");

  if (!scores[lang]) {
    scores[lang] = {
      watchCount: 0,
      skipCount: 0,
      pulseCount: 0,
      commentCount: 0,
      saveCount: 0,
      shareCount: 0,
      totalWatchTime: 0,
      score: 0
    };
  }

  switch(action) {
    case "watch_full":
      scores[lang].watchCount++;
      scores[lang].score += 3;
      break;
    case "skip":
      scores[lang].skipCount++;
      scores[lang].score -= 1;
      break;
    case "pulse":
      scores[lang].pulseCount++;
      scores[lang].score += 5;
      break;
    case "comment":
      scores[lang].commentCount++;
      scores[lang].score += 4;
      break;
    case "save":
      scores[lang].saveCount++;
      scores[lang].score += 6;
      break;
    case "share":
      scores[lang].shareCount++;
      scores[lang].score += 7;
      break;
    case "rewatch":
      scores[lang].score += 4;
      break;
  }

  localStorage.setItem(key, JSON.stringify(scores));
  updateFinalLanguages();
};

export const trackCommentLanguage = (commentText: string) => {
  const detected = detectTextLanguage(commentText);
  if (!detected) return;

  const key = "skrimchat_interaction_lang";
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const data: any = JSON.parse(localStorage.getItem(key) || "{}");

  if (!data[detected]) {
    data[detected] = {
      commentCount: 0,
      saveCount: 0,
      shareCount: 0,
      score: 0
    };
  }

  data[detected].commentCount++;
  data[detected].score += 5;

  localStorage.setItem(key, JSON.stringify(data));
  updateFinalLanguages();
};

export const trackSaveLanguage = (vibe: any) => {
  const lang = vibe.language || vibe?.metadata?.language || vibe?.contentLanguage;
  if (!lang) return;

  const key = "skrimchat_interaction_lang";
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const data: any = JSON.parse(localStorage.getItem(key) || "{}");

  if (!data[lang]) {
    data[lang] = {
      saveCount: 0,
      score: 0
    };
  }

  data[lang].saveCount++;
  data[lang].score += 6;

  localStorage.setItem(key, JSON.stringify(data));
  updateFinalLanguages();
};

export const trackShareLanguage = (vibe: any) => {
  const lang = vibe.language || vibe?.metadata?.language || vibe?.contentLanguage;
  if (!lang) return;

  const key = "skrimchat_interaction_lang";
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const data: any = JSON.parse(localStorage.getItem(key) || "{}");

  if (!data[lang]) {
    data[lang] = {
      shareCount: 0,
      score: 0
    };
  }

  data[lang].shareCount++;
  data[lang].score += 7;

  localStorage.setItem(key, JSON.stringify(data));
  updateFinalLanguages();
};

export const trackRewatch = (vibe: any) => {
  const lang = vibe.language || vibe?.metadata?.language || vibe?.contentLanguage;
  if (!lang) return;

  trackVibeInteraction(vibe, "rewatch");
};