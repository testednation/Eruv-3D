import React from 'react';
import { Award, Sparkles, X, ChevronRight } from 'lucide-react';
import { Achievement } from '../../types/achievements';

interface AchievementToastProps {
  achievement: Achievement | null;
  onClose: () => void;
  onOpenOverlay: () => void;
}

export const AchievementToast: React.FC<AchievementToastProps> = ({
  achievement,
  onClose,
  onOpenOverlay,
}) => {
  if (!achievement) return null;

  const rarityColors: Record<string, string> = {
    bronze: 'from-amber-700/80 to-amber-900/80 border-amber-600/50 text-amber-200',
    silver: 'from-slate-400/80 to-slate-600/80 border-slate-400/50 text-slate-100',
    gold: 'from-amber-400/90 to-yellow-600/90 border-yellow-400/60 text-slate-950 font-bold',
    diamond: 'from-cyan-400/90 to-blue-600/90 border-cyan-400/60 text-slate-950 font-bold',
  };

  return (
    <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 pointer-events-auto animate-bounce-subtle max-w-md w-full px-4">
      <div className="bg-slate-900/95 border-2 border-amber-400/80 rounded-2xl p-4 shadow-2xl backdrop-blur-md flex items-center justify-between gap-3 text-slate-100 ring-4 ring-amber-500/20">
        <div className="flex items-center gap-3">
          <div className="text-3xl p-2 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center shrink-0">
            {achievement.icon}
          </div>
          <div>
            <div className="flex items-center gap-1.5 mb-0.5">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1">
                <Sparkles className="w-3 h-3" />
                Badge Unlocked!
              </span>
              <span className={`text-[9px] uppercase px-1.5 py-0.2 rounded-full font-bold ${rarityColors[achievement.rarity]}`}>
                {achievement.rarity}
              </span>
              <span className="text-[10px] font-mono font-bold text-amber-300">
                +{achievement.points} pts
              </span>
            </div>
            <h4 className="text-sm font-bold text-white font-serif">
              {achievement.title}
            </h4>
            <div className="text-[11px] text-slate-300 truncate max-w-[220px]">
              {achievement.description}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1 shrink-0">
          <button
            onClick={() => {
              onClose();
              onOpenOverlay();
            }}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition-all shadow-md cursor-pointer"
          >
            <span>View</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-white rounded-md hover:bg-slate-800 transition-colors cursor-pointer"
            aria-label="Close notification"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
