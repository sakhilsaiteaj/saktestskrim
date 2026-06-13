import React, { useState, useEffect } from 'react';
import { ArrowLeft, Globe, Search, X, Check, SearchIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { getLanguageScores, updateFinalLanguages } from '../lib/utils/languageScoring';

const POPULAR_LANGUAGES = [
  "Hindi", "Tamil", "Kannada",
  "Spanish", "French", "Korean",
  "Arabic", "Japanese", "Portuguese",
  "English", "Telugu", "Malayalam"
];

const ALL_LANGUAGES = [
  ...POPULAR_LANGUAGES,
  "Marathi", "Bengali", "Gujarati", "Punjabi", "Odia", "Urdu", "Assamese", "Bhojpuri",
  "German", "Italian", "Russian", "Chinese", "Turkish", "Indonesian", "Malay", "Thai", 
  "Vietnamese", "Dutch", "Polish", "Ukrainian", "Greek", "Romanian", "Swedish", 
  "Norwegian", "Danish", "Finnish", "Czech", "Hungarian", "Hebrew", "Persian", 
  "Swahili", "Filipino", "Burmese", "Khmer", "Kazakh", "Pashto", "Amharic", "Hausa", 
  "Yoruba", "Zulu", "Afrikaans", "Somali", "Maori", "Hawaiian", "Samoan"
].sort();

export default function SettingsScreen() {
  const navigate = useNavigate();
  const [autoDetect, setAutoDetect] = useState(true);
  const [autoLangs, setAutoLangs] = useState<string[]>([]);
  const [manualLangs, setManualLangs] = useState<string[]>([]);
  const [showEditor, setShowEditor] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  useEffect(() => {
    // Check toggle state
    const detectOn = localStorage.getItem('skrimchat_auto_detect_on');
    if (detectOn !== null) {
      setAutoDetect(detectOn === 'true');
    }
    
    // Auto detected languages
    const scores = getLanguageScores();
    setAutoLangs(scores.length > 0 ? scores.slice(0, 3) : ['English']);

    // Manual languages
    const manual = localStorage.getItem('skrimchat_manual_langs');
    if (manual) {
      try {
        setManualLangs(JSON.parse(manual));
      } catch (e) {
        setManualLangs(['English']);
      }
    } else {
      setManualLangs(scores.length > 0 ? scores.slice(0, 3) : ['English']);
    }
  }, []);

  const toggleAutoDetect = () => {
    const newVal = !autoDetect;
    setAutoDetect(newVal);
    localStorage.setItem('skrimchat_auto_detect_on', String(newVal));
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 2000);
  };

  return (
    <div className="w-full h-full bg-skrim-bg overflow-y-auto no-scrollbar relative flex flex-col">
      <div className="sticky top-0 z-10 bg-skrim-bg/90 backdrop-blur-md border-b border-white/10 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="p-2 hover:bg-white/5 rounded-full transition-colors">
            <ArrowLeft className="w-5 h-5 text-white" />
          </button>
          <h1 className="text-xl font-bold text-white tracking-tight">Settings</h1>
        </div>
      </div>

      <div className="p-6">
        {/* Languages Section */}
        <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden mb-6">
          <div className="p-4 border-b border-white/10 flex items-center gap-2">
            <Globe className="w-5 h-5 text-[#00F0FF]" />
            <h2 className="text-sm font-bold text-white uppercase tracking-widest">Languages</h2>
          </div>
          
          <div className="p-5">
            <p className="text-xs text-gray-400 font-semibold mb-2">{autoDetect ? 'Auto Detected:' : 'Manual Selection:'}</p>
            <div className="flex justify-between items-center mb-6">
              <p className="text-sm text-white font-medium">
                {autoDetect ? autoLangs.join(' • ') : manualLangs.join(' • ')}
              </p>
              <button 
                onClick={() => setShowEditor(true)}
                className="text-xs font-bold text-[#B026FF] hover:text-[#00F0FF] transition-colors border border-white/10 hover:border-[#00F0FF]/30 px-3 py-1.5 rounded-full"
              >
                Edit →
              </button>
            </div>

            <div className="h-[1px] w-full bg-white/10 mb-4" />

            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <span className="text-lg">🔄</span>
                <span className="text-sm font-bold text-white">Auto Detect</span>
              </div>
              
              <button 
                onClick={toggleAutoDetect}
                className={`w-12 h-6 rounded-full p-1 transition-colors ${autoDetect ? 'bg-[#00F0FF]' : 'bg-white/20'}`}
              >
                <motion.div 
                  className="w-4 h-4 bg-white rounded-full"
                  animate={{ x: autoDetect ? 24 : 0 }}
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                />
              </button>
            </div>
            <p className="text-[10px] text-gray-500 mt-2">
              {autoDetect ? 'Currently using smart detection scoring' : 'Using your manual selection only'}
            </p>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {showEditor && (
          <LanguageEditorSheet 
            initialLangs={manualLangs} 
            onClose={() => setShowEditor(false)} 
            onSave={(langs) => {
              setManualLangs(langs);
              localStorage.setItem('skrimchat_manual_langs', JSON.stringify(langs));
              updateFinalLanguages();
              setShowEditor(false);
              showToast('✅ Languages updated!');
            }}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {toastMessage && (
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 bg-[#00FF64]/20 border border-[#00FF64]/50 backdrop-blur-md px-6 py-3 rounded-full shadow-[0_0_15px_rgba(0,255,100,0.3)]"
          >
            <p className="text-sm font-bold text-white">{toastMessage}</p>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}

function LanguageEditorSheet({ initialLangs, onClose, onSave }: { initialLangs: string[], onClose: () => void, onSave: (l: string[]) => void }) {
  const [selected, setSelected] = useState<string[]>(initialLangs.length ? initialLangs : ['English']);
  const [search, setSearch] = useState('');

  const toggleLang = (lang: string) => {
    if (selected.includes(lang)) {
      if (selected.length > 1) {
        setSelected(selected.filter(l => l !== lang));
      }
    } else {
      setSelected([...selected, lang]);
    }
  };

  const filtered = ALL_LANGUAGES.filter(l => l.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 pointer-events-auto">
      <motion.div 
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }} 
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
      />
      
      <motion.div 
        initial={{ y: '100%' }} 
        animate={{ y: 0 }} 
        exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className="relative w-full max-w-md bg-[#141414] border border-white/10 rounded-t-3xl sm:rounded-3xl p-6 h-[85vh] sm:h-[80vh] flex flex-col shadow-[0_-10px_40px_rgba(0,0,0,0.5)]"
      >
        <div className="w-12 h-1.5 bg-white/20 rounded-full mx-auto mb-6 shrink-0 sm:hidden" />
        
        <div className="flex items-center gap-3 mb-6 shrink-0">
          <Globe className="w-6 h-6 text-[#B026FF]" />
          <h2 className="text-xl font-bold text-white">Your Languages</h2>
        </div>

        <div className="flex-1 overflow-y-auto no-scrollbar space-y-6 pb-6">
          {/* Selected */}
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Selected ({selected.length}):</p>
            <div className="flex flex-wrap gap-2">
              {selected.map(lang => (
                <div key={lang} className="bg-[#B026FF]/20 border border-[#B026FF] text-white px-3 py-1.5 rounded-full text-sm font-semibold flex items-center gap-2">
                  {lang}
                  <button onClick={() => toggleLang(lang)} disabled={selected.length === 1} className="hover:bg-white/20 rounded-full p-0.5 disabled:opacity-30">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
            {selected.length === 1 && <p className="text-[10px] text-red-400 mt-2">Must keep at least 1 language.</p>}
          </div>

          <div className="h-[1px] w-full bg-white/10" />

          {/* Search */}
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Add Language:</p>
            <div className="relative mb-4">
              <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input 
                type="text" 
                placeholder="Search languages..." 
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-white text-sm focus:outline-none focus:border-[#B026FF] transition-colors"
              />
            </div>
            
            {search ? (
              <div className="flex flex-wrap gap-2">
                {filtered.map(lang => {
                  const isSel = selected.includes(lang);
                  return (
                    <button 
                      key={lang}
                      onClick={() => toggleLang(lang)}
                      className={`px-3 py-1.5 rounded-full text-sm font-semibold transition-colors flex items-center gap-1 ${isSel ? 'bg-[#B026FF]/20 border-[#B026FF] text-[#B026FF]' : 'bg-white/5 border-white/10 text-gray-300 hover:bg-white/10'} border`}
                    >
                      {lang}
                      {isSel && <Check className="w-3.5 h-3.5" />}
                    </button>
                  );
                })}
                {filtered.length === 0 && <p className="text-sm text-gray-500">No languages found.</p>}
              </div>
            ) : (
              <div>
                <p className="text-[10px] uppercase font-bold text-gray-500 mb-2">Popular</p>
                <div className="flex flex-wrap gap-2">
                  {POPULAR_LANGUAGES.map(lang => {
                    const isSel = selected.includes(lang);
                    return (
                      <button 
                        key={lang}
                        onClick={() => toggleLang(lang)}
                        className={`px-3 py-1.5 rounded-full text-sm font-semibold transition-colors flex items-center gap-1 ${isSel ? 'bg-[#B026FF]/20 border-[#B026FF] text-[#B026FF]' : 'bg-white/5 border-white/10 text-gray-300 hover:bg-white/10'} border`}
                      >
                        {lang}
                        {isSel && <Check className="w-3.5 h-3.5" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Action Button */}
        <div className="pt-4 mt-auto border-t border-white/10 shrink-0">
          <button 
            onClick={() => onSave(selected)}
            className="w-full bg-gradient-to-r from-[#B026FF] to-[#00F0FF] text-white font-bold py-3.5 rounded-xl transition hover:brightness-110 active:scale-95 shadow-[0_4px_15px_rgba(176,38,255,0.4)]"
          >
            Save Changes
          </button>
        </div>
      </motion.div>
    </div>
  );
}
