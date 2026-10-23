/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Flame, 
  CheckCircle2, 
  Clock, 
  Sparkles, 
  Award, 
  ChevronRight, 
  ChevronDown, 
  ChevronUp, 
  Calendar, 
  BookOpen, 
  Zap,
  Info,
  Trophy,
  Share2
} from 'lucide-react';
import { useStudyStreak, StreakMilestone } from '../../hooks/useStudyStreak';
import { useAchievements } from '../../hooks/useAchievements';
import { soundManager } from '../../utils/audio';
import { hapticsManager } from '../../utils/haptics';

interface StudyStreakTrackerProps {
  variant?: 'hero' | 'compact' | 'banner';
  onStudyActionTriggered?: () => void;
}

export const StudyStreakTracker: React.FC<StudyStreakTrackerProps> = ({
  variant = 'hero',
  onStudyActionTriggered,
}) => {
  const {
    currentStreak,
    longestStreak,
    totalDays,
    studiedToday,
    weekProgress,
    milestones,
    nextMilestone,
    todayQuote,
    streakTier,
    recordStudyAction,
  } = useStudyStreak();

  const { unlockAchievement, updateProgress } = useAchievements();
  const [showMilestonesModal, setShowMilestonesModal] = useState<boolean>(false);
  const [showQuoteDetail, setShowQuoteDetail] = useState<boolean>(false);

  // Sync streak progress with achievements
  React.useEffect(() => {
    if (currentStreak > 0) {
      updateProgress('streak-scholar', Math.min(3, currentStreak));
      if (currentStreak >= 3) {
        unlockAchievement('streak-scholar');
      }
    }
  }, [currentStreak, updateProgress, unlockAchievement]);

  const handleCheckIn = () => {
    soundManager.playClick();
    hapticsManager.success();
    recordStudyAction('Checked in Daily Eruv Learning');
    unlockAchievement('daily-learner');
    const nextStreak = studiedToday ? currentStreak : currentStreak + 1;
    updateProgress('streak-scholar', Math.min(3, nextStreak));
    if (nextStreak >= 3) {
      unlockAchievement('streak-scholar');
    }
    if (onStudyActionTriggered) {
      onStudyActionTriggered();
    }
  };

  // Compact variant: for sticky headers or quick status in modals
  if (variant === 'compact') {
    return (
      <div className="flex items-center justify-between px-3 py-2 bg-slate-800/90 border border-slate-700/80 rounded-2xl shadow-md">
        <div className="flex items-center gap-2">
          <div className={`p-1.5 rounded-xl ${streakTier.bg} border ${streakTier.border} relative flex items-center justify-center`}>
            <Flame className={`w-4 h-4 ${streakTier.color} ${currentStreak > 0 ? 'animate-pulse' : 'text-slate-400'}`} />
            {studiedToday && (
              <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-emerald-400 ring-2 ring-slate-900" />
            )}
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold text-white tracking-wide">
                {currentStreak === 0 ? 'Start Streak' : `${currentStreak} Day Streak`}
              </span>
              <span className="text-[10px] font-serif text-amber-300 font-medium">
                רֶצֶף לִמּוּד
              </span>
            </div>
            <p className="text-[10px] text-slate-400">
              {studiedToday ? 'Studied today! Mitzvah done' : 'Study a halacha to keep streak alive'}
            </p>
          </div>
        </div>

        {!studiedToday ? (
          <button
            onClick={handleCheckIn}
            className="flex items-center gap-1 px-2.5 py-1 text-xs font-bold text-slate-950 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 rounded-xl shadow transition-all cursor-pointer hover:scale-105 active:scale-95"
          >
            <Zap className="w-3 h-3 fill-slate-950" />
            <span>Check In</span>
          </button>
        ) : (
          <span className="flex items-center gap-1 text-[11px] font-semibold text-emerald-400 bg-emerald-950/40 border border-emerald-500/30 px-2 py-0.5 rounded-lg">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Active</span>
          </span>
        )}
      </div>
    );
  }

  // Banner variant: single-line sleek bar
  if (variant === 'banner') {
    return (
      <div className="w-full bg-gradient-to-r from-amber-950/40 via-slate-900 to-amber-950/30 border border-amber-500/30 rounded-2xl p-2.5 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
            <Flame className="w-4 h-4 animate-bounce" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-amber-200">
                {currentStreak > 0 ? `${currentStreak}-Day Eruv Study Streak` : 'Start Your Daily Study Habit'}
              </span>
              <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300">
                {streakTier.name}
              </span>
            </div>
            <div className="text-[10px] text-slate-400">
              {studiedToday 
                ? 'Great job! Your streak is secured for today.' 
                : 'Learn today\'s law or click to mark today completed!'}
            </div>
          </div>
        </div>

        {!studiedToday && (
          <button
            onClick={handleCheckIn}
            className="px-2.5 py-1 text-[11px] font-bold text-slate-950 bg-amber-400 hover:bg-amber-300 rounded-xl shadow cursor-pointer transition-transform active:scale-95"
          >
            Check In
          </button>
        )}
      </div>
    );
  }

  // Hero variant: Comprehensive positive reinforcement card
  const progressPercent = nextMilestone && nextMilestone.days > 0
    ? Math.min(100, Math.round((currentStreak / nextMilestone.days) * 100))
    : 100;

  return (
    <div className="w-full bg-slate-900/90 border border-amber-500/40 rounded-3xl p-4 sm:p-5 shadow-xl text-slate-100 backdrop-blur-md relative overflow-hidden">
      {/* Decorative background glow */}
      <div className="absolute top-0 right-0 w-44 h-44 bg-amber-500/10 rounded-full blur-3xl pointer-events-none -mr-16 -mt-16" />

      {/* Main Header / Flame Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3.5 border-b border-slate-800 relative z-10">
        <div className="flex items-center gap-3">
          {/* Flame Icon Container with animated ring */}
          <div className="relative">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${streakTier.bg} border-2 ${streakTier.border} shadow-lg ${streakTier.glow}`}>
              <Flame className={`w-7 h-7 ${streakTier.color} ${currentStreak > 0 ? 'animate-pulse' : 'text-slate-400'}`} />
            </div>
            {studiedToday && (
              <div 
                className="absolute -bottom-1 -right-1 bg-emerald-500 text-slate-950 p-0.5 rounded-full border-2 border-slate-900"
                title="Studied today!"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
              </div>
            )}
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xl sm:text-2xl font-serif font-extrabold text-white tracking-tight">
                {currentStreak === 0 ? '0' : currentStreak}
                <span className="text-sm sm:text-base font-normal text-slate-300 ml-1.5">
                  {currentStreak === 1 ? 'Day Streak' : 'Days Streak'}
                </span>
              </h3>
              <span className="text-xs font-serif font-bold text-amber-400/90 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
                רֶצֶף לִמּוּד
              </span>
            </div>

            <div className="flex items-center gap-2 mt-0.5 text-xs text-slate-400">
              <span>Best: <strong className="text-slate-200">{longestStreak} days</strong></span>
              <span>•</span>
              <span>Total days: <strong className="text-slate-200">{totalDays}</strong></span>
              <span>•</span>
              <span className="text-amber-300 font-medium">{streakTier.name} Tier</span>
            </div>
          </div>
        </div>

        {/* Action Button: Check In / Completed Today */}
        <div className="flex items-center gap-2 self-start sm:self-center">
          {!studiedToday ? (
            <button
              onClick={handleCheckIn}
              className="flex items-center gap-2 px-4 py-2 rounded-2xl font-bold text-xs sm:text-sm text-slate-950 bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500 hover:from-amber-300 hover:to-amber-400 shadow-lg shadow-amber-500/20 transition-all cursor-pointer hover:scale-105 active:scale-95"
            >
              <Zap className="w-4 h-4 fill-slate-950" />
              <span>Mark Today Completed</span>
            </button>
          ) : (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-2xl bg-emerald-950/50 border border-emerald-500/40 text-emerald-300 text-xs font-semibold">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Studied Today! Streak Locked</span>
            </div>
          )}

          <button
            onClick={() => {
              soundManager.playClick();
              setShowMilestonesModal(!showMilestonesModal);
            }}
            className="p-2 rounded-xl text-slate-400 hover:text-amber-300 bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700/60 transition-colors cursor-pointer"
            title="View Streak Milestones"
            aria-label="View Milestones"
          >
            <Trophy className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 7-Day Weekly Mini Calendar */}
      <div className="mt-3.5 relative z-10">
        <div className="flex items-center justify-between text-xs text-slate-400 mb-1.5">
          <span className="font-medium flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-amber-400" />
            <span>This Week's Commitment</span>
          </span>
          <span className="text-[11px] font-mono text-slate-400">
            {weekProgress.filter(d => d.isCompleted).length} / 7 Days Active
          </span>
        </div>

        <div className="grid grid-cols-7 gap-1 sm:gap-2">
          {weekProgress.map((day) => {
            const isCompleted = day.isCompleted;
            const isToday = day.isToday;

            return (
              <div
                key={day.dateStr}
                className={`flex flex-col items-center justify-center py-2 px-1 rounded-xl border text-center transition-all ${
                  isCompleted
                    ? 'bg-amber-500/20 border-amber-500/40 text-amber-200 shadow-sm'
                    : isToday
                    ? 'bg-slate-800/80 border-amber-400/80 ring-2 ring-amber-400/30 text-white'
                    : day.isFuture
                    ? 'bg-slate-900/40 border-slate-800/50 text-slate-600'
                    : 'bg-slate-900/60 border-slate-800 text-slate-500'
                }`}
              >
                <span className="text-[10px] font-semibold tracking-tight uppercase">
                  {day.dayName === 'Shabbat' ? 'Shab' : day.dayName}
                </span>

                <div className="mt-1 flex items-center justify-center">
                  {isCompleted ? (
                    <Flame className="w-3.5 h-3.5 text-amber-400 animate-pulse fill-amber-400" />
                  ) : isToday ? (
                    <Clock className="w-3.5 h-3.5 text-amber-300 animate-spin" />
                  ) : (
                    <div className="w-1.5 h-1.5 rounded-full bg-slate-700" />
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Milestone Progress Bar */}
      {nextMilestone && (
        <div className="mt-3.5 pt-3 border-t border-slate-800/80 relative z-10">
          <div className="flex items-center justify-between text-xs mb-1.5">
            <div className="flex items-center gap-1.5 text-slate-300">
              <span className="text-base">{nextMilestone.icon}</span>
              <span>Next Goal: <strong>{nextMilestone.title}</strong></span>
              <span className="text-[10px] text-amber-300 font-serif">({nextMilestone.hebrewTitle})</span>
            </div>
            <span className="text-[11px] font-mono font-semibold text-amber-400">
              {currentStreak} / {nextMilestone.days} Days
            </span>
          </div>

          <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden border border-slate-700/60">
            <div 
              className="h-full bg-gradient-to-r from-amber-500 via-amber-400 to-emerald-400 rounded-full transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      )}

      {/* Positive Reinforcement Torah Quote Box */}
      <div className="mt-3.5 p-3 rounded-2xl bg-amber-950/20 border border-amber-500/20 relative z-10">
        <div className="flex items-start gap-2.5">
          <div className="p-1 rounded-lg bg-amber-500/20 text-amber-400 shrink-0 mt-0.5">
            <Sparkles className="w-3.5 h-3.5" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-serif font-semibold text-amber-200 leading-snug">
              "{todayQuote.quote}"
            </p>
            <p className="text-[11px] text-slate-300 mt-1 italic leading-relaxed">
              {todayQuote.translation}
            </p>
            <div className="text-[10px] text-amber-400/80 font-mono mt-1 font-medium">
              — {todayQuote.source}
            </div>
          </div>
        </div>
      </div>

      {/* Milestones Expansion Modal */}
      {showMilestonesModal && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in"
          onClick={() => setShowMilestonesModal(false)}
        >
          <div 
            className="bg-slate-900 border border-slate-700 rounded-3xl max-w-md w-full p-5 shadow-2xl space-y-4 max-h-[85vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Trophy className="w-5 h-5 text-amber-400" />
                <h4 className="font-serif font-bold text-base text-white">Daily Study Milestones</h4>
              </div>
              <button
                onClick={() => setShowMilestonesModal(false)}
                className="text-xs px-2.5 py-1 rounded-lg bg-slate-800 text-slate-300 hover:text-white"
              >
                Close
              </button>
            </div>

            <p className="text-xs text-slate-400">
              Returning daily to inspect and study eruv concepts builds permanent mastery. Unlock all five Torah study ranks:
            </p>

            <div className="space-y-2.5">
              {milestones.map((m) => (
                <div
                  key={m.days}
                  className={`p-3 rounded-2xl border flex items-center justify-between transition-all ${
                    m.isUnlocked
                      ? 'bg-amber-950/30 border-amber-500/50 text-white'
                      : 'bg-slate-800/40 border-slate-700/60 text-slate-400 opacity-75'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{m.icon}</span>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-100">{m.title}</span>
                        <span className="text-[10px] font-serif text-amber-300 font-semibold">{m.hebrewTitle}</span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-0.5">{m.description}</p>
                    </div>
                  </div>

                  <div className="text-right shrink-0 ml-2">
                    <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold ${
                      m.isUnlocked
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                        : 'bg-slate-700 text-slate-400'
                    }`}>
                      {m.isUnlocked ? 'Unlocked ✅' : `${m.days} Days`}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-2 text-center text-xs text-slate-400 border-t border-slate-800">
              Current Streak: <strong className="text-amber-400">{currentStreak} Days</strong> | Longest: <strong className="text-white">{longestStreak} Days</strong>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
