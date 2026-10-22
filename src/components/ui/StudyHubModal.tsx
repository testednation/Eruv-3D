import React, { useState } from 'react';
import { 
  BookOpen, 
  ScrollText, 
  Lightbulb, 
  CheckCircle2, 
  X, 
  Sparkles, 
  Search, 
  Eye, 
  Layers,
  ArrowRight
} from 'lucide-react';
import { DailyHalachaCard } from './DailyHalachaCard';
import { DidYouKnowCard } from './DidYouKnowCard';
import { KosherVisualizer } from './KosherVisualizer';
import { ShulchanAruchSourcesView } from './ShulchanAruchSourcesView';
import { soundManager } from '../../utils/audio';

interface StudyHubModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: 'daily' | 'sources' | 'facts' | 'rules';
  onOpenGlossary?: (term?: string) => void;
}

export const StudyHubModal: React.FC<StudyHubModalProps> = ({
  isOpen,
  onClose,
  initialTab = 'daily',
  onOpenGlossary,
}) => {
  const [activeTab, setActiveTab] = useState<'daily' | 'sources' | 'facts' | 'rules'>(initialTab);

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in"
      onClick={onClose}
    >
      <div 
        className="bg-slate-900 border border-slate-700 rounded-3xl shadow-2xl max-w-3xl w-full text-slate-100 flex flex-col max-h-[92vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header with Title and Close Button */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800 bg-slate-900/90">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-serif font-bold text-lg text-white">Halachic Study Center</h2>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 uppercase font-semibold">
                  Orach Chayim Codex
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Primary Shulchan Aruch source citations, daily laws, trivia, and kosher architecture
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              soundManager.playClick();
              onClose();
            }}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            aria-label="Close Study Center"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="px-4 sm:px-5 pt-3 pb-2 border-b border-slate-800 bg-slate-950/40">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 sm:gap-2 bg-slate-800/80 p-1 rounded-2xl border border-slate-700/60">
            <button
              onClick={() => {
                soundManager.playClick();
                setActiveTab('daily');
              }}
              className={`flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'daily'
                  ? 'bg-amber-500 text-slate-950 shadow-md font-bold'
                  : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
              }`}
            >
              <ScrollText className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">Daily Halacha</span>
            </button>

            <button
              onClick={() => {
                soundManager.playClick();
                setActiveTab('sources');
              }}
              className={`flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'sources'
                  ? 'bg-amber-500 text-slate-950 shadow-md font-bold'
                  : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5 shrink-0 text-sky-400" />
              <span className="truncate">OC Sources</span>
            </button>

            <button
              onClick={() => {
                soundManager.playClick();
                setActiveTab('facts');
              }}
              className={`flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'facts'
                  ? 'bg-amber-500 text-slate-950 shadow-md font-bold'
                  : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
              }`}
            >
              <Lightbulb className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">Did You Know?</span>
            </button>

            <button
              onClick={() => {
                soundManager.playClick();
                setActiveTab('rules');
              }}
              className={`flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'rules'
                  ? 'bg-amber-500 text-slate-950 shadow-md font-bold'
                  : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
              }`}
            >
              <Eye className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">Kosher Rules</span>
            </button>
          </div>
        </div>

        {/* Tab Content Body */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-4">
          {activeTab === 'daily' && (
            <div className="space-y-4">
              <div className="p-3 bg-amber-950/20 border border-amber-500/30 rounded-2xl flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <span className="text-xs text-amber-200">
                    Live law on Shabbat boundaries verified against classic halachic codices.
                  </span>
                </div>
                {onOpenGlossary && (
                  <button
                    onClick={() => {
                      soundManager.playClick();
                      onOpenGlossary('Eruv');
                    }}
                    className="text-xs text-sky-400 hover:text-sky-300 underline font-medium flex items-center gap-1 shrink-0 ml-2 cursor-pointer"
                  >
                    <span>Glossary</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                )}
              </div>
              <div className="flex justify-center">
                <DailyHalachaCard />
              </div>
            </div>
          )}

          {activeTab === 'sources' && (
            <ShulchanAruchSourcesView onOpenGlossary={onOpenGlossary} />
          )}

          {activeTab === 'facts' && (
            <div className="space-y-4">
              <div className="p-3 bg-slate-800/50 border border-slate-700 rounded-2xl flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Lightbulb className="w-4 h-4 text-amber-400" />
                  <span className="text-xs text-slate-300">
                    Browse curated history, rabbinic engineering marvels, and practical carrying tips.
                  </span>
                </div>
              </div>
              <div className="flex justify-center">
                <DidYouKnowCard />
              </div>
            </div>
          )}

          {activeTab === 'rules' && (
            <div className="space-y-4">
              <div className="p-3 bg-emerald-950/20 border border-emerald-500/30 rounded-2xl flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span className="text-xs text-emerald-200">
                    Real-time visual illustrations comparing valid Kosher structures vs. invalid Pasul defects.
                  </span>
                </div>
              </div>
              <KosherVisualizer isCompact={false} />
            </div>
          )}
        </div>

        {/* Footer info bar */}
        <div className="px-5 py-3 border-t border-slate-800 bg-slate-900/90 flex items-center justify-between text-xs text-slate-400">
          <span>Based on Shulchan Aruch Orach Chaim §345–§395</span>
          <button
            onClick={() => {
              soundManager.playClick();
              onClose();
            }}
            className="px-4 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-medium transition-colors cursor-pointer"
          >
            Done Learning
          </button>
        </div>
      </div>
    </div>
  );
};
