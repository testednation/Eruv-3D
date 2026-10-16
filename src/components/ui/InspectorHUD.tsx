import React from 'react';
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
  BookMarked
} from 'lucide-react';
import { EruvInspectionTask } from '../../types/eruv';
import { soundManager } from '../../utils/audio';
import { DailyHalachaCard } from './DailyHalachaCard';

interface InspectorHUDProps {
  tasks: EruvInspectionTask[];
  selectedTask: EruvInspectionTask | null;
  onSelectTask: (task: EruvInspectionTask | null) => void;
  onFixTask: (taskId: string) => void;
  isKosher: boolean;
  minutesToShabbat: number;
  onJumpToTask: (task: EruvInspectionTask) => void;
  onResetGame: () => void;
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
}) => {
  const fixedCount = tasks.filter(t => t.fixed).length;

  return (
    <>
      {/* Top Header Status Bar (Clean, Minimal, Non-occluding) */}
      <div className="absolute top-4 left-4 right-4 z-20 pointer-events-none flex flex-wrap items-start justify-between gap-3">
        {/* Left: Branding & Status Badge */}
        <div className="pointer-events-auto bg-slate-900/90 border border-slate-700/80 rounded-2xl p-3 shadow-xl backdrop-blur-md max-w-md">
          <div className="flex items-center gap-2.5">
            <div className={`p-2 rounded-xl flex items-center justify-center ${
              isKosher ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'
            }`}>
              {isKosher ? <ShieldCheck className="w-5 h-5" /> : <ShieldAlert className="w-5 h-5" />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-serif font-bold text-base tracking-wide text-white">Eruv Inspector</h1>
                {/* Clean, static badge - NO pulsating dots */}
                <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                  isKosher 
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40' 
                    : 'bg-rose-500/20 text-rose-400 border border-rose-500/40'
                }`}>
                  {isKosher ? '🟢 KOSHER (Carrying Permitted)' : '🔴 PASUL (No Carrying)'}
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                {isKosher
                  ? 'Mazal Tov! All boundaries and communal meal verified for Shabbat.'
                  : `Inspect the town perimeter and resolve ${tasks.length - fixedCount} halachic breaches before sunset.`}
              </p>
            </div>
          </div>
        </div>

        {/* Right: Friday Sunset Clock & Progress */}
        <div className="pointer-events-auto bg-slate-900/90 border border-slate-700/80 rounded-2xl p-3 shadow-xl backdrop-blur-md flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-amber-400" />
            <div>
              <div className="text-[10px] uppercase font-bold text-slate-400">Time to Shabbat</div>
              <div className="text-sm font-mono font-bold text-amber-300">
                {minutesToShabbat} mins before Sunset
              </div>
            </div>
          </div>

          <div className="h-8 w-px bg-slate-700" />

          <div>
            <div className="text-[10px] uppercase font-bold text-slate-400">Eruv Perimeter</div>
            <div className="flex items-center gap-1.5 mt-0.5">
              <div className="text-sm font-bold text-white font-mono">{fixedCount}/{tasks.length} Fixed</div>
              <div className="w-20 bg-slate-800 rounded-full h-2 overflow-hidden border border-slate-700">
                <div 
                  className={`h-full transition-all duration-500 ${isKosher ? 'bg-emerald-500' : 'bg-amber-500'}`}
                  style={{ width: `${(fixedCount / tasks.length) * 100}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Daily Halacha Card (Main Dashboard Top-Right) */}
      <div className="absolute top-24 right-4 z-20 pointer-events-auto max-w-sm">
        <DailyHalachaCard />
      </div>

      {/* Task Quick Navigation Bar (Top-left below header) */}
      <div className="absolute top-24 left-4 z-20 pointer-events-auto flex flex-col gap-1.5 max-w-xs">
        <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 ml-1">
          Perimeter Inspection Points:
        </div>
        <div className="flex flex-col gap-1">
          {tasks.map((task) => (
            <button
              key={task.id}
              onClick={() => {
                soundManager.playClick();
                onJumpToTask(task);
              }}
              className={`flex items-center justify-between text-left px-3 py-1.5 rounded-xl border text-xs transition-all cursor-pointer ${
                task.fixed
                  ? 'bg-emerald-950/40 border-emerald-500/30 text-emerald-200 hover:bg-emerald-900/40'
                  : selectedTask?.id === task.id
                  ? 'bg-amber-500/20 border-amber-400 text-amber-200 shadow-md ring-1 ring-amber-400/50'
                  : 'bg-slate-900/80 border-slate-700 text-slate-300 hover:bg-slate-800/90'
              }`}
            >
              <div className="flex items-center gap-2 truncate">
                {task.fixed ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                ) : (
                  <AlertCircle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                )}
                <span className="truncate font-medium">{task.title}</span>
              </div>
              <span className="text-[10px] text-slate-400 font-mono ml-2 shrink-0">
                {task.fixed ? 'OK' : 'INSPECT'}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Interactive Active Inspection Modal / Inspector Workbench */}
      {selectedTask && (
        <div className="fixed inset-0 z-40 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm pointer-events-auto animate-fade-in">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl p-6 shadow-2xl max-w-lg w-full text-slate-100">
            {/* Modal Header */}
            <div className="flex items-start justify-between gap-3 border-b border-slate-800 pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md ${
                    selectedTask.fixed ? 'bg-emerald-500/20 text-emerald-300' : 'bg-rose-500/20 text-rose-300'
                  }`}>
                    {selectedTask.fixed ? 'Repaired & Kosher' : 'Breach Detected'}
                  </span>
                  <span className="text-xs text-slate-400">{selectedTask.locationName}</span>
                </div>
                <h2 className="text-xl font-serif font-bold text-white mt-1">
                  {selectedTask.title}
                </h2>
              </div>
              <button
                onClick={() => onSelectTask(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Hebrew Halachic Title */}
            <div className="my-3 px-3 py-2 bg-slate-800/60 rounded-xl border border-slate-700/60 flex items-center justify-between">
              <span className="text-xs text-slate-400">Talmudic / Halachic Category:</span>
              <span className="text-sm font-semibold text-amber-300 font-serif" dir="rtl">
                {selectedTask.hebrewTerm}
              </span>
            </div>

            {/* Description & Scenario */}
            <div className="space-y-3 text-sm text-slate-300 leading-relaxed">
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
                <BookMarked className="w-3.5 h-3.5 text-sky-400" />
                <span>Source: {selectedTask.source}</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="mt-6 flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
              <button
                onClick={() => onSelectTask(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
              >
                Close View
              </button>

              {!selectedTask.fixed ? (
                <button
                  onClick={() => {
                    soundManager.playWireTension();
                    setTimeout(() => soundManager.playRepairSound(), 200);
                    onFixTask(selectedTask.id);
                  }}
                  className="flex items-center gap-2 px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold rounded-xl shadow-lg hover:shadow-amber-500/25 transition-all cursor-pointer"
                >
                  <Wrench className="w-4 h-4" />
                  <span>{selectedTask.fixActionLabel}</span>
                </button>
              ) : (
                <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-400 px-3 py-1.5 bg-emerald-950/40 border border-emerald-500/30 rounded-xl">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Kosher & Verified</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Victory Celebration Modal when All 5 Tasks are Completed */}
      {isKosher && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-30 pointer-events-auto bg-emerald-950/90 border border-emerald-500/60 rounded-2xl px-6 py-4 shadow-2xl backdrop-blur-md max-w-lg text-center animate-bounce-subtle">
          <div className="flex items-center justify-center gap-2 text-emerald-300 font-bold text-lg mb-1">
            <Sparkles className="w-5 h-5 text-amber-400" />
            <span>Shabbat Shalom! Eruv is Fully Certified</span>
          </div>
          <p className="text-xs text-emerald-100/90">
            All 5 perimeter breaches are mended and the communal Eruv Chatzerot is dedicated.
            Community members can now carry strollers, prayer books, house keys, and coats across the neighborhood!
          </p>
          <div className="flex items-center justify-center gap-3 mt-3">
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
