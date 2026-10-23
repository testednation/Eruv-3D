/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { 
  Lightbulb, 
  X, 
  Sparkles, 
  ChevronRight, 
  BookOpen, 
  RefreshCw,
  Pause,
  Play
} from 'lucide-react';
import { EruvFact } from '../../data/eruvFacts';
import { soundManager } from '../../utils/audio';

interface DidYouKnowToastProps {
  fact: EruvFact | null;
  isVisible: boolean;
  onDismiss: () => void;
  onNextFact: () => void;
  onOpenStudyHub: () => void;
  durationMs?: number; // default 11000ms
}

export const DidYouKnowToast: React.FC<DidYouKnowToastProps> = ({
  fact,
  isVisible,
  onDismiss,
  onNextFact,
  onOpenStudyHub,
  durationMs = 11000,
}) => {
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(100);
  const startTimeRef = useRef<number>(Date.now());
  const elapsedBeforePauseRef = useRef<number>(0);
  const animationFrameRef = useRef<number | null>(null);

  // Reset or run progress timer whenever fact or visibility changes
  useEffect(() => {
    if (!isVisible || !fact) {
      setProgress(100);
      elapsedBeforePauseRef.current = 0;
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
      return;
    }

    startTimeRef.current = Date.now();
    elapsedBeforePauseRef.current = 0;
    setIsPaused(false);

    const tick = () => {
      const now = Date.now();
      const elapsed = elapsedBeforePauseRef.current + (now - startTimeRef.current);
      const remainingPct = Math.max(0, 100 - (elapsed / durationMs) * 100);
      setProgress(remainingPct);

      if (elapsed >= durationMs) {
        onDismiss();
      } else {
        animationFrameRef.current = requestAnimationFrame(tick);
      }
    };

    animationFrameRef.current = requestAnimationFrame(tick);

    return () => {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    };
  }, [fact, isVisible, durationMs, onDismiss]);

  // Handle pause / resume
  const handleMouseEnter = () => {
    if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    const now = Date.now();
    elapsedBeforePauseRef.current += (now - startTimeRef.current);
    setIsPaused(true);
  };

  const handleMouseLeave = () => {
    if (!isVisible) return;
    startTimeRef.current = Date.now();
    setIsPaused(false);

    const tick = () => {
      const now = Date.now();
      const elapsed = elapsedBeforePauseRef.current + (now - startTimeRef.current);
      const remainingPct = Math.max(0, 100 - (elapsed / durationMs) * 100);
      setProgress(remainingPct);

      if (elapsed >= durationMs) {
        onDismiss();
      } else {
        animationFrameRef.current = requestAnimationFrame(tick);
      }
    };

    animationFrameRef.current = requestAnimationFrame(tick);
  };

  if (!isVisible || !fact) return null;

  return (
    <div 
      className="fixed top-16 sm:top-20 left-3 right-3 sm:left-auto sm:right-5 z-30 pointer-events-auto max-w-sm sm:max-w-md w-auto transition-all duration-300 animate-fade-in"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      role="complementary"
      aria-label="Halachic Trivia: Did You Know?"
    >
      <div className="bg-slate-900/95 border border-amber-500/50 rounded-2xl shadow-2xl backdrop-blur-md overflow-hidden text-slate-100 ring-2 ring-amber-500/20 group hover:border-amber-400 transition-colors">
        {/* Top Header */}
        <div className="px-3.5 pt-3 pb-2 flex items-center justify-between border-b border-slate-800/80 bg-gradient-to-r from-amber-950/40 via-slate-900/40 to-slate-900/40">
          <div className="flex items-center gap-1.5">
            <div className="p-1 rounded-lg bg-amber-500/20 text-amber-400 border border-amber-500/30 shrink-0">
              <Lightbulb className="w-3.5 h-3.5" />
            </div>
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-amber-300">
              Did You Know?
            </span>
            <span className="text-[10px] text-slate-400">·</span>
            <span className="text-[10px] text-slate-300 font-medium truncate max-w-[130px] sm:max-w-[170px]">
              {fact.icon} {fact.tag}
            </span>
          </div>

          <div className="flex items-center gap-1 shrink-0">
            {isPaused && (
              <span className="text-[9px] font-mono text-amber-400/90 bg-amber-950/60 px-1.5 py-0.5 rounded border border-amber-800/50 flex items-center gap-0.5">
                <Pause className="w-2.5 h-2.5" /> Paused
              </span>
            )}
            <button
              onClick={() => {
                soundManager.playClick();
                onDismiss();
              }}
              className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
              aria-label="Dismiss trivia toast"
              title="Dismiss"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-3.5 sm:p-4 space-y-1.5">
          <h4 className="text-xs sm:text-sm font-serif font-bold text-white leading-snug">
            {fact.title}
          </h4>
          <p className="text-xs text-slate-300 leading-relaxed line-clamp-3 group-hover:line-clamp-none transition-all">
            {fact.fact}
          </p>

          <div className="text-[10px] text-slate-400 font-mono pt-0.5 truncate">
            Source: <span className="text-sky-300">{fact.source}</span>
          </div>
        </div>

        {/* Footer Quick Controls */}
        <div className="px-3 pb-2.5 pt-1 flex items-center justify-between gap-2 border-t border-slate-800/60 bg-slate-950/40">
          <button
            onClick={() => {
              soundManager.playClick();
              onNextFact();
            }}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-200 hover:text-white text-[11px] font-semibold transition-colors cursor-pointer border border-slate-700/60 active:scale-95"
            title="Show another random halacha fact"
          >
            <RefreshCw className="w-3 h-3 text-amber-400" />
            <span>Next Fact</span>
          </button>

          <button
            onClick={() => {
              soundManager.playClick();
              onOpenStudyHub();
            }}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 hover:text-amber-200 text-[11px] font-semibold transition-colors cursor-pointer border border-amber-500/30 active:scale-95"
            title="Open Study Hub to read all historical & halachic trivia"
          >
            <BookOpen className="w-3 h-3" />
            <span>Study Hub</span>
            <ChevronRight className="w-3 h-3" />
          </button>
        </div>

        {/* Smooth Shrinking Progress Bar (Pauses on Hover) */}
        <div className="w-full bg-slate-800/50 h-1 overflow-hidden">
          <div 
            className={`h-full transition-all ease-linear ${
              isPaused ? 'bg-amber-400' : 'bg-gradient-to-r from-amber-500 to-amber-300'
            }`}
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </div>
  );
};
