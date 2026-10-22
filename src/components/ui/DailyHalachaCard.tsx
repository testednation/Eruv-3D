import React, { useState, useEffect } from 'react';
import { 
  BookMarked, 
  Search, 
  ExternalLink, 
  RefreshCw, 
  ChevronUp, 
  ChevronDown, 
  Sparkles, 
  ScrollText,
  CheckCircle2,
  AlertCircle
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

export const DailyHalachaCard: React.FC = () => {
  const [halacha, setHalacha] = useState<DailyHalachaData | null>(null);
  const [sources, setSources] = useState<SourceLink[]>([]);
  const [isLiveSearch, setIsLiveSearch] = useState<boolean>(true);
  const [loading, setLoading] = useState<boolean>(true);
  const [isExpanded, setIsExpanded] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDailyHalacha = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/daily-halacha');
      if (!res.ok) {
        throw new Error(`Failed to load daily halacha (${res.status})`);
      }
      const data = await res.json();
      if (data.success && data.halacha) {
        setHalacha(data.halacha);
        setSources(data.sources || []);
        setIsLiveSearch(!!data.isLiveSearch);
      } else {
        throw new Error('Invalid halacha format received');
      }
    } catch (err: unknown) {
      console.error(err);
      setError('Could not retrieve live daily law. Loaded classical halachic standard.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDailyHalacha();
  }, []);

  const handleRefresh = () => {
    soundManager.playClick();
    fetchDailyHalacha();
  };

  return (
    <div className="pointer-events-auto bg-slate-900/95 border border-amber-500/40 rounded-2xl shadow-2xl backdrop-blur-md max-w-sm w-full text-slate-100 overflow-hidden transition-all duration-300">
      {/* Top Header Bar */}
      <div className="flex items-center justify-between px-3.5 py-2.5 bg-gradient-to-r from-amber-950/60 to-slate-900 border-b border-amber-500/20">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-amber-500/20 text-amber-400">
            <ScrollText className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-serif font-bold text-amber-200">Daily Halacha</span>
              <span className="text-[9px] font-mono font-semibold px-1.5 py-0.2 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1">
                <Search className="w-2.5 h-2.5" />
                Google Search
              </span>
            </div>
            <div className="text-[10px] text-slate-400">Hilchot Eruvin for Today</div>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={handleRefresh}
            disabled={loading}
            className="p-1.5 text-slate-400 hover:text-amber-300 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer disabled:opacity-50"
            title="Refresh Halacha via Google Search"
            aria-label="Refresh Daily Halacha"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-amber-400' : ''}`} />
          </button>
          <button
            onClick={() => {
              soundManager.playClick();
              setIsExpanded(!isExpanded);
            }}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
            aria-label={isExpanded ? 'Collapse card' : 'Expand card'}
          >
            {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="p-3.5 space-y-2.5 text-xs">
          {loading ? (
            <div className="py-6 flex flex-col items-center justify-center space-y-2 text-slate-400">
              <RefreshCw className="w-5 h-5 animate-spin text-amber-400" />
              <span className="text-xs font-mono">Searching Eruvin laws via Google Search...</span>
            </div>
          ) : halacha ? (
            <>
              {/* Hebrew Term & English Title */}
              <div>
                <div className="flex items-center justify-between gap-2">
                  <h3 className="font-bold text-amber-300 text-sm leading-tight">
                    {halacha.title}
                  </h3>
                  {halacha.hebrewTerm && (
                    <span className="text-[11px] font-serif font-semibold text-slate-300 shrink-0" dir="rtl">
                      {halacha.hebrewTerm}
                    </span>
                  )}
                </div>
              </div>

              {/* The Law */}
              <div className="p-2.5 rounded-xl bg-slate-800/70 border border-slate-700/60 leading-relaxed text-slate-200">
                <p className="text-[11px]">{halacha.law}</p>
              </div>

              {/* Practical Application */}
              {halacha.practicalApplication && (
                <div className="space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                    Modern Practical Example:
                  </span>
                  <p className="text-[11px] text-slate-300 leading-relaxed">
                    {halacha.practicalApplication}
                  </p>
                </div>
              )}

              {/* Source Citation */}
              <div className="pt-2 border-t border-slate-800">
                <div className="flex items-center gap-1.5 p-2 bg-slate-800/80 rounded-xl border border-slate-700/60 text-[10px]">
                  <ScrollText className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <span className="text-[9px] uppercase tracking-wider text-slate-400 block font-sans">
                      Shulchan Aruch & Classical Authority:
                    </span>
                    <span className="font-mono text-amber-300 font-semibold truncate block">
                      {halacha.source}
                    </span>
                  </div>
                </div>
              </div>

              {/* Search Grounding Citations */}
              {sources.length > 0 && (
                <div className="pt-1 border-t border-slate-800/60">
                  <span className="text-[9px] font-bold uppercase tracking-wider text-slate-500 block mb-1">
                    Verified Search Citations:
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {sources.map((s, idx) => (
                      <a
                        key={idx}
                        href={s.uri}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-[9px] text-sky-400 hover:text-sky-300 bg-sky-950/40 hover:bg-sky-900/50 border border-sky-800/50 px-2 py-0.5 rounded-md transition-colors"
                      >
                        <span className="truncate max-w-[120px]">{s.title}</span>
                        <ExternalLink className="w-2.5 h-2.5 shrink-0" />
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-4 text-slate-400 text-xs">
              Unable to load daily halacha at this moment.
            </div>
          )}
        </div>
      )}
    </div>
  );
};
