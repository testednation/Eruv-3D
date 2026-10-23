import React, { useState, useEffect } from 'react';
import { 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  Wrench, 
  ShieldCheck, 
  ShieldAlert, 
  Info, 
  Sparkles, 
  ArrowRight,
  BookMarked, 
  HelpCircle, 
  Eye, 
  Search,
  ChevronLeft,
  ChevronRight,
  Menu,
  RotateCcw,
  Compass,
  X,
  ScrollText,
  Lightbulb,
  Zap
} from 'lucide-react';
import { EruvInspectionTask, GameDifficulty } from '../../types/eruv';
import { soundManager } from '../../utils/audio';
import { hapticsManager } from '../../utils/haptics';
import { KosherVisualizer } from './KosherVisualizer';

interface InspectorHUDProps {
  tasks: EruvInspectionTask[];
  selectedTask: EruvInspectionTask | null;
  onSelectTask: (task: EruvInspectionTask | null) => void;
  onFixTask: (taskId: string) => void;
  isKosher: boolean;
  minutesToShabbat: number;
  onJumpToTask: (task: EruvInspectionTask) => void;
  onResetGame: () => void;
  onOpenTutorial: () => void;
  onOpenAchievements: () => void;
  onOpenKosherVisualizer?: () => void;
  onOpenGlossary?: (term?: string) => void;
  onOpenStudyHub?: () => void;
  onOpenMobileMenu?: () => void;
  onCameraPreset?: (preset: 'overview' | 'synagogue' | 'tasks' | 'perimeter') => void;
  onTriggerTrivia?: () => void;
  difficulty?: GameDifficulty;
  onOpenDifficulty?: () => void;
  unlockedBadgesCount?: number;
}

export const InspectorHUD: React.FC<InspectorHUDProps> = ({
  tasks,
  selectedTask,
  onSelectTask,
  onFixTask,
  isKosher,
  minutesToShabbat,
  onJumpToTask,
  onResetGame,
  onOpenTutorial,
  onOpenAchievements,
  onOpenKosherVisualizer,
  onOpenGlossary,
  onOpenStudyHub,
  onOpenMobileMenu,
  onCameraPreset,
  onTriggerTrivia,
  difficulty = 'standard',
  onOpenDifficulty,
  unlockedBadgesCount = 0,
}) => {
  const [activeTaskIndex, setActiveTaskIndex] = useState(0);
  const [showTouchHint, setShowTouchHint] = useState(true);

  const fixedCount = tasks.filter(t => t.fixed).length;
  const remainingCount = tasks.length - fixedCount;

  // Auto-hide touch hint after 8 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowTouchHint(false);
    }, 8000);
    return () => clearTimeout(timer);
  }, []);

  // Find next unfixed task
  const nextUnfixedTask = tasks.find(t => !t.fixed);

  const handleNextBreachJump = () => {
    soundManager.playClick();
    hapticsManager.medium();
    if (nextUnfixedTask) {
      onJumpToTask(nextUnfixedTask);
      const idx = tasks.findIndex(t => t.id === nextUnfixedTask.id);
      if (idx !== -1) setActiveTaskIndex(idx);
    } else {
      onCameraPreset?.('overview');
    }
  };

  const handleStepTask = (direction: 'next' | 'prev') => {
    soundManager.playClick();
    hapticsManager.tap();
    let newIndex = direction === 'next' ? activeTaskIndex + 1 : activeTaskIndex - 1;
    if (newIndex >= tasks.length) newIndex = 0;
    if (newIndex < 0) newIndex = tasks.length - 1;
    setActiveTaskIndex(newIndex);
    onJumpToTask(tasks[newIndex]);
  };

  const currentStepTask = tasks[activeTaskIndex] || tasks[0];

  return (
    <>
      {/* Top Header Status Bar (Clean, Responsive, Non-occluding) */}
      <header className="absolute top-3 left-3 right-3 sm:top-4 sm:left-4 sm:right-4 z-20 pointer-events-none flex items-center justify-between gap-2">
        {/* Left: Branding & Status Badge */}
        <div className="pointer-events-auto bg-slate-900/90 border border-slate-700/80 rounded-2xl p-2 sm:p-2.5 shadow-xl backdrop-blur-md flex items-center gap-2 sm:gap-3">
          <div className={`p-1.5 sm:p-2 rounded-xl flex items-center justify-center shrink-0 ${
            isKosher ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'
          }`}>
            {isKosher ? <ShieldCheck className="w-4 h-4 sm:w-5 sm:h-5" /> : <ShieldAlert className="w-4 h-4 sm:w-5 sm:h-5" />}
          </div>

          <div>
            <div className="flex items-center gap-1.5 sm:gap-2">
              <h1 className="font-serif font-bold text-xs sm:text-sm tracking-wide text-white">Eruv Inspector</h1>
              <button
                onClick={() => {
                  soundManager.playClick();
                  if (onOpenKosherVisualizer) onOpenKosherVisualizer();
                  else onOpenTutorial();
                }}
                className={`text-[10px] sm:text-[11px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider cursor-pointer hover:opacity-90 transition-opacity ${
                  isKosher 
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40' 
                    : 'bg-rose-500/20 text-rose-400 border border-rose-500/40'
                }`}
                title="Click to view real-time Kosher vs. Pasul architectural rules"
              >
                {isKosher ? '🟢 KOSHER' : `🔴 ${remainingCount} BREACHES`}
              </button>
            </div>

            <div className="flex items-center gap-1.5 sm:gap-2 text-[10px] sm:text-xs text-slate-300">
              <span className="font-mono text-amber-300 font-semibold flex items-center gap-1">
                <Clock className="w-3 h-3 text-amber-400 inline" />
                {minutesToShabbat}m
              </span>
              <span className="text-slate-500">·</span>
              <span className="text-slate-400 font-mono">{fixedCount}/{tasks.length}</span>
              {onOpenDifficulty && (
                <>
                  <span className="text-slate-500">·</span>
                  <button
                    onClick={() => {
                      soundManager.playClick();
                      onOpenDifficulty();
                    }}
                    className={`font-mono uppercase font-bold text-[9px] sm:text-[10px] px-1.5 sm:px-2 py-0.5 rounded-md border transition-all cursor-pointer flex items-center gap-1 ${
                      difficulty === 'easy'
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 hover:bg-emerald-500/30'
                        : difficulty === 'standard'
                        ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 hover:bg-amber-500/30'
                        : 'bg-purple-500/20 text-purple-300 border-purple-500/40 hover:bg-purple-500/30'
                    }`}
                    title="Change Difficulty Challenge Level (Easy, Standard, Expert)"
                  >
                    <Zap className="w-2.5 h-2.5" />
                    <span>{difficulty}</span>
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Right: Quick Action Buttons (Desktop pills / Mobile hamburger & shortcuts) */}
        <div className="pointer-events-auto flex items-center gap-1.5 sm:gap-2">
          {/* Desktop Navigation Action Buttons */}
          <div className="hidden md:flex items-center gap-1.5 bg-slate-900/90 border border-slate-700/80 rounded-2xl p-1.5 shadow-xl backdrop-blur-md">
            {onOpenDifficulty && (
              <button
                onClick={() => {
                  soundManager.playClick();
                  onOpenDifficulty();
                }}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border text-xs font-semibold transition-colors cursor-pointer capitalize ${
                  difficulty === 'easy'
                    ? 'bg-emerald-500/15 hover:bg-emerald-500/25 border-emerald-500/30 text-emerald-300'
                    : difficulty === 'standard'
                    ? 'bg-amber-500/15 hover:bg-amber-500/25 border-amber-500/30 text-amber-300'
                    : 'bg-purple-500/15 hover:bg-purple-500/25 border-purple-500/30 text-purple-300'
                }`}
                title="Change Game Challenge Level"
              >
                <Zap className="w-3.5 h-3.5" />
                <span>{difficulty}</span>
              </button>
            )}
            {onOpenStudyHub && (
              <button
                onClick={() => {
                  soundManager.playClick();
                  onOpenStudyHub();
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 text-xs text-amber-300 font-semibold transition-colors cursor-pointer"
                title="Study Center: Daily Halacha & Eruv Facts"
              >
                <BookMarked className="w-3.5 h-3.5" />
                <span>Learn & Facts</span>
              </button>
            )}

            {onOpenKosherVisualizer && (
              <button
                onClick={() => {
                  soundManager.playClick();
                  onOpenKosherVisualizer();
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-xs text-emerald-300 font-semibold transition-colors cursor-pointer"
                title="Visual illustrations of Kosher vs. Pasul rules"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>Kosher Rules</span>
              </button>
            )}

            {onOpenGlossary && (
              <button
                onClick={() => {
                  soundManager.playClick();
                  onOpenGlossary();
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-sky-500/15 hover:bg-sky-500/25 border border-sky-500/30 text-xs text-sky-300 font-semibold transition-colors cursor-pointer"
                title="Search Eruv Terms Glossary"
              >
                <Search className="w-3.5 h-3.5" />
                <span>Glossary</span>
              </button>
            )}

            {onTriggerTrivia && (
              <button
                onClick={() => {
                  soundManager.playClick();
                  onTriggerTrivia();
                }}
                className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 text-xs text-amber-300 font-semibold transition-colors cursor-pointer"
                title="Halachic Trivia & Eruv Fun Facts (Did You Know?)"
              >
                <Lightbulb className="w-3.5 h-3.5 text-amber-400" />
                <span>Trivia</span>
              </button>
            )}

            <button
              onClick={() => {
                soundManager.playClick();
                onOpenAchievements();
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs text-amber-300 font-semibold transition-colors cursor-pointer"
              title="View Badges & Achievements"
            >
              <span>🏆</span>
              <span>{unlockedBadgesCount}/10</span>
            </button>

            <button
              onClick={() => {
                soundManager.playClick();
                onOpenTutorial();
              }}
              className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
              title="Help & Tutorial Walkthrough"
              aria-label="Tutorial"
            >
              <HelpCircle className="w-4 h-4 text-amber-300" />
            </button>
          </div>

          {/* Mobile Camera Overview shortcut */}
          <button
            onClick={() => {
              soundManager.playClick();
              onCameraPreset?.('overview');
            }}
            className="md:hidden p-2 rounded-xl bg-slate-900/90 border border-slate-700/80 text-sky-400 hover:text-white shadow-xl backdrop-blur-md transition-colors cursor-pointer"
            title="Reset to Town Overview"
            aria-label="Town Overview"
          >
            <Compass className="w-4 h-4" />
          </button>

          {/* Mobile Hamburger Menu Button */}
          <button
            onClick={() => {
              soundManager.playClick();
              if (onOpenMobileMenu) {
                onOpenMobileMenu();
              } else if (onOpenStudyHub) {
                onOpenStudyHub();
              }
            }}
            className="md:hidden p-2 rounded-xl bg-slate-900/90 border border-slate-700/80 text-slate-200 hover:text-white shadow-xl backdrop-blur-md transition-colors cursor-pointer flex items-center gap-1"
            aria-label="Open mobile navigation menu"
          >
            <Menu className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Touch Interaction Helper Pill (Fades out cleanly) */}
      {showTouchHint && (
        <div className="absolute top-16 left-1/2 -translate-x-1/2 z-20 pointer-events-auto bg-slate-900/80 border border-slate-700/60 rounded-full px-3.5 py-1 shadow-lg backdrop-blur-sm text-[11px] text-slate-300 flex items-center gap-2 animate-fade-in">
          <span>👆 Drag to look around · Pinch to zoom · Tap poles to inspect</span>
          <button 
            onClick={() => setShowTouchHint(false)} 
            className="text-slate-400 hover:text-white cursor-pointer ml-1"
            aria-label="Dismiss hint"
          >
            ✕
          </button>
        </div>
      )}

      {/* Floating Scavenger Controls (Bottom stepper + Next Breach FAB) */}
      <div className="absolute bottom-16 sm:bottom-24 left-2 right-2 sm:left-6 sm:right-6 z-20 pointer-events-none flex flex-col-reverse sm:flex-row sm:items-end justify-between gap-2 sm:gap-3">
        {/* Left: Interactive Inspection Stepper */}
        <div className="pointer-events-auto bg-slate-900/95 border border-slate-700/80 rounded-2xl p-2 sm:p-2.5 shadow-2xl backdrop-blur-md max-w-sm w-full sm:w-auto flex items-center gap-2">
          <button
            onClick={() => handleStepTask('prev')}
            className="p-2 sm:p-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer shrink-0"
            style={{ minWidth: '40px', minHeight: '40px' }}
            aria-label="Previous inspection point"
          >
            <ChevronLeft className="w-4 h-4 mx-auto" />
          </button>

          <button
            onClick={() => {
              soundManager.playClick();
              onJumpToTask(currentStepTask);
            }}
            className="flex-1 text-left min-w-0 px-1.5 py-0.5 rounded-lg hover:bg-slate-800/50 transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-1.5">
              <span className={`text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.2 rounded ${
                currentStepTask.fixed 
                  ? 'bg-emerald-500/20 text-emerald-400' 
                  : 'bg-amber-500/20 text-amber-300'
              }`}>
                Point {activeTaskIndex + 1}/{tasks.length}
              </span>
              <span className="text-[10px] text-slate-400 truncate font-mono">
                {currentStepTask.locationName}
              </span>
            </div>
            <div className="text-xs font-semibold text-white truncate mt-0.5 flex items-center gap-1">
              {currentStepTask.fixed ? (
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              ) : (
                <AlertCircle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              )}
              <span className="truncate">{currentStepTask.title}</span>
            </div>
          </button>

          <button
            onClick={() => handleStepTask('next')}
            className="p-2 sm:p-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer shrink-0"
            style={{ minWidth: '40px', minHeight: '40px' }}
            aria-label="Next inspection point"
          >
            <ChevronRight className="w-4 h-4 mx-auto" />
          </button>
        </div>

        {/* Right / Top on mobile: High-Priority "Next Issue" Thumb Action Button (FAB) */}
        {!isKosher && nextUnfixedTask && (
          <button
            onClick={handleNextBreachJump}
            className="pointer-events-auto self-end sm:self-auto flex items-center gap-2 px-3.5 py-2 sm:px-5 sm:py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-bold text-xs sm:text-sm shadow-xl hover:shadow-amber-500/30 transition-all cursor-pointer animate-pulse-subtle shrink-0"
            style={{ minHeight: '44px' }}
          >
            <Wrench className="w-4 h-4 text-slate-950 shrink-0" />
            <span className="whitespace-nowrap">Next Breach ({remainingCount} left)</span>
          </button>
        )}
      </div>

      {/* Interactive Active Inspection Workbench / Drawer */}
      {selectedTask && (
        <div 
          className="fixed inset-0 z-40 flex items-end sm:items-center justify-center sm:p-4 bg-black/60 backdrop-blur-sm pointer-events-auto animate-fade-in"
          onClick={() => onSelectTask(null)}
        >
          {/* Card / Bottom-Sheet Container */}
          <div 
            className="bg-slate-900 border border-slate-700 rounded-t-3xl sm:rounded-3xl shadow-2xl max-w-lg w-full text-slate-100 max-h-[85vh] sm:max-h-[90vh] flex flex-col overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header & Drag Handle (Fixed) */}
            <div className="p-4 sm:p-6 pb-3 border-b border-slate-800 shrink-0">
              {/* Mobile Sheet Drag Handle Pill */}
              <div className="sm:hidden flex justify-center -mt-1 mb-2">
                <div className="w-12 h-1 bg-slate-700 rounded-full" />
              </div>

              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md ${
                      selectedTask.fixed ? 'bg-emerald-500/20 text-emerald-300' : 'bg-rose-500/20 text-rose-300'
                    }`}>
                      {selectedTask.fixed ? 'Repaired & Kosher' : 'Breach Detected'}
                    </span>
                    <span className="text-xs text-slate-400">{selectedTask.locationName}</span>
                  </div>
                  <h2 className="text-lg sm:text-xl font-serif font-bold text-white mt-1">
                    {selectedTask.title}
                  </h2>
                </div>
                <button
                  onClick={() => onSelectTask(null)}
                  className="text-slate-400 hover:text-white p-2 rounded-xl hover:bg-slate-800 transition-colors cursor-pointer shrink-0"
                  aria-label="Close Inspection Card"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Hebrew Halachic Title & Quick Glossary Search */}
              <div className="mt-2.5 px-3 py-1.5 bg-slate-800/60 rounded-xl border border-slate-700/60 flex items-center justify-between">
                <span className="text-xs text-slate-400">Halachic Category:</span>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-amber-300 font-serif" dir="rtl">
                    {selectedTask.hebrewTerm}
                  </span>
                  {onOpenGlossary && (
                    <button
                      onClick={() => {
                        soundManager.playClick();
                        const termQuery = selectedTask.id === 'broken-wire' ? 'Pirtzah' :
                          selectedTask.id === 'side-attachment' ? 'Tzurat HaPetach' :
                          selectedTask.id === 'leaning-pole' ? 'Lechi' :
                          selectedTask.id === 'large-gap' ? 'Tzurat HaPetach' :
                          selectedTask.id === 'eruv-chatzerot' ? 'Eruv Chatzerot' : 'Tzurat HaPetach';
                        onOpenGlossary(termQuery);
                      }}
                      className="p-1 rounded-lg bg-sky-500/20 hover:bg-sky-500/30 text-sky-300 text-xs transition-colors flex items-center gap-1 cursor-pointer"
                      title="Search this term in the Glossary"
                    >
                      <Search className="w-3 h-3" />
                      <span className="text-[10px]">Glossary</span>
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Scrollable Educational Body */}
            <div className="p-4 sm:p-6 py-3 overflow-y-auto flex-1 space-y-3">
              {/* Real-Time Pictorial Kosher vs. Pasul Visualizer */}
              <KosherVisualizer
                currentRule={
                  selectedTask.id === 'broken-wire' ? 'broken' :
                  selectedTask.id === 'side-attachment' ? 'overhead' :
                  selectedTask.id === 'leaning-pole' ? 'leaning' :
                  selectedTask.id === 'eruv-chatzerot' ? 'matzah' : 'overhead'
                }
                isCompact={true}
              />

              {/* Description & Scenario */}
              <div className="space-y-2 text-xs sm:text-sm text-slate-300 leading-relaxed">
                <p>{selectedTask.description}</p>

                <div className="p-3 bg-amber-950/30 border border-amber-600/30 rounded-xl">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-amber-400 mb-1">
                    <Info className="w-3.5 h-3.5" />
                    <span>Beginner Halacha Note:</span>
                  </div>
                  <p className="text-xs text-amber-200/90 leading-relaxed">
                    {selectedTask.halachicIssue}
                  </p>
                </div>

                <div className="flex items-center gap-1.5 text-[11px] text-slate-400 font-mono">
                  <BookMarked className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                  <span>Source: {selectedTask.source}</span>
                </div>
              </div>
            </div>

            {/* Sticky Action Footer (Tactile 48px+ button, always accessible without scrolling) */}
            <div className="p-4 sm:p-5 pt-3 bg-slate-900/98 border-t border-slate-800 shrink-0 flex items-center justify-between gap-3 safe-area-inset-bottom">
              <button
                onClick={() => onSelectTask(null)}
                className="px-3.5 py-2.5 text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors cursor-pointer shrink-0"
              >
                Close View
              </button>

              {!selectedTask.fixed ? (
                <button
                  onClick={() => {
                    hapticsManager.medium();
                    soundManager.playWireTension();
                    setTimeout(() => {
                      soundManager.playRepairSound();
                      hapticsManager.success();
                    }, 200);
                    onFixTask(selectedTask.id);
                  }}
                  className="flex-1 flex items-center justify-center gap-2 px-5 py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs sm:text-sm font-bold rounded-xl shadow-lg hover:shadow-amber-500/25 transition-all cursor-pointer active:scale-95"
                  style={{ minHeight: '48px' }}
                >
                  <Wrench className="w-4 h-4" />
                  <span>{selectedTask.fixActionLabel}</span>
                </button>
              ) : (
                <div className="flex-1 flex items-center justify-center gap-1.5 text-xs font-bold text-emerald-400 px-4 py-3 bg-emerald-950/40 border border-emerald-500/30 rounded-xl">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Kosher & Verified</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Victory Celebration Modal when All Tasks are Completed */}
      {isKosher && (
        <div className="fixed top-20 sm:top-24 left-1/2 -translate-x-1/2 z-30 pointer-events-auto bg-emerald-950/95 border border-emerald-500/60 rounded-2xl px-5 py-3.5 sm:px-6 sm:py-4 shadow-2xl backdrop-blur-md max-w-md sm:max-w-lg w-[90vw] text-center animate-bounce-subtle">
          <div className="flex items-center justify-center gap-2 text-emerald-300 font-bold text-base sm:text-lg mb-1">
            <Sparkles className="w-5 h-5 text-amber-400 shrink-0" />
            <span>Shabbat Shalom! Eruv is Fully Certified</span>
          </div>
          <p className="text-xs text-emerald-100/90 leading-relaxed">
            All perimeter breaches are repaired and the communal Eruv Chatzerot is established. Carrying is now fully permitted across the town!
          </p>
          <div className="flex items-center justify-center gap-3 mt-2.5">
            <button
              onClick={onResetGame}
              className="text-xs text-slate-300 hover:text-white underline cursor-pointer"
            >
              Restart Inspection Run
            </button>
          </div>
        </div>
      )}
    </>
  );
};
