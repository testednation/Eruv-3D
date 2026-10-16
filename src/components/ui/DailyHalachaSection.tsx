import React, { useState, useEffect } from 'react';
import { 
  ScrollText, 
  Search, 
  RefreshCw, 
  BookMarked, 
  ExternalLink, 
  Copy, 
  Check, 
  Volume2, 
  Sparkles, 
  HelpCircle, 
  Compass,
  ArrowRight,
  ShieldCheck
} from 'lucide-react';
import { soundManager } from '../../utils/audio';

interface DailyHalachaData {
  title: string;
  hebrewTerm: string;
  law: string;
  practicalApplication: string;
  source: string;
}

interface SourceLink {
  title: string;
  uri: string;
}

const TOPICS = [
  { id: '', label: 'Today\'s Featured Law', icon: '✨' },
  { id: 'carrying baby strollers on Shabbat', label: 'Baby Strollers', icon: '👶' },
  { id: 'carrying house keys on Shabbat', label: 'House Keys & Pockets', icon: '🔑' },
  { id: 'Tzurat HaPetach overhead wire alignment Al Gabav', label: 'Overhead Wire (Al Gabav)', icon: '🚪' },
  { id: 'Lavud principle gaps under 3 tefachim', label: 'Lavud & Fence Gaps', icon: '📏' },
  { id: 'Eruv Chatzerot communal matzah partnership', label: 'Communal Matzah (Eruv Chatzerot)', icon: '🍞' },
  { id: 'distinction between Muktzeh and Hotzaah carrying', label: 'Muktzeh vs Carrying', icon: '📱' },
  { id: 'checking eruv after storms on Friday', label: 'Friday Storm Audits', icon: '⚡' },
];

export const DailyHalachaSection: React.FC = () => {
  const [halacha, setHalacha] = useState<DailyHalachaData | null>(null);
  const [sources, setSources] = useState<SourceLink[]>([]);
  const [isLiveSearch, setIsLiveSearch] = useState<boolean>(true);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedTopic, setSelectedTopic] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchHalacha = async (topicQuery: string = selectedTopic) => {
    setLoading(true);
    setError(null);
    try {
      const url = topicQuery 
        ? `/api/daily-halacha?topic=${encodeURIComponent(topicQuery)}`
        : '/api/daily-halacha';
      const res = await fetch(url);
      if (!res.ok) {
        throw new Error(`Failed to fetch halacha (${res.status})`);
      }
      const data = await res.json();
      if (data.success && data.halacha) {
        setHalacha(data.halacha);
        setSources(data.sources || []);
        setIsLiveSearch(!!data.isLiveSearch);
      } else {
        throw new Error('Invalid halacha payload');
      }
    } catch (err) {
      console.error(err);
      setError('Unable to load live halacha right now. Showing classical halachic standard.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHalacha(selectedTopic);
  }, [selectedTopic]);

  const handleTopicClick = (topicId: string) => {
    soundManager.playClick();
    setSelectedTopic(topicId);
  };

  const handleRefresh = () => {
    soundManager.playClick();
    fetchHalacha(selectedTopic);
  };

  const handleCopy = () => {
    if (!halacha) return;
    soundManager.playClick();
    const textToCopy = `${halacha.title} (${halacha.hebrewTerm})\n\n${halacha.law}\n\nPractical: ${halacha.practicalApplication}\nSource: ${halacha.source}`;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleChime = () => {
    soundManager.playRepairSound();
  };

  const todayFormatted = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  });

  return (
    <div className="relative w-full max-w-5xl mx-auto p-4 sm:p-6 text-slate-100 overflow-y-auto max-h-[82vh]">
      {/* Section Header */}
      <div className="text-center max-w-2xl mx-auto mb-6">
        <div className="flex items-center justify-center gap-2 mb-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-amber-400 bg-amber-950/60 px-3 py-1 rounded-full border border-amber-800 flex items-center gap-1.5">
            <ScrollText className="w-3.5 h-3.5" />
            Daily Halacha • הלכה יומית
          </span>
          <span className="text-[11px] font-mono font-semibold px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700 flex items-center gap-1">
            <Search className="w-3 h-3 text-sky-400" />
            Google Search Grounded
          </span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-serif font-bold text-white">
          Hilchot Eruvin & Shabbat Carrying
        </h2>
        <p className="text-xs sm:text-sm text-slate-400 mt-1 font-mono">
          {todayFormatted} • Daily laws distilled for beginners & practitioners
        </p>
      </div>

      {/* Topic Filter Pills */}
      <div className="flex flex-wrap items-center justify-center gap-1.5 mb-6 bg-slate-900/90 border border-slate-800 p-2 rounded-2xl">
        {TOPICS.map((t) => (
          <button
            key={t.id}
            onClick={() => handleTopicClick(t.id)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              selectedTopic === t.id
                ? 'bg-amber-500 text-slate-950 font-bold shadow-md'
                : 'text-slate-300 hover:text-white bg-slate-800/60 hover:bg-slate-800 border border-slate-700/50'
            }`}
          >
            <span>{t.icon}</span>
            <span>{t.label}</span>
          </button>
        ))}
      </div>

      {/* Main Law Display Card */}
      <div className="bg-slate-900 border border-amber-500/40 rounded-3xl p-6 shadow-2xl relative overflow-hidden mb-6">
        {/* Top Card Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-4 mb-4">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400">
              <ScrollText className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-amber-400">
                Today's Selected Halacha
              </span>
              <div className="text-xs text-slate-400">
                {isLiveSearch ? 'Retrieved via Live Web Search Grounding' : 'Classical Halachic Archive'}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleChime}
              className="p-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 transition-colors cursor-pointer"
              title="Play Chime"
            >
              <Volume2 className="w-4 h-4 text-amber-400" />
            </button>
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 text-xs font-medium transition-colors cursor-pointer"
              title="Copy text to clipboard"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>
            <button
              onClick={handleRefresh}
              disabled={loading}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition-all shadow-md cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span>Fetch Another Law</span>
            </button>
          </div>
        </div>

        {/* Content Body */}
        {loading ? (
          <div className="py-12 flex flex-col items-center justify-center space-y-3 text-slate-400">
            <RefreshCw className="w-8 h-8 animate-spin text-amber-400" />
            <p className="text-xs font-mono">Querying verified Hilchot Eruvin via Google Search...</p>
          </div>
        ) : halacha ? (
          <div className="space-y-4">
            {/* Title & Hebrew */}
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <h3 className="text-xl sm:text-2xl font-serif font-bold text-white">
                {halacha.title}
              </h3>
              {halacha.hebrewTerm && (
                <span className="text-base sm:text-lg font-serif font-semibold text-amber-300" dir="rtl">
                  {halacha.hebrewTerm}
                </span>
              )}
            </div>

            {/* The Law */}
            <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700/60 text-slate-200 text-sm leading-relaxed">
              <div className="text-[10px] uppercase font-bold text-slate-400 mb-1">
                The Halacha (Jewish Law):
              </div>
              <p>{halacha.law}</p>
            </div>

            {/* Practical Application */}
            {halacha.practicalApplication && (
              <div className="p-4 rounded-2xl bg-amber-950/20 border border-amber-600/30 text-amber-200/90 text-xs leading-relaxed">
                <div className="text-[10px] uppercase font-bold text-amber-400 mb-1 flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Modern Practical Application:</span>
                </div>
                <p>{halacha.practicalApplication}</p>
              </div>
            )}

            {/* Source Citation */}
            <div className="p-3 rounded-xl bg-slate-800/40 border border-slate-700/40 flex items-center justify-between text-xs text-slate-400">
              <span className="font-semibold text-slate-300">Halachic Foundation:</span>
              <div className="flex items-center gap-1.5 font-mono text-sky-300">
                <BookMarked className="w-3.5 h-3.5 text-sky-400" />
                <span>{halacha.source}</span>
              </div>
            </div>

            {/* Google Search Grounding Sources */}
            {sources.length > 0 && (
              <div className="pt-2 border-t border-slate-800">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1.5">
                  Verified Online Citations & Sources:
                </span>
                <div className="flex flex-wrap gap-2">
                  {sources.map((s, idx) => (
                    <a
                      key={idx}
                      href={s.uri}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs text-sky-400 hover:text-sky-300 bg-sky-950/40 hover:bg-sky-900/50 border border-sky-800/60 px-3 py-1 rounded-xl transition-colors"
                    >
                      <span className="truncate max-w-[200px]">{s.title}</span>
                      <ExternalLink className="w-3 h-3 shrink-0" />
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-8 text-slate-400 text-xs">
            Unable to load law right now. Please click "Fetch Another Law" above.
          </div>
        )}
      </div>

      {/* Educational Background Note */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 text-xs text-slate-400 space-y-1.5">
        <div className="font-bold text-slate-300 flex items-center gap-1.5">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>Why We Study Hilchot Eruvin Daily:</span>
        </div>
        <p className="leading-relaxed">
          The Talmud states (<em>Eruvin 40a</em>) that the laws of Eruvin are like "mountains hanging by a thread" — minute physical details (the height of a post, a fractional gap, the exact alignment of a wire) transform an entire city boundary. Understanding these principles enhances both Sabbath joy (<em>Oneg Shabbat</em>) and reverent adherence to Torah law.
        </p>
      </div>
    </div>
  );
};
