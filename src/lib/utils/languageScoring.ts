export const getLanguageScores = () => {
  const finalScores: Record<string, number> = {};

  // SOURCE 1: Device language
  // Weight: 30%
  const deviceData = JSON.parse(
    localStorage.getItem("skrimchat_device_lang") || "null"
  );
  if (deviceData && deviceData.languages) {
    deviceData.languages.forEach((lang: string, index: number) => {
      if (!finalScores[lang]) finalScores[lang] = 0;
      // First language = full weight, others = half:
      finalScores[lang] += index === 0 ? 30 : 15;
    });
  }

  // SOURCE 2: IP location
  // Weight: 20%
  const ipData = JSON.parse(
    localStorage.getItem("skrimchat_ip_lang") || "null"
  );
  if (ipData && !ipData.error && ipData.languages) {
    ipData.languages.forEach((lang: string, index: number) => {
      if (!finalScores[lang]) finalScores[lang] = 0;
      finalScores[lang] += index === 0 ? 20 : 10;
    });
  }

  // SOURCE 3: Profile text
  // Weight: 20%
  const profileData = JSON.parse(
    localStorage.getItem("skrimchat_profile_lang") || "null"
  );
  if (profileData && profileData.language) {
    const lang = profileData.language;
    if (!finalScores[lang]) finalScores[lang] = 0;
    finalScores[lang] += 20;
  }

  // SOURCE 4: Behavior learning
  // Weight: 20%
  const behaviorData = JSON.parse(
    localStorage.getItem("skrimchat_lang_behavior") || "{}"
  );
  Object.entries(behaviorData).forEach(([lang, data]: [string, any]) => {
    if (!finalScores[lang]) finalScores[lang] = 0;
    // Normalize score to max 20 points:
    const normalized = Math.min((data.score || 0) / 10, 20);
    finalScores[lang] += Math.max(0, normalized);
  });

  // SOURCE 5: Interactions
  // Weight: 10%
  const interactionData = JSON.parse(
    localStorage.getItem("skrimchat_interaction_lang") || "{}"
  );
  Object.entries(interactionData).forEach(([lang, data]: [string, any]) => {
    if (!finalScores[lang]) finalScores[lang] = 0;
    const normalized = Math.min((data.score || 0) / 10, 10);
    finalScores[lang] += Math.max(0, normalized);
  });

  // Sort by score descending:
  const sorted = Object.entries(finalScores)
    .sort((a, b) => b[1] - a[1])
    .map(([lang]) => lang);

  // Return top languages:
  return sorted;
};

export const updateFinalLanguages = () => {
  if (typeof window === "undefined") return;
  
  let langs: string[] = [];
  const autoDetectOn = localStorage.getItem("skrimchat_auto_detect_on");
  
  if (autoDetectOn === "false") {
    const manual = localStorage.getItem("skrimchat_manual_langs");
    if (manual) {
      try {
        langs = JSON.parse(manual);
      } catch (e) {
        langs = getLanguageScores();
      }
    } else {
      langs = getLanguageScores();
    }
  } else {
    langs = getLanguageScores();
  }

  localStorage.setItem(
    "skrimchat_final_langs",
    JSON.stringify({
      languages: langs,
      updatedAt: Date.now(),
    })
  );
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event('skrimchat_profile_lang_updated'));
  }
};
