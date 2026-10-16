import React, { useState } from 'react';
import { 
  Award, 
  Sparkles, 
  CheckCircle2, 
  Lock, 
  X, 
  RotateCcw, 
  ShieldCheck, 
  Star,
  Trophy,
  Filter
} from 'lucide-react';
import { Achievement } from '../../types/achievements';
import { soundManager } from '../../utils/audio';

interface AchievementsOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  achievements: Achievement[];
  unlockedCount: number;
  totalCount: number;
  totalPoints: number;
  maxPoints: number;
  onResetAchievements: () => void;
}

export const AchievementsOverlay: React.FC<AchievementsOverlayProps> = ({
  isOpen,
  onClose,
  achievements,
  unlockedCount,
  totalCount,
  totalPoints,
  maxPoints,
  onResetAchievements,
}) => {
  const [filter, setFilter] = useState<'all' | 'unlocked' | 'locked'>('all');
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  if (!isOpen) return null;

  const percentComplete = Math.round((unlockedCount / totalCount) * 100);

  const filteredAchievements = achievements.filter((a) => {
    if (filter === 'unlocked') return a.unlocked;
    if (filter === 'locked') return !a.unlocked;
    return true;
  });

  const rarityBadgeStyles: Record<string, string> = {
    bronze: 'bg-amber-900/40 text-amber-300 border-amber-700/60',
    silver: 'bg-slate-700/40 text-slate-200 border-slate-500/60',
    gold: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/50',
    diamond: 'bg-cyan-500/20 text-cyan-300 border-cyan-400/50',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="bg-slate-900 border border-slate-700 rounded-3xl p-6 shadow-2xl max-w-3xl w-full max-h-[88vh] flex flex-col text-slate-100 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-gradient-to-br from-amber-500/20 to-yellow-600/30 text-amber-400 rounded-2xl border border-amber-500/40">
              <Trophy className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl sm:text-2xl font-serif font-bold text-white">Eruv Master Achievements</h2>
                <span className="text-xs font-serif text-amber-300 font-semibold" dir="rtl">
                  עִטּוּרֵי כָּבוֹד
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Track your halachic learning, 3D repairs, and mastery across all app features
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              soundManager.playClick();
              onClose();
            }}
            className="p-1.5 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Global Progress Bar Card */}
        <div className="mb-5 p-4 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-800/80 to-slate-900 border border-slate-700/80 shadow-md">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
            <div>
              <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400">
                Overall Progress
              </div>
              <div className="text-base font-bold text-white flex items-center gap-2 mt-0.5">
                <span>{unlockedCount} of {totalCount} Badges Unlocked</span>
                <span className="text-xs text-amber-400 font-mono">({percentComplete}%)</span>
              </div>
            </div>

            <div className="text-right">
              <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400">
                Total Score
              </div>
              <div className="text-base font-mono font-extrabold text-amber-300">
                {totalPoints} / {maxPoints} pts
              </div>
            </div>
          </div>

          <div className="w-full bg-slate-800 rounded-full h-2.5 overflow-hidden border border-slate-700/80">
            <div 
              className="h-full bg-gradient-to-r from-amber-500 via-yellow-400 to-emerald-400 transition-all duration-700"
              style={{ width: `${percentComplete}%` }}
            />
          </div>
        </div>

        {/* Filter Tabs & Reset */}
        <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
          <div className="flex items-center gap-1 bg-slate-800/80 p-1 rounded-xl border border-slate-700/60">
            <button
              onClick={() => {
                soundManager.playClick();
                setFilter('all');
              }}
              className={`px-3 py-1 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                filter === 'all'
                  ? 'bg-amber-500 text-slate-950 font-bold shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
              }`}
            >
              All ({totalCount})
            </button>
            <button
              onClick={() => {
                soundManager.playClick();
                setFilter('unlocked');
              }}
              className={`px-3 py-1 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                filter === 'unlocked'
                  ? 'bg-emerald-500 text-slate-950 font-bold shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
              }`}
            >
              Unlocked ({unlockedCount})
            </button>
            <button
              onClick={() => {
                soundManager.playClick();
                setFilter('locked');
              }}
              className={`px-3 py-1 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                filter === 'locked'
                  ? 'bg-sky-500 text-slate-950 font-bold shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
              }`}
            >
              In Progress ({totalCount - unlockedCount})
            </button>
          </div>

          <button
            onClick={() => setShowResetConfirm(!showResetConfirm)}
            className="text-[11px] text-slate-400 hover:text-rose-400 transition-colors cursor-pointer flex items-center gap-1 px-2 py-1"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Reset Progress</span>
          </button>
        </div>

        {/* Reset Confirmation Dialog */}
        {showResetConfirm && (
          <div className="mb-4 p-3 bg-rose-950/40 border border-rose-500/40 rounded-xl text-xs text-rose-200 flex items-center justify-between gap-3 animate-fade-in">
            <span>Are you sure you want to reset all earned achievements and badges?</span>
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => {
                  onResetAchievements();
                  setShowResetConfirm(false);
                }}
                className="px-2.5 py-1 bg-rose-600 hover:bg-rose-500 text-white rounded-lg font-bold cursor-pointer"
              >
                Confirm Reset
              </button>
              <button
                onClick={() => setShowResetConfirm(false)}
                className="px-2 py-1 text-slate-300 hover:text-white cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Badges Grid */}
        <div className="overflow-y-auto space-y-3 pr-1 flex-1">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {filteredAchievements.map((badge) => {
              const isDone = badge.unlocked;
              return (
                <div
                  key={badge.id}
                  className={`p-4 rounded-2xl border transition-all flex flex-col justify-between ${
                    isDone
                      ? 'bg-slate-800/80 border-amber-500/40 shadow-lg ring-1 ring-amber-500/20'
                      : 'bg-slate-900/60 border-slate-800/80 opacity-75'
                  }`}
                >
                  <div>
                    {/* Top row */}
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2.5">
                        <div className={`text-2xl p-2 rounded-xl flex items-center justify-center shrink-0 ${
                          isDone ? 'bg-amber-500/20 text-amber-300' : 'bg-slate-800 text-slate-500'
                        }`}>
                          {badge.icon}
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <h4 className="font-bold text-white text-sm">
                              {badge.title}
                            </h4>
                          </div>
                          <div className="text-[10px] text-amber-300/80 font-serif" dir="rtl">
                            {badge.hebrewTitle}
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col items-end gap-1">
                        <span className={`text-[9px] font-mono font-bold uppercase px-2 py-0.5 rounded-full border ${rarityBadgeStyles[badge.rarity]}`}>
                          {badge.rarity}
                        </span>
                        <span className="text-[10px] font-mono text-amber-400 font-semibold">
                          +{badge.points} pts
                        </span>
                      </div>
                    </div>

                    <p className="text-xs text-slate-300 leading-relaxed mb-2">
                      {badge.description}
                    </p>
                  </div>

                  {/* Bottom Progress / Unlock Status */}
                  <div className="pt-2 border-t border-slate-800/80">
                    <div className="flex items-center justify-between text-[10px] mb-1">
                      <span className="text-slate-400 font-mono">
                        {isDone ? 'Achievement Unlocked' : `Requirement: ${badge.requirement}`}
                      </span>
                      {isDone ? (
                        <span className="text-emerald-400 font-bold flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" /> Unlocked
                        </span>
                      ) : (
                        <span className="text-slate-400 font-mono">
                          {badge.progress} / {badge.maxProgress}
                        </span>
                      )}
                    </div>

                    {!isDone && (
                      <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                        <div 
                          className="h-full bg-sky-500 transition-all duration-300"
                          style={{ width: `${(badge.progress / badge.maxProgress) * 100}%` }}
                        />
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
