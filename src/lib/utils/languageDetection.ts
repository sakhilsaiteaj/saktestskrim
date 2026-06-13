import { updateFinalLanguages } from "./languageScoring";

export const detectTextLanguage = (text: string): string | null => {
  if (!text || text.trim().length < 2) return null;

  // Check Unicode ranges:
  const scripts: Record<string, RegExp> = {
    "Hindi": /[\u0900-\u097F]/,
    "Telugu": /[\u0C00-\u0C7F]/,
    "Tamil": /[\u0B80-\u0BFF]/,
    "Kannada": /[\u0C80-\u0CFF]/,
    "Malayalam": /[\u0D00-\u0D7F]/,
    "Bengali": /[\u0980-\u09FF]/,
    "Gujarati": /[\u0A80-\u0AFF]/,
    "Punjabi": /[\u0A00-\u0A7F]/,
    "Odia": /[\u0B00-\u0B7F]/,
    "Arabic": /[\u0600-\u06FF]/,
    "Hebrew": /[\u0590-\u05FF]/,
    "Japanese": /[\u3040-\u30FF]/,
    "Korean": /[\uAC00-\uD7AF]/,
    "Chinese": /[\u4E00-\u9FFF]/,
    "Russian": /[\u0400-\u04FF]/,
    "Greek": /[\u0370-\u03FF]/,
    "Thai": /[\u0E00-\u0E7F]/,
    "Georgian": /[\u10A0-\u10FF]/,
    "Armenian": /[\u0530-\u058F]/
  };

  for (const [lang, regex] of Object.entries(scripts)) {
    if (regex.test(text)) {
      return lang;
    }
  }

  // Default English if only Latin characters:
  return "English";
};

export const saveProfileLanguage = (lang: string) => {
  localStorage.setItem(
    "skrimchat_profile_lang",
    JSON.stringify({
      language: lang,
      detectedAt: Date.now(),
      source: "profile_text"
    })
  );
  updateFinalLanguages();
};
