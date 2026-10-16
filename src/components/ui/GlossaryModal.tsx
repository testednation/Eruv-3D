import React, { useState } from 'react';
import { GLOSSARY_TERMS } from '../../data/eruvData';
import { soundManager } from '../../utils/audio';
import { BookOpen, Search, X } from 'lucide-react';

interface GlossaryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GlossaryModal: React.FC<GlossaryModalProps> = ({ isOpen, onClose }) => {
  const [searchTerm, setSearchTerm] = useState('');

  if (!isOpen) return null;

  const filteredTerms = GLOSSARY_TERMS.filter(item =>
    item.term.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.literal.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.definition.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
      <div className="bg-slate-900 border border-slate-700 rounded-3xl p-6 shadow-2xl max-w-2xl w-full max-h-[85vh] flex flex-col text-slate-100">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-amber-500/20 text-amber-400 rounded-xl">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-serif font-bold text-white">Eruv & Shabbat Glossary</h2>
              <p className="text-xs text-slate-400">Essential Hebrew & Aramaic halachic terminology</p>
            </div>
          </div>
          <button
            onClick={() => {
              soundManager.playClick();
              onClose();
            }}
            className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search */}
        <div className="relative mb-4">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search terms (e.g. Lechi, Lavud, Reshut, Matzah)..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-800/80 border border-slate-700 rounded-xl text-xs text-slate-100 placeholder-slate-400 focus:outline-none focus:border-amber-500"
          />
        </div>

        {/* Terms List */}
        <div className="overflow-y-auto space-y-3 pr-1 flex-1">
          {filteredTerms.map((item, idx) => (
            <div
              key={idx}
              className="p-3.5 bg-slate-800/40 border border-slate-800 rounded-2xl hover:border-slate-700 transition-colors"
            >
              <div className="flex items-baseline justify-between mb-1">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sm text-white">{item.term}</span>
                  <span className="text-xs text-amber-300 font-mono font-medium">({item.literal})</span>
                </div>
                <span className="font-serif text-base text-amber-400 font-bold" dir="rtl">
                  {item.hebrew}
                </span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">{item.definition}</p>
            </div>
          ))}

          {filteredTerms.length === 0 && (
            <div className="text-center py-8 text-xs text-slate-400">
              No matching terms found. Try searching for "doorpost", "wire", or "domain".
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
