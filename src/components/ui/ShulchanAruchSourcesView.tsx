/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { SHULCHAN_ARUCH_SOURCES, ShulchanAruchSourceEntry } from '../../data/shulchanAruchSources';
import { soundManager } from '../../utils/audio';
import { 
  ScrollText, 
  Search, 
  BookMarked, 
  Sparkles, 
  Filter, 
  Copy, 
  Check, 
  ArrowRight, 
  Layers,
  Compass,
  ShieldCheck,
  Building2,
  ExternalLink
} from 'lucide-react';

interface ShulchanAruchSourcesViewProps {
  onOpenGlossary?: (term?: string) => void;
}

export const ShulchanAruchSourcesView: React.FC<ShulchanAruchSourcesViewProps> = ({
  onOpenGlossary,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSiman, setSelectedSiman] = useState<number | 'all'>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const simanim = useMemo(() => {
    const list = Array.from(new Set(SHULCHAN_ARUCH_SOURCES.map(s => s.siman)));
    return list.sort((a, b) => a - b);
  }, []);

  const categories = ['all', 'Domains', 'Architecture', 'Principles', 'Eruv Types'];

  const filteredSources = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return SHULCHAN_ARUCH_SOURCES.filter(entry => {
      // Siman filter
      if (selectedSiman !== 'all' && entry.siman !== selectedSiman) {
        return false;
      }

      // Category filter
      if (selectedCategory !== 'all' && entry.category !== selectedCategory) {
        return false;
      }

      if (!query) return true;

      return (
        entry.titleEnglish.toLowerCase().includes(query) ||
        entry.titleHebrew.toLowerCase().includes(query) ||
        entry.citation.toLowerCase().includes(query) ||
        entry.hebrewCitation.toLowerCase().includes(query) ||
        entry.topic.toLowerCase().includes(query) ||
        entry.mechaberRuling.toLowerCase().includes(query) ||
        (entry.remaNote?.toLowerCase().includes(query) ?? false) ||
        entry.mishnahBerurah.toLowerCase().includes(query) ||
        entry.contemporaryApplication.toLowerCase().includes(query) ||
        entry.relatedGlossaryTerms.some(term => term.toLowerCase().includes(query)) ||
        String(entry.siman).includes(query)
      );
    });
  }, [searchQuery, selectedSiman, selectedCategory]);

  const handleCopyCitation = (entry: ShulchanAruchSourceEntry) => {
    soundManager.playClick();
    const textToCopy = `${entry.citation} (${entry.hebrewCitation}) - ${entry.titleEnglish}: ${entry.mechaberRuling} [Mishnah Berurah: ${entry.mishnahBerurah}]`;
    navigator.clipboard?.writeText(textToCopy);
    setCopiedId(entry.id);
    setTimeout(() => {
      setCopiedId(null);
    }, 2200);
  };

  return (
    <div className="space-y-4">
      {/* Introduction banner */}
      <div className="p-3.5 bg-gradient-to-r from-amber-950/40 to-slate-900 border border-amber-500/30 rounded-2xl">
        <div className="flex items-center gap-2 mb-1">
          <ScrollText className="w-4 h-4 text-amber-400" />
          <h3 className="font-serif font-bold text-sm text-amber-200">
            Shulchan Aruch Orach Chayim Codex (Hilchot Shabbat & Eruvin)
          </h3>
        </div>
        <p className="text-xs text-slate-300 leading-relaxed">
          The codified standard of Jewish law authored by Rabbi Yosef Karo (the Mechaber, 1488–1575) with glosses by Rabbi Moshe Isserles (the Rema), expounded by the Chofetz Chaim in the Mishnah Berurah.
        </p>
      </div>

      {/* Search Input */}
      <div className="relative">
        <Search className="w-4 h-4 text-amber-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
        <input
          type="text"
          placeholder="Search by Siman (§362, §345), Hebrew terms, or halachic rulings..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 bg-slate-800/90 border border-slate-700/80 rounded-2xl text-xs sm:text-sm text-slate-100 placeholder-slate-400 focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20 shadow-inner transition-all"
        />
      </div>

      {/* Siman Filter Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs scrollbar-none">
        <span className="text-[11px] font-semibold text-slate-400 flex items-center gap-1 shrink-0 mr-1">
          <BookMarked className="w-3.5 h-3.5 text-sky-400" /> Chapter (Siman):
        </span>
        <button
          onClick={() => {
            soundManager.playClick();
            setSelectedSiman('all');
          }}
          className={`px-2.5 py-1 rounded-xl text-xs font-mono transition-all border cursor-pointer ${
            selectedSiman === 'all'
              ? 'bg-amber-500 text-slate-950 border-amber-400 font-bold shadow-sm'
              : 'bg-slate-800/60 text-slate-400 border-slate-700/60 hover:text-slate-200 hover:bg-slate-800'
          }`}
        >
          All Simanim
        </button>
        {simanim.map(sim => (
          <button
            key={sim}
            onClick={() => {
              soundManager.playClick();
              setSelectedSiman(selectedSiman === sim ? 'all' : sim);
            }}
            className={`px-2.5 py-1 rounded-xl text-xs font-mono transition-all border cursor-pointer ${
              selectedSiman === sim
                ? 'bg-amber-500 text-slate-950 border-amber-400 font-bold shadow-sm'
                : 'bg-slate-800/60 text-slate-400 border-slate-700/60 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            §{sim}
          </button>
        ))}
      </div>

      {/* Sources Feed */}
      <div className="space-y-3.5">
        {filteredSources.map((entry) => (
          <div
            key={entry.id}
            className="p-4 bg-slate-900/95 border border-slate-700/80 rounded-2xl hover:border-amber-500/50 transition-all shadow-md space-y-3"
          >
            {/* Top Citation Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 border-b border-slate-800 pb-2">
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-lg bg-amber-500/20 text-amber-400 border border-amber-500/30">
                  <ScrollText className="w-4 h-4" />
                </span>
                <div>
                  <div className="font-mono text-xs sm:text-sm font-bold text-amber-300">
                    {entry.citation}
                  </div>
                  <div className="text-[11px] text-slate-400">
                    {entry.titleEnglish}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 self-start sm:self-center">
                <span className="text-xs font-serif text-slate-300 font-bold" dir="rtl">
                  {entry.hebrewCitation}
                </span>
                <button
                  onClick={() => handleCopyCitation(entry)}
                  className="p-1.5 text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors flex items-center gap-1 text-[11px] font-mono cursor-pointer shrink-0"
                  title="Copy citation and legal summary"
                >
                  {copiedId === entry.id ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-emerald-400">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 text-slate-400" />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Core Mechaber Ruling */}
            <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/60 space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1">
                <span>📜 Mechaber Ruling (Rabbi Yosef Karo):</span>
              </span>
              <p className="text-xs text-slate-200 leading-relaxed">
                {entry.mechaberRuling}
              </p>
            </div>

            {/* Rema Gloss (if present) */}
            {entry.remaNote && (
              <div className="p-3 rounded-xl bg-purple-950/20 border border-purple-500/30 space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-purple-300 flex items-center gap-1">
                  <span>🖋️ Rema Gloss (Ashkenazic Practice):</span>
                </span>
                <p className="text-xs text-purple-200/90 leading-relaxed">
                  {entry.remaNote}
                </p>
              </div>
            )}

            {/* Mishnah Berurah Commentary */}
            <div className="flex items-start gap-2 text-xs text-sky-300/90 font-mono bg-sky-950/20 border border-sky-500/20 p-2.5 rounded-xl">
              <BookMarked className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-sky-300 block mb-0.5">Mishnah Berurah Reference:</span>
                <span className="text-[11px] text-sky-200/80 leading-relaxed">{entry.mishnahBerurah}</span>
              </div>
            </div>

            {/* Contemporary Practical Application */}
            <div className="text-xs text-slate-300 leading-relaxed p-2.5 bg-emerald-950/20 border border-emerald-500/20 rounded-xl">
              <span className="font-bold text-emerald-400 block mb-0.5 text-[10px] uppercase tracking-wider">
                🏙️ Modern Urban Eruv Application:
              </span>
              <span className="text-[11px] text-emerald-200/90 leading-relaxed">
                {entry.contemporaryApplication}
              </span>
            </div>

            {/* Related Glossary Terms Links */}
            {entry.relatedGlossaryTerms && entry.relatedGlossaryTerms.length > 0 && (
              <div className="pt-2 border-t border-slate-800 flex flex-wrap items-center gap-1.5 text-xs">
                <span className="text-[10px] text-slate-400 font-medium">Related Glossary Terms:</span>
                {entry.relatedGlossaryTerms.map(term => (
                  <button
                    key={term}
                    onClick={() => {
                      soundManager.playClick();
                      if (onOpenGlossary) onOpenGlossary(term);
                    }}
                    className="text-[10px] px-2 py-0.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-sky-300 hover:text-sky-200 border border-slate-700/60 transition-colors flex items-center gap-1 cursor-pointer"
                  >
                    <span>{term}</span>
                    <ArrowRight className="w-2.5 h-2.5 opacity-60" />
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}

        {filteredSources.length === 0 && (
          <div className="text-center py-8 px-4 rounded-2xl bg-slate-800/30 border border-slate-800">
            <ScrollText className="w-8 h-8 text-slate-500 mx-auto mb-2" />
            <h4 className="text-sm font-bold text-white mb-1">No Shulchan Aruch sources match your filter</h4>
            <p className="text-xs text-slate-400 mb-3">Try searching for other Simanim like §345, §362, or §366.</p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedSiman('all');
                setSelectedCategory('all');
              }}
              className="px-3 py-1.5 bg-amber-500 text-slate-950 text-xs font-bold rounded-xl"
            >
              Reset Filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
