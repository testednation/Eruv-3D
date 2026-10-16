import React, { useState, useEffect, useRef } from 'react';
import { 
  Lightbulb, 
  ChevronLeft, 
  ChevronRight, 
  Shuffle, 
  Pause, 
  Play, 
  ChevronUp, 
  ChevronDown, 
  BookMarked, 
  Sparkles,
  Layers,
  X
} from 'lucide-react';
import { ERUV_FACTS, EruvFact } from '../../data/eruvFacts';
import { soundManager } from '../../utils/audio';

export const DidYouKnowCard: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [isExpanded, setIsExpanded] = useState(true);
  const [isBrowseOpen, setIsBrowseOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [isHovered, setIsHovered] = useState(false);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const currentFact = ERUV_FACTS[currentIndex];

  // Auto-rotation timer
  useEffect(() => {
    if (!isAutoPlaying || isHovered || !isExpanded) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    timerRef.current = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % ERUV_FACTS.length);
    }, 12000); // 12 seconds per fact

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isAutoPlaying, isHovered, isExpanded]);

  const handleNext = () => {
    soundManager.playClick();
    setCurrentIndex((prev) => (prev + 1) % ERUV_FACTS.length);
  };

  const handlePrev = () => {
    soundManager.playClick();
    setCurrentIndex((prev) => (prev - 1 + ERUV_FACTS.length) % ERUV_FACTS.length);
  };

  const handleShuffle = () => {
    soundManager.playClick();
    let nextIdx;
    do {
      nextIdx = Math.floor(Math.random() * ERUV_FACTS.length);
    } while (nextIdx === currentIndex && ERUV_FACTS.length > 1);
    setCurrentIndex(nextIdx);
  };

  const toggleAutoPlay = () => {
    soundManager.playClick();
    setIsAutoPlaying(!isAutoPlaying);
  };

  const categoryColorMap: Record<string, string> = {
    'Urban History': 'bg-sky-500/20 text-sky-300 border-sky-500/30',
    'Halachic Principle': 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
    'Modern Engineering': 'bg-purple-500/20 text-purple-300 border-purple-500/30',
    'Global Eruvin': 'bg-amber-500/20 text-amber-300 border-amber-500/30',
    'Talmudic Lore': 'bg-rose-500/20 text-rose-300 border-rose-500/30',
  };

  const allCategories = ['All', 'Urban History', 'Halachic Principle', 'Modern Engineering', 'Global Eruvin', 'Talmudic Lore'];

  const filteredFacts = selectedCategory === 'All'
    ? ERUV_FACTS
    : ERUV_FACTS.filter(f => f.category === selectedCategory);

  return (
    <>
      <div 
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className="pointer-events-auto bg-slate-900/95 border border-sky-500/40 rounded-2xl shadow-2xl backdrop-blur-md max-w-sm w-full text-slate-100 overflow-hidden transition-all duration-300"
      >
        {/* Header Bar */}
        <div className="flex items-center justify-between px-3.5 py-2.5 bg-gradient-to-r from-sky-950/60 to-slate-900 border-b border-sky-500/20">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-sky-500/20 text-sky-400">
              <Lightbulb className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-serif font-bold text-sky-200">Did You Know?</span>
                <span className="text-[9px] font-mono font-semibold px-1.5 py-0.2 rounded-full bg-slate-800 text-sky-300 border border-slate-700">
                  {currentIndex + 1}/{ERUV_FACTS.length}
                </span>
              </div>
              <div className="text-[10px] text-slate-400">Eruv History & Curiosities</div>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => {
                soundManager.playClick();
                setIsBrowseOpen(true);
              }}
              className="p-1.5 text-slate-400 hover:text-sky-300 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
              title="Browse all 12 facts"
              aria-label="Browse all facts"
            >
              <Layers className="w-3.5 h-3.5" />
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

        {/* Expanded Content Body */}
        {isExpanded && (
          <div className="p-3.5 space-y-2.5 text-xs">
            {/* Tag & Category */}
            <div className="flex items-center justify-between gap-1.5">
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${categoryColorMap[currentFact.category]}`}>
                {currentFact.category}
              </span>
              <span className="text-[10px] font-mono text-slate-400 flex items-center gap-1">
                <span>{currentFact.icon}</span>
                <span>{currentFact.tag}</span>
              </span>
            </div>

            {/* Fact Title */}
            <h3 className="font-bold text-sky-200 text-sm leading-snug">
              {currentFact.title}
            </h3>

            {/* Fact Text */}
            <div className="p-2.5 rounded-xl bg-slate-800/70 border border-slate-700/60 leading-relaxed text-slate-200">
              <p className="text-[11px]">{currentFact.fact}</p>
            </div>

            {/* Historical Context / Deep Dive */}
            <div className="text-[11px] text-slate-400 leading-relaxed italic border-l-2 border-sky-500/50 pl-2">
              "{currentFact.historicalContext}"
            </div>

            {/* Source */}
            <div className="pt-1.5 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-400 font-mono">
              <div className="flex items-center gap-1 truncate">
                <BookMarked className="w-3 h-3 text-sky-400 shrink-0" />
                <span className="truncate text-slate-300">{currentFact.source}</span>
              </div>
            </div>

            {/* Controls Bar */}
            <div className="flex items-center justify-between pt-1 border-t border-slate-800/60 text-slate-400">
              <div className="flex items-center gap-1">
                <button
                  onClick={handlePrev}
                  className="p-1 rounded-md hover:bg-slate-800 hover:text-white transition-colors cursor-pointer"
                  title="Previous Fact"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={handleNext}
                  className="p-1 rounded-md hover:bg-slate-800 hover:text-white transition-colors cursor-pointer"
                  title="Next Fact"
                >
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={handleShuffle}
                  className="p-1 rounded-md hover:bg-slate-800 hover:text-sky-300 transition-colors cursor-pointer ml-1"
                  title="Random Fact"
                >
                  <Shuffle className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={toggleAutoPlay}
                  className="flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-md bg-slate-800/80 hover:bg-slate-800 text-slate-300 transition-colors cursor-pointer"
                  title={isAutoPlaying ? 'Pause rotation' : 'Resume rotation'}
                >
                  {isAutoPlaying ? <Pause className="w-2.5 h-2.5 text-amber-400" /> : <Play className="w-2.5 h-2.5 text-emerald-400" />}
                  <span>{isAutoPlaying ? 'Auto' : 'Paused'}</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Full Browse Modal */}
      {isBrowseOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl p-6 shadow-2xl max-w-2xl w-full max-h-[85vh] flex flex-col text-slate-100">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-sky-500/20 text-sky-400 rounded-xl">
                  <Lightbulb className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-xl font-serif font-bold text-white">Eruv History & Trivia Archive</h2>
                  <p className="text-xs text-slate-400">Discover surprising facts about the world's most unique legal perimeters</p>
                </div>
              </div>
              <button
                onClick={() => {
                  soundManager.playClick();
                  setIsBrowseOpen(false);
                }}
                className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Category Filter Pills */}
            <div className="flex flex-wrap gap-1.5 mb-4">
              {allCategories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => {
                    soundManager.playClick();
                    setSelectedCategory(cat);
                  }}
                  className={`px-2.5 py-1 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                    selectedCategory === cat
                      ? 'bg-sky-500 text-slate-950 font-bold shadow-md'
                      : 'bg-slate-800/80 text-slate-300 hover:bg-slate-800 hover:text-white border border-slate-700/60'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Facts Grid / Scroll Area */}
            <div className="overflow-y-auto space-y-3 pr-1 flex-1">
              {filteredFacts.map((fact) => (
                <div
                  key={fact.id}
                  className="p-4 bg-slate-800/40 border border-slate-800 rounded-2xl hover:border-slate-700 transition-colors space-y-2"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${categoryColorMap[fact.category]}`}>
                      {fact.category}
                    </span>
                    <span className="text-xs text-slate-400 font-mono flex items-center gap-1">
                      <span>{fact.icon}</span>
                      <span>{fact.tag}</span>
                    </span>
                  </div>

                  <h4 className="font-bold text-white text-sm">
                    {fact.title}
                  </h4>

                  <p className="text-xs text-slate-300 leading-relaxed">
                    {fact.fact}
                  </p>

                  <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800/80 text-[11px] text-slate-400 leading-relaxed italic">
                    "{fact.historicalContext}"
                  </div>

                  <div className="flex items-center justify-between pt-1 text-[10px] text-slate-500 font-mono">
                    <span>Source: {fact.source}</span>
                    <button
                      onClick={() => {
                        const idx = ERUV_FACTS.findIndex(f => f.id === fact.id);
                        if (idx !== -1) {
                          setCurrentIndex(idx);
                          setIsBrowseOpen(false);
                          soundManager.playClick();
                        }
                      }}
                      className="text-sky-400 hover:text-sky-300 underline cursor-pointer"
                    >
                      Pin to Dashboard
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
};
