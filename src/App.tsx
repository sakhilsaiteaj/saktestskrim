/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link } from 'react-router-dom';
import { Home, Compass, PlaySquare, MessageCircle, User, Users, Bell, Lock, Zap } from 'lucide-react';
import { useAuthStore } from './store/authStore';
import { useCurrentUser } from './hooks/useCurrentUser';
import { useAchievementEngine, useTrackingStats } from './lib/mock/achievementEngine';
import { BadgeCelebrationManager } from './components/BadgeComponents';
import AuthScreen from './screens/AuthScreen';
import PulseScreen from './screens/PulseScreen';
import ConnectScreen from './screens/ConnectScreen';
import VibesScreen from './screens/VibesScreen';
import DiscoverScreen from './screens/DiscoverScreen';
import IdentityScreen from './screens/IdentityScreen';
import SignalScreen from './screens/SignalScreen';
import CommunitiesScreen from './screens/CommunitiesScreen';
import CreatorDashboardScreen from './screens/CreatorDashboardScreen';
import PromoteScreen from './screens/PromoteScreen';
import AdminDashboardScreen from './screens/AdminDashboardScreen';
import SettingsScreen from './screens/SettingsScreen';
import OtherUserProfileScreen from './screens/OtherUserProfileScreen';
import { BottomTabs } from './components/BottomTabs';
import { DashboardSidebar, MobileStatsDashboard, DashboardSheets } from './components/DashboardSidebar';
import { updateFinalLanguages } from './lib/utils/languageScoring';

import { GlobalPointsDisplay } from './components/PulsePointsSystem';
import { GlobalBlazeRunUI } from './components/BlazeRunSystem';
import { initWatchSession, WatchRewardBanner } from './components/WatchRewardsSystem';
import { RewatchIndicator } from './components/RewatchIndicator';

import { initOnlineTracking, initMockUsersOnlineToggle } from './hooks/useOnlineStatus';

let onlineSetupDone = false;
if (typeof window !== 'undefined' && !onlineSetupDone) {
  onlineSetupDone = true;
  initOnlineTracking();
  initMockUsersOnlineToggle();
  updateFinalLanguages();
  initWatchSession();
}

function AppContent() {
  useAchievementEngine();
  const currentUser = useCurrentUser();
  const tracking = useTrackingStats();

  return (
    <div className="w-full h-full relative">
      <GlobalPointsDisplay />
      <GlobalBlazeRunUI />
      <WatchRewardBanner />
      <RewatchIndicator />
      <Routes>
        <Route path="/" element={<PulseScreen />} />
        <Route path="/discover" element={<DiscoverScreen />} />
        <Route path="/vibes" element={<VibesScreen />} />
        <Route path="/connect" element={<ConnectScreen />} />
        <Route path="/identity" element={<IdentityScreen />} />
        <Route path="/profile/:username" element={<OtherUserProfileScreen />} />
        <Route path="/signal" element={<SignalScreen />} />
        <Route path="/communities" element={<CommunitiesScreen />} />
        <Route path="/creator" element={<CreatorDashboardScreen />} />
        <Route path="/promote" element={<PromoteScreen />} />
        <Route path="/admin" element={<AdminDashboardScreen />} />
        <Route path="/settings" element={<SettingsScreen />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <BottomTabs />
      
      {/* Global Achievement Celebration Manager */}
      {currentUser && (
        <BadgeCelebrationManager 
          stats={{
            pulseScore: tracking.pulseScore,
            blazeRun: tracking.blazeRun,
            vibeRating: parseFloat(localStorage.getItem('skrimchat_vibe_rating') || '9.1'),
            profileViews: parseInt(localStorage.getItem('skrimchat_profile_views') || '892', 10),
            followers: tracking.followers,
          }}
          username={currentUser.username?.replace('@', '') || ''}
        />
      )}
    </div>
  );
}

function useWindowDimensions() {
  const [width, setWidth] = React.useState(window.innerWidth);
  React.useEffect(() => {
    const handleResize = () => setWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  return { width };
}

function MainAppLayout() {
  const { width } = useWindowDimensions();
  const isDesktop = width >= 1024;
  const isTablet = width >= 768 && width < 1024;
  const currentUser = useCurrentUser();

  if (isDesktop) {
    return (
        <div className="w-[100vw] h-[100vh] bg-black text-white overflow-hidden flex">
          {/* Left Sidebar (240px) */}
          <div className="w-[80px] lg:w-[240px] hidden lg:flex flex-col h-full border-r border-[#B026FF]/30 bg-[#0A0A0A] shrink-0 z-50">
             <DashboardSidebar />
          </div>

          {/* Main Content (Center) */}
          <div className="flex-1 h-full overflow-hidden bg-black relative border-r border-white/5">
             <AppContent />
          </div>

          {/* Right Panel (320px) */}
          <div className="w-[320px] h-full flex flex-col overflow-y-auto no-scrollbar bg-skrim-bg border-l border-white/5 p-4 shrink-0 gap-6">
             {/* Connect */}
             <div className="bg-[#141414] rounded-2xl border border-white/5 p-4 flex flex-col">
                <h3 className="text-[9px] font-black uppercase tracking-[0.2em] text-white/30 mb-3">Connect</h3>
                <div className="space-y-3">
                  {[
                    { img: "https://i.pravatar.cc/150?img=12", name: "Marcus K.", msg: "The design looks insane...", active: true },
                    { img: "https://i.pravatar.cc/150?img=13", name: "Sarah J.", msg: "Voice note sent 2h ago", active: false }
                  ].map((c, i) => (
                    <Link key={i} to="/connect" className={`flex items-center justify-between hover:bg-white/5 rounded-lg p-1 -mx-1 transition ${!c.active ? 'opacity-50' : ''}`}>
                      <div className="flex items-center space-x-2">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-r from-gray-700 to-gray-800 border border-white/10 overflow-hidden shrink-0">
                          <img src={c.img} alt={c.name} className="w-full h-full object-cover" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-bold truncate text-white">{c.name}</p>
                          <p className="text-[9px] text-white/40 truncate w-24">{c.msg}</p>
                        </div>
                      </div>
                      {c.active && <span className="text-[8px] text-[#B026FF]">●</span>}
                    </Link>
                  ))}
                  <div className="flex flex-col gap-2 mt-2 pt-2 border-t border-white/10">
                     <Link to="/connect" className="text-xs text-neon-blue hover:underline text-center">View all chats</Link>
                  </div>
                </div>
             </div>

             {/* Link Now */}
             <div className="bg-[#1F1F1F] rounded-2xl border border-white/5 p-4 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-3">
                  <div className="w-2 h-2 bg-red-500 rounded-full shadow-[0_0_8px_rgba(239,68,68,0.8)] animate-pulse"></div>
                </div>
                <h3 className="text-[9px] font-black uppercase tracking-[0.2em] text-[#00F0FF] mb-1">Link Now</h3>
                <p className="text-xs font-medium text-white/80 mb-3">Web3 Builders Room</p>
                <div className="flex -space-x-2 mb-3">
                  <img src="https://i.pravatar.cc/150?img=15" className="w-8 h-8 rounded-full border-2 border-[#1F1F1F] object-cover" alt="user" />
                  <img src="https://i.pravatar.cc/150?img=16" className="w-8 h-8 rounded-full border-2 border-[#1F1F1F] object-cover" alt="user" />
                  <img src="https://i.pravatar.cc/150?img=17" className="w-8 h-8 rounded-full border-2 border-[#1F1F1F] object-cover" alt="user" />
                  <div className="w-8 h-8 rounded-full bg-white/10 border-2 border-[#1F1F1F] flex items-center justify-center text-[9px] font-bold">+12</div>
                </div>
                <button className="px-3 py-1.5 bg-white/10 hover:bg-white/20 transition border border-white/10 rounded-lg text-[10px] font-bold flex items-center space-x-1.5 w-fit">
                  <span className="text-[#00F0FF]">▶</span>
                  <span>Join Call</span>
                </button>
             </div>

             {/* Veil Mode */}
             <div className="bg-gradient-to-br from-[#0A0A0A] to-[#141414] rounded-2xl border border-white/5 p-4 flex flex-col items-center justify-center text-center">
                <div className="w-10 h-10 rounded-full bg-[#1F1F1F] border border-white/10 flex items-center justify-center mb-2">
                  <span className="text-xl opacity-80 mt-0.5"><Lock className="w-5 h-5 text-gray-400" /></span>
                </div>
                <h4 className="text-[10px] font-bold text-white/80 uppercase tracking-widest mb-1">Veil Mode</h4>
                <p className="text-[9px] text-white/40 px-2 mb-3 leading-tight">True End-to-End Encryption Enabled.</p>
                <button className="text-[9px] text-[#B026FF] font-black border border-[#B026FF]/30 hover:bg-[#B026FF]/10 transition px-3 py-1 rounded-full">
                  UNVEIL SECURE
                </button>
             </div>

             {/* Top Vibes */}
             <div className="rounded-2xl border border-white/5 overflow-hidden relative group h-40">
                <img src="https://picsum.photos/400/800?random=vibe" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" alt="vibe" />
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                  <Link to="/vibes" className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30 hover:bg-white/30 transition cursor-pointer">
                    <span className="text-lg ml-0.5 text-white/90">▶</span>
                  </Link>
                </div>
                <div className="absolute bottom-2 left-2">
                  <span className="bg-[#00F0FF] text-black text-[8px] font-black px-1.5 py-0.5 rounded uppercase">Top Vibes</span>
                </div>
             </div>
          </div>
          <DashboardSheets />
        </div>
    );
  }

  // Tablet/Wider view (between 768px and 1024px)
  if (isTablet) {
    return (
        <div className="w-[100vw] h-[100vh] bg-black text-white overflow-hidden flex">
          {/* Left Sidebar (240px) */}
          <div className="w-[240px] flex flex-col h-full border-r border-[#B026FF]/30 bg-[#0A0A0A] shrink-0 z-50">
             <DashboardSidebar />
          </div>
          
          <div className="flex-1 w-full bg-skrim-bg relative overflow-hidden flex flex-col">
            <AppContent />
          </div>
          <DashboardSheets />
        </div>
    );
  }

  // Mobile View
  return (
      <div className="w-[100vw] h-[100vh] overflow-hidden bg-black flex flex-col">
        <MobileStatsDashboard />
        <div className="w-full h-full relative overflow-hidden bg-skrim-bg flex flex-col">
          <AppContent />
        </div>
        <DashboardSheets />
      </div>
  );
}

export default function App() {
  const { isAuthenticated } = useAuthStore();

  React.useEffect(() => {
    const detectDeviceLanguage = () => {
      // Already detected before?
      const existing = localStorage.getItem("skrimchat_device_lang");
      if (existing) return;
      // Don't re-detect

      // Get device language:
      const deviceLang = navigator.language || navigator.languages?.[0] || "en";

      // Map to full language name:
      const langMap: Record<string, string> = {
        "hi": "Hindi", "te": "Telugu", "ta": "Tamil", "kn": "Kannada", "ml": "Malayalam",
        "mr": "Marathi", "bn": "Bengali", "gu": "Gujarati", "pa": "Punjabi", "or": "Odia",
        "ur": "Urdu", "as": "Assamese", "bho": "Bhojpuri", "en": "English", "es": "Spanish",
        "fr": "French", "de": "German", "it": "Italian", "pt": "Portuguese", "ru": "Russian",
        "ja": "Japanese", "ko": "Korean", "zh": "Chinese", "ar": "Arabic", "tr": "Turkish",
        "id": "Indonesian", "ms": "Malay", "th": "Thai", "vi": "Vietnamese", "nl": "Dutch",
        "pl": "Polish", "uk": "Ukrainian", "el": "Greek", "ro": "Romanian", "sv": "Swedish",
        "no": "Norwegian", "da": "Danish", "fi": "Finnish", "cs": "Czech", "hu": "Hungarian",
        "he": "Hebrew", "fa": "Persian", "sw": "Swahili", "fil": "Filipino", "my": "Burmese",
        "km": "Khmer", "kk": "Kazakh", "ps": "Pashto", "am": "Amharic", "ha": "Hausa",
        "yo": "Yoruba", "zu": "Zulu", "af": "Afrikaans", "so": "Somali", "mi": "Maori",
        "haw": "Hawaiian", "sm": "Samoan"
      };

      // Extract language code:
      const langCode = deviceLang.split("-")[0].toLowerCase();

      // Get language name:
      const langName = langMap[langCode] || "English";

      // Also check if Indian language -> add Hindi too:
      const indianLangs = ["te","ta","kn","ml","mr","bn","gu","pa","or","ur","as","bho"];
      const detectedLangs = [langName];

      if (indianLangs.includes(langCode)) {
        detectedLangs.push("Hindi");
        detectedLangs.push("English");
      } else {
        detectedLangs.push("English");
      }

      // Remove duplicates:
      const uniqueLangs = [...new Set(detectedLangs)];

      // Save to localStorage:
      localStorage.setItem("skrimchat_device_lang", JSON.stringify({
        raw: deviceLang,
        code: langCode,
        languages: uniqueLangs,
        detectedAt: Date.now(),
        source: "device"
      }));
      updateFinalLanguages();
    };

    const detectIPLocation = async () => {
      // Already detected?
      const existing = localStorage.getItem("skrimchat_ip_lang");
      if (existing) return;

      try {
        const response = await fetch("https://ipapi.co/json/");
        const data = await response.json();

        // Map country to languages:
        const countryLangMap: Record<string, string[]> = {
          "IN": ["Hindi", "English"],
          "US": ["English"],
          "GB": ["English"],
          "AU": ["English"],
          "CA": ["English", "French"],
          "FR": ["French", "English"],
          "DE": ["German", "English"],
          "ES": ["Spanish", "English"],
          "MX": ["Spanish", "English"],
          "BR": ["Portuguese", "English"],
          "PT": ["Portuguese", "English"],
          "RU": ["Russian", "English"],
          "JP": ["Japanese", "English"],
          "KR": ["Korean", "English"],
          "CN": ["Chinese", "English"],
          "AR": ["Arabic", "English"],
          "SA": ["Arabic", "English"],
          "TR": ["Turkish", "English"],
          "ID": ["Indonesian", "English"],
          "MY": ["Malay", "English"],
          "TH": ["Thai", "English"],
          "VN": ["Vietnamese", "English"],
          "PH": ["Filipino", "English"],
          "PK": ["Urdu", "English"],
          "BD": ["Bengali", "English"],
          "NG": ["English", "Hausa"],
          "KE": ["Swahili", "English"],
          "ZA": ["Afrikaans", "Zulu", "English"],
          "IL": ["Hebrew", "English"],
          "IR": ["Persian", "English"],
          "UA": ["Ukrainian", "English"],
          "PL": ["Polish", "English"],
          "NL": ["Dutch", "English"],
          "SE": ["Swedish", "English"],
          "NO": ["Norwegian", "English"],
          "DK": ["Danish", "English"],
          "FI": ["Finnish", "English"],
          "GR": ["Greek", "English"],
          "RO": ["Romanian", "English"],
          "CZ": ["Czech", "English"],
          "HU": ["Hungarian", "English"]
        };

        // Get languages for country:
        const countryLangs = countryLangMap[data.country_code] || ["English"];

        // For India specifically check state/region for more specific language:
        let regionalLang = null;
        if (data.country_code === "IN") {
          const stateMap: Record<string, string> = {
            "Andhra Pradesh": "Telugu",
            "Telangana": "Telugu",
            "Tamil Nadu": "Tamil",
            "Karnataka": "Kannada",
            "Kerala": "Malayalam",
            "Maharashtra": "Marathi",
            "West Bengal": "Bengali",
            "Gujarat": "Gujarati",
            "Punjab": "Punjabi",
            "Odisha": "Odia",
            "Assam": "Assamese",
            "Bihar": "Bhojpuri",
            "Uttar Pradesh": "Hindi",
            "Delhi": "Hindi",
            "Rajasthan": "Hindi",
            "Madhya Pradesh": "Hindi"
          };
          regionalLang = stateMap[data.region];
        }

        // Build final language list:
        const ipLangs = [];
        if (regionalLang) {
          ipLangs.push(regionalLang);
        }
        ipLangs.push(...countryLangs);

        // Remove duplicates:
        const uniqueLangs = [...new Set(ipLangs)];

        // Save to localStorage:
        localStorage.setItem("skrimchat_ip_lang", JSON.stringify({
          country: data.country_code,
          countryName: data.country_name,
          region: data.region,
          city: data.city,
          languages: uniqueLangs,
          detectedAt: Date.now(),
          source: "ip"
        }));
        updateFinalLanguages();

      } catch (error) {
        // IP detection failed (VPN or API limit)
        // Save fallback:
        localStorage.setItem("skrimchat_ip_lang", JSON.stringify({
          languages: ["English"],
          detectedAt: Date.now(),
          source: "ip_failed",
          error: true
        }));
        updateFinalLanguages();
      }
    };

    detectDeviceLanguage();
    detectIPLocation();
  }, []);

  return (
    <Router>
      {!isAuthenticated ? (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100dvh', zIndex: 9999 }} className="bg-black">
            <div className="w-full h-full relative">
               <AuthScreen />
            </div>
         </div>
      ) : (
         <MainAppLayout />
      )}
    </Router>
  );
}
