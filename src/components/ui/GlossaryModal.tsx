import React, { useState, useEffect, useRef, useMemo } from 'react';
import { GLOSSARY_TERMS, GlossaryTermItem } from '../../data/eruvData';
import { soundManager } from '../../utils/audio';
import { BookOpen, Search, X, Sparkles, Filter, CheckCircle2, ScrollText, BookMarked, Copy, Check } from 'lucide-react';

interface GlossaryModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialQuery?: string;
}

type CategoryFilter = 'All' | 'Domains' | 'Architecture' | 'Principles' | 'Measurements' | 'Eruv Types';

const CATEGORIES: { label: string; value: CategoryFilter; icon?: string }[] = [
  { label: 'All Terms', value: 'All' },
  { label: 'Four Domains', value: 'Domains' },
  { label: 'Doorway Architecture', value: 'Architecture' },
  { label: 'Halachic Principles', value: 'Principles' },
  { label: 'Units & Measures', value: 'Measurements' },
  { label: 'Eruv Types', value: 'Eruv Types' },
];

const SIMAN_FILTERS = [
  { label: 'OC §345 (Domains)', siman: 345 },
  { label: 'OC §362 (Doorways)', siman: 362 },
  { label: 'OC §363 (Posts/Lintels)', siman: 363 },
  { label: 'OC §365 (Breaches)', siman: 365 },
  { label: 'OC §366 (Chatzerot)', siman: 366 },
];

const QUICK_FILTERS = [
  'Tzurat HaPetach',
  'Reshut Harabim',
  'Reshut HaYachid',
  'Lavud',
  'Lechi',
  'Korah',
  'Gud Asek',
  'Pirtzah',
  'Eruv Chatzerot',
];

// Helper to remove Hebrew diacritics (nikud) for search comparison
function stripNikud(text: string): string {
  return text.replace(/[\u0591-\u05C7]/g, '');
}

// Helper to highlight matching query text within a string
function HighlightText({ text, query }: { text: string; query: string }) {
  if (!query.trim()) return <>{text}</>;

  const cleanQuery = query.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const parts = text.split(new RegExp(`(${cleanQuery})`, 'gi'));

  return (
    <>
      {parts.map((part, index) =>
        part.toLowerCase() === query.trim().toLowerCase() ? (
          <mark
            key={index}
            className="bg-amber-400/30 text-amber-200 font-semibold px-0.5 rounded border border-amber-400/40"
          >
            {part}
          </mark>
        ) : (
          part
        )
      )}
    </>
  );
}

export const GlossaryModal: React.FC<GlossaryModalProps> = ({ isOpen, onClose, initialQuery = '' }) => {
  const [searchTerm, setSearchTerm] = useState(initialQuery);
  const [selectedCategory, setSelectedCategory] = useState<CategoryFilter>('All');
  const [selectedSiman, setSelectedSiman] = useState<number | null>(null);
  const [copiedTerm, setCopiedTerm] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-focus search input when opened
  useEffect(() => {
    if (isOpen) {
      if (initialQuery) {
        setSearchTerm(initialQuery);
      }
      const timer = setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
      return () => clearTimeout(timer);
    } else {
      setSearchTerm('');
      setSelectedCategory('All');
      setSelectedSiman(null);
      setCopiedTerm(null);
    }
  }, [isOpen, initialQuery]);

  // Handle escape key
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (searchTerm || selectedSiman !== null) {
          setSearchTerm('');
          setSelectedSiman(null);
        } else {
          onClose();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, searchTerm, selectedSiman, onClose]);

  const handleCopyCitation = (termItem: GlossaryTermItem) => {
    soundManager.playClick();
    const textToCopy = `${termItem.term} (${termItem.hebrew}): ${termItem.sourceCitation.citation} (${termItem.sourceCitation.hebrewCitation}). ${termItem.sourceCitation.rulingSummary} [${termItem.sourceCitation.mishnahBerurahRef || ''}]`;
    navigator.clipboard?.writeText(textToCopy);
    setCopiedTerm(termItem.term);
    setTimeout(() => {
      setCopiedTerm(null);
    }, 2200);
  };

  // Real-time filtering algorithm
  const filteredTerms = useMemo(() => {
    const rawQuery = searchTerm.trim().toLowerCase();
    const strippedQuery = stripNikud(rawQuery);

    return GLOSSARY_TERMS.filter((item: GlossaryTermItem) => {
      // Siman filter check
      if (selectedSiman !== null && item.sourceCitation.siman !== selectedSiman) {
        return false;
      }

      // Category filter check
      if (selectedCategory !== 'All' && item.category !== selectedCategory) {
        return false;
      }

      if (!rawQuery) return true;

      // Match term title (e.g. "Tzurat HaPetach", "Reshut Harabim")
      const termMatch = item.term.toLowerCase().includes(rawQuery);
      
      // Also match without hyphens or spaces
      const normalizedQuery = rawQuery.replace(/[\s-_]/g, '');
      const normalizedTerm = item.term.toLowerCase().replace(/[\s-_]/g, '');
      const normalizedMatch = normalizedTerm.includes(normalizedQuery);

      // Match Hebrew with and without Nikud
      const rawHebrew = item.hebrew.toLowerCase();
      const strippedHebrew = stripNikud(rawHebrew);
      const hebrewMatch = rawHebrew.includes(rawQuery) || strippedHebrew.includes(strippedQuery);

      // Match literal translation
      const literalMatch = item.literal.toLowerCase().includes(rawQuery);

      // Match definition
      const definitionMatch = item.definition.toLowerCase().includes(rawQuery);

      // Match tags
      const tagMatch = item.tags.some(tag => tag.toLowerCase().includes(rawQuery));

      // Match Shulchan Aruch citation & rulings
      const citationMatch = 
        item.sourceCitation.citation.toLowerCase().includes(rawQuery) ||
        item.sourceCitation.hebrewCitation.toLowerCase().includes(rawQuery) ||
        item.sourceCitation.rulingSummary.toLowerCase().includes(rawQuery) ||
        String(item.sourceCitation.siman).includes(rawQuery) ||
        (item.sourceCitation.mishnahBerurahRef?.toLowerCase().includes(rawQuery) ?? false);

      return termMatch || normalizedMatch || hebrewMatch || literalMatch || definitionMatch || tagMatch || citationMatch;
    });
  }, [searchTerm, selectedCategory, selectedSiman]);

  if (!isOpen) return null;

  const handleQuickFilter = (term: string) => {
    soundManager.playClick();
    setSearchTerm(term);
    setSelectedCategory('All');
    inputRef.current?.focus();
  };

  const handleClear = () => {
    soundManager.playClick();
    setSearchTerm('');
    setSelectedCategory('All');
    inputRef.current?.focus();
  };

  const getCategoryColor = (category: GlossaryTermItem['category']) => {
    switch (category) {
      case 'Domains':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
      case 'Architecture':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/30';
      case 'Principles':
        return 'bg-blue-500/10 text-blue-400 border-blue-500/30';
      case 'Measurements':
        return 'bg-purple-500/10 text-purple-400 border-purple-500/30';
      case 'Eruv Types':
        return 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30';
      default:
        return 'bg-slate-700/50 text-slate-300 border-slate-600';
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-4 bg-black/75 backdrop-blur-md animate-fade-in"
      role="dialog"
      aria-modal="true"
      aria-label="Eruv & Shabbat Glossary"
    >
      <div className="bg-slate-900/95 border border-slate-700/80 rounded-3xl p-5 md:p-6 shadow-2xl max-w-3xl w-full max-h-[90vh] flex flex-col text-slate-100 ring-1 ring-white/10">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-gradient-to-br from-amber-500/30 to-amber-600/10 text-amber-400 rounded-2xl border border-amber-500/30 shadow-inner">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-serif font-bold text-white tracking-wide">
                  Eruv & Shabbat Glossary
                </h2>
                <span className="text-xs bg-slate-800 text-slate-400 border border-slate-700 px-2 py-0.5 rounded-full font-mono">
                  {filteredTerms.length} / {GLOSSARY_TERMS.length}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Real-time halachic terminology, principles, and Talmudic definitions
              </p>
            </div>
          </div>
          
          <button
            onClick={() => {
              soundManager.playClick();
              onClose();
            }}
            className="p-1.5 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 border border-transparent hover:border-slate-700 transition-colors cursor-pointer"
            aria-label="Close glossary"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Real-Time Search Bar */}
        <div className="relative mb-3">
          <Search className="w-4 h-4 text-amber-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Search terms, concepts, or Hebrew (e.g. Tzurat HaPetach, Reshut Harabim, Lavud)..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-24 py-2.5 bg-slate-800/90 border border-slate-700/80 rounded-2xl text-xs md:text-sm text-slate-100 placeholder-slate-400 focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20 shadow-inner transition-all"
          />

          {/* Right Controls in Search Bar */}
          <div className="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
            {searchTerm && (
              <button
                onClick={handleClear}
                className="p-1 text-slate-400 hover:text-white bg-slate-700/60 hover:bg-slate-700 rounded-lg text-xs transition-colors"
                title="Clear search (Esc)"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
            <span className="text-[10px] text-slate-400 font-mono hidden sm:inline px-1.5 py-0.5 bg-slate-800/80 rounded border border-slate-700/50">
              Live
            </span>
          </div>
        </div>

        {/* Popular Quick-Filter Chips */}
        <div className="mb-3 flex items-center gap-1.5 overflow-x-auto pb-1 text-xs scrollbar-none">
          <span className="text-[11px] font-semibold text-slate-400 flex items-center gap-1 shrink-0 mr-0.5">
            <Sparkles className="w-3 h-3 text-amber-400" /> Quick:
          </span>
          {QUICK_FILTERS.map((term) => {
            const isSelected = searchTerm.toLowerCase() === term.toLowerCase();
            return (
              <button
                key={term}
                onClick={() => handleQuickFilter(term)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-medium whitespace-nowrap transition-all border ${
                  isSelected
                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/50 shadow-sm'
                    : 'bg-slate-800/60 text-slate-300 border-slate-700/60 hover:bg-slate-800 hover:text-white hover:border-slate-600'
                }`}
              >
                {term}
              </button>
            );
          })}
        </div>

        {/* Shulchan Aruch Orach Chayim Siman Filters */}
        <div className="mb-3 flex items-center gap-1.5 overflow-x-auto pb-1 text-xs scrollbar-none">
          <span className="text-[11px] font-semibold text-slate-400 flex items-center gap-1 shrink-0 mr-0.5">
            <ScrollText className="w-3 h-3 text-sky-400" /> Shulchan Aruch:
          </span>
          <button
            onClick={() => {
              soundManager.playClick();
              setSelectedSiman(null);
            }}
            className={`px-2 py-0.5 rounded-lg text-[10px] font-mono whitespace-nowrap transition-all border cursor-pointer ${
              selectedSiman === null
                ? 'bg-sky-500/20 text-sky-300 border-sky-500/50 shadow-sm font-bold'
                : 'bg-slate-800/60 text-slate-400 border-slate-700/60 hover:text-slate-200'
            }`}
          >
            All Simanim
          </button>
          {SIMAN_FILTERS.map((f) => {
            const isSelected = selectedSiman === f.siman;
            return (
              <button
                key={f.siman}
                onClick={() => {
                  soundManager.playClick();
                  setSelectedSiman(isSelected ? null : f.siman);
                }}
                className={`px-2 py-0.5 rounded-lg text-[10px] font-mono whitespace-nowrap transition-all border cursor-pointer ${
                  isSelected
                    ? 'bg-sky-500/25 text-sky-300 border-sky-400 shadow-sm font-bold'
                    : 'bg-slate-800/60 text-slate-400 border-slate-700/60 hover:text-slate-200'
                }`}
              >
                {f.label}
              </button>
            );
          })}
        </div>

        {/* Category Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-2 mb-3 border-b border-slate-800 text-xs">
          <Filter className="w-3.5 h-3.5 text-slate-400 shrink-0 mr-1" />
          {CATEGORIES.map((cat) => {
            const isActive = selectedCategory === cat.value;
            const count = cat.value === 'All'
              ? GLOSSARY_TERMS.length
              : GLOSSARY_TERMS.filter(t => t.category === cat.value).length;

            return (
              <button
                key={cat.value}
                onClick={() => {
                  soundManager.playClick();
                  setSelectedCategory(cat.value);
                }}
                className={`px-2.5 py-1 rounded-xl text-xs font-medium whitespace-nowrap transition-all flex items-center gap-1.5 border cursor-pointer ${
                  isActive
                    ? 'bg-amber-400 text-slate-950 border-amber-300 font-bold shadow-md shadow-amber-950/40'
                    : 'bg-slate-800/50 text-slate-400 border-transparent hover:text-slate-200 hover:bg-slate-800'
                }`}
              >
                <span>{cat.label}</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${isActive ? 'bg-slate-900/30 text-slate-950 font-bold' : 'bg-slate-700/60 text-slate-400'}`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Search Results Summary Banner when filtering */}
        {(searchTerm || selectedCategory !== 'All' || selectedSiman !== null) && (
          <div className="flex items-center justify-between text-xs px-2 mb-2 text-slate-400">
            <span>
              Found <strong className="text-amber-300">{filteredTerms.length}</strong> {filteredTerms.length === 1 ? 'term' : 'terms'}
              {searchTerm && <span> for &ldquo;<span className="text-white font-medium">{searchTerm}</span>&rdquo;</span>}
              {selectedSiman !== null && <span> in <span className="text-sky-300 font-mono">OC §{selectedSiman}</span></span>}
              {selectedCategory !== 'All' && <span> in <span className="text-white font-medium">{selectedCategory}</span></span>}
            </span>
            <button
              onClick={() => {
                handleClear();
                setSelectedSiman(null);
              }}
              className="text-amber-400 hover:text-amber-300 hover:underline cursor-pointer flex items-center gap-1"
            >
              Reset filters
            </button>
          </div>
        )}

        {/* Terms List (Scrollable) */}
        <div className="overflow-y-auto space-y-3 pr-1.5 flex-1 custom-scrollbar">
          {filteredTerms.map((item, idx) => (
            <div
              key={`${item.term}-${idx}`}
              className="p-4 bg-slate-800/40 border border-slate-700/60 rounded-2xl hover:border-amber-500/40 hover:bg-slate-800/70 transition-all duration-200 group shadow-sm"
            >
              <div className="flex items-baseline justify-between gap-3 mb-1.5">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-bold text-base text-white group-hover:text-amber-300 transition-colors">
                    <HighlightText text={item.term} query={searchTerm} />
                  </span>
                  <span className="text-xs text-amber-300/90 font-mono font-medium">
                    (<HighlightText text={item.literal} query={searchTerm} />)
                  </span>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full border font-medium uppercase tracking-wider ${getCategoryColor(item.category)}`}>
                    {item.category}
                  </span>
                </div>
                <span className="font-serif text-lg text-amber-400 font-bold shrink-0 tracking-wide" dir="rtl">
                  {item.hebrew}
                </span>
              </div>

              <p className="text-xs md:text-sm text-slate-300 leading-relaxed mb-3">
                <HighlightText text={item.definition} query={searchTerm} />
              </p>

              {/* Shulchan Aruch Orach Chayim Source Citation Box */}
              <div className="p-3 bg-slate-900/90 rounded-xl border border-slate-700/70 space-y-1.5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 border-b border-slate-800/80 pb-1.5">
                  <div className="flex items-center gap-1.5">
                    <span className="p-1 rounded bg-amber-500/20 text-amber-400">
                      <ScrollText className="w-3 h-3" />
                    </span>
                    <span className="font-mono text-xs font-bold text-amber-300">
                      <HighlightText text={item.sourceCitation.citation} query={searchTerm} />
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-serif text-slate-300 font-medium" dir="rtl">
                      <HighlightText text={item.sourceCitation.hebrewCitation} query={searchTerm} />
                    </span>
                    <button
                      onClick={() => handleCopyCitation(item)}
                      className="p-1 text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-md transition-colors flex items-center gap-1 text-[10px] font-mono cursor-pointer shrink-0"
                      title="Copy full citation"
                    >
                      {copiedTerm === item.term ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-400" />
                          <span className="text-emerald-400 font-sans">Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3 text-slate-400" />
                          <span className="font-sans">Copy</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                <p className="text-[11px] text-slate-300/95 leading-relaxed">
                  <strong className="text-amber-200/90 font-medium">Ruling: </strong>
                  <HighlightText text={item.sourceCitation.rulingSummary} query={searchTerm} />
                </p>

                {item.sourceCitation.mishnahBerurahRef && (
                  <div className="flex items-center gap-1.5 text-[10px] text-sky-400 font-mono pt-0.5">
                    <BookMarked className="w-3 h-3 shrink-0" />
                    <span>
                      <HighlightText text={item.sourceCitation.mishnahBerurahRef} query={searchTerm} />
                    </span>
                  </div>
                )}
              </div>

              {/* Tags / Search Keywords */}
              {item.tags && item.tags.length > 0 && (
                <div className="mt-2.5 pt-2 border-t border-slate-800/70 flex flex-wrap items-center gap-1.5">
                  <span className="text-[10px] text-slate-400 font-medium">Tags:</span>
                  {item.tags.map((tag) => (
                    <button
                      key={tag}
                      onClick={() => handleQuickFilter(tag)}
                      className="text-[10px] bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-amber-300 px-2 py-0.5 rounded-md border border-slate-700/60 transition-colors cursor-pointer"
                    >
                      #{tag}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}

          {/* Empty State */}
          {filteredTerms.length === 0 && (
            <div className="text-center py-12 px-4 rounded-2xl bg-slate-800/20 border border-slate-800 flex flex-col items-center">
              <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 mb-3">
                <Search className="w-6 h-6 text-slate-400" />
              </div>
              <h3 className="text-base font-bold text-white mb-1">No matching terms found</h3>
              <p className="text-xs text-slate-400 max-w-sm mb-4">
                We couldn't find any terms matching &ldquo;<span className="text-amber-300">{searchTerm}</span>&rdquo;.
                Try searching for specific concepts like <strong className="text-slate-200">Tzurat HaPetach</strong>, <strong className="text-slate-200">Reshut Harabim</strong>, or <strong className="text-slate-200">Lavud</strong>.
              </p>
              <div className="flex flex-wrap items-center justify-center gap-2">
                <button
                  onClick={() => handleQuickFilter('Tzurat HaPetach')}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-amber-300 text-xs rounded-xl border border-slate-700 transition-colors"
                >
                  Search "Tzurat HaPetach"
                </button>
                <button
                  onClick={() => handleQuickFilter('Reshut Harabim')}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-amber-300 text-xs rounded-xl border border-slate-700 transition-colors"
                >
                  Search "Reshut Harabim"
                </button>
                <button
                  onClick={handleClear}
                  className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs rounded-xl transition-colors"
                >
                  Clear All Filters
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer info */}
        <div className="mt-3 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>Indexed across Shulchan Aruch, Rambam, and Talmud Eruvin</span>
          </div>
          <span className="hidden sm:inline text-slate-400">
            Press <kbd className="px-1.5 py-0.5 bg-slate-800 rounded border border-slate-700 font-mono text-[10px]">Esc</kbd> to close
          </span>
        </div>
      </div>
    </div>
  );
};
