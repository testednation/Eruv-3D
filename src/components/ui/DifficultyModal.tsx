/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { 
  X, 
  ShieldCheck, 
  ShieldAlert, 
  Clock, 
  CheckCircle2, 
  Zap, 
  Award, 
  ScrollText, 
  Flame,
  ChevronRight,
  Sparkles
} from 'lucide-react';
import { GameDifficulty, DifficultyConfig } from '../../types/eruv';
import { DIFFICULTY_CONFIGS } from '../../data/eruvData';
import { soundManager } from '../../utils/audio';
import { hapticsManager } from '../../utils/haptics';

interface DifficultyModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentDifficulty: GameDifficulty;
  onSelectDifficulty: (difficulty: GameDifficulty) => void;
  fixedTasksCount: number;
}

export const DifficultyModal: React.FC<DifficultyModalProps> = ({
  isOpen,
  onClose,
  currentDifficulty,
  onSelectDifficulty,
  fixedTasksCount,
}) => {
  if (!isOpen) return null;

  const difficulties: GameDifficulty[] = ['easy', 'standard', 'expert'];

  const handleSelect = (diff: GameDifficulty) => {
    soundManager.playClick();
    hapticsManager.medium();
    onSelectDifficulty(diff);
    onClose();
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-md animate-fade-in pointer-events-auto"
      onClick={onClose}
    >
      <div 
        className="bg-slate-900 border border-slate-700/80 rounded-3xl max-w-xl w-full shadow-2xl overflow-hidden flex flex-col max-h-[90vh] text-slate-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 bg-slate-950/60 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-serif font-bold text-white flex items-center gap-2">
                <span>Select Game Difficulty</span>
                <span className="text-[10px] font-mono font-normal uppercase px-2 py-0.5 rounded-full bg-slate-800 text-slate-300">
                  Challenge Level
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Adjusts the number of perimeter breaches and Friday sunset urgency.
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              soundManager.playClick();
              onClose();
            }}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            aria-label="Close difficulty modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-3.5">
          {fixedTasksCount > 0 && (
            <div className="p-3 bg-amber-950/40 border border-amber-600/40 rounded-xl text-xs text-amber-300 flex items-center gap-2">
              <Flame className="w-4 h-4 text-amber-400 shrink-0" />
              <span>
                Note: Switching difficulty starts a fresh inspection run with the selected task set.
              </span>
            </div>
          )}

          <div className="space-y-3">
            {difficulties.map((diffKey) => {
              const cfg = DIFFICULTY_CONFIGS[diffKey];
              const isSelected = currentDifficulty === diffKey;

              const borderHighlight = isSelected
                ? diffKey === 'easy'
                  ? 'border-emerald-500 ring-2 ring-emerald-500/30 bg-emerald-950/25'
                  : diffKey === 'standard'
                  ? 'border-amber-500 ring-2 ring-amber-500/30 bg-amber-950/25'
                  : 'border-purple-500 ring-2 ring-purple-500/30 bg-purple-950/25'
                : 'border-slate-800 bg-slate-800/40 hover:bg-slate-800/70 hover:border-slate-700';

              return (
                <div
                  key={diffKey}
                  onClick={() => handleSelect(diffKey)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer relative overflow-hidden group ${borderHighlight}`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <span className={`text-sm font-bold font-serif ${cfg.accentClass}`}>
                          {cfg.name}
                        </span>
                        <span className="text-xs text-slate-400 font-serif" dir="rtl">
                          {cfg.hebrewName}
                        </span>
                        <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-900 border border-slate-700 text-slate-300">
                          {cfg.badge}
                        </span>
                      </div>

                      <p className="text-xs text-slate-300 leading-relaxed mb-2.5">
                        {cfg.description}
                      </p>

                      <div className="flex flex-wrap items-center gap-3 text-[11px] font-mono text-slate-400">
                        <span className="flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5 text-sky-400" />
                          <span>{cfg.taskCount} Inspection Tasks</span>
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-amber-400" />
                          <span>{cfg.initialMinutes}m Sunset Timer</span>
                        </span>
                      </div>
                    </div>

                    <div className="shrink-0 flex items-center">
                      {isSelected ? (
                        <div className={`px-3 py-1.5 rounded-xl text-xs font-bold font-mono uppercase tracking-wider flex items-center gap-1 ${
                          diffKey === 'easy' 
                            ? 'bg-emerald-500 text-slate-950' 
                            : diffKey === 'standard'
                            ? 'bg-amber-500 text-slate-950'
                            : 'bg-purple-500 text-white'
                        }`}>
                          <span>Active</span>
                        </div>
                      ) : (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSelect(diffKey);
                          }}
                          className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors border border-slate-700/60"
                        >
                          Select
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/40 flex items-center justify-between text-xs text-slate-400 shrink-0">
          <span>Choose at any point during exploration</span>
          <button
            onClick={() => {
              soundManager.playClick();
              onClose();
            }}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold transition-colors cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
