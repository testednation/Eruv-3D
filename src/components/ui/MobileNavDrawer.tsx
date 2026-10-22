import React from 'react';
import { 
  X, 
  Volume2, 
  VolumeX, 
  Eye, 
  EyeOff, 
  RotateCcw, 
  HelpCircle, 
  BookMarked, 
  Trophy, 
  Download, 
  Compass, 
  ScrollText, 
  CheckCircle2, 
  AlertTriangle,
  Clock,
  Sparkles,
  ChevronRight
} from 'lucide-react';
import { soundManager } from '../../utils/audio';

interface MobileNavDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  isKosher: boolean;
  fixedCount: number;
  totalTasks: number;
  minutesToShabbat: number;
  showVirtualWalls: boolean;
  onToggleVirtualWalls: () => void;
  soundActive: boolean;
  onToggleSound: () => void;
  onCameraPreset: (preset: 'overview' | 'synagogue' | 'tasks' | 'perimeter') => void;
  onOpenTutorial: () => void;
  onOpenAchievements: () => void;
  onOpenGlossary: () => void;
  onOpenStudyHub: () => void;
  onOpenKosherRules: () => void;
  onOpenOfflineModal: () => void;
  onResetGame: () => void;
  unlockedBadgesCount: number;
  isOnline: boolean;
}

export const MobileNavDrawer: React.FC<MobileNavDrawerProps> = ({
  isOpen,
  onClose,
  isKosher,
  fixedCount,
  totalTasks,
  minutesToShabbat,
  showVirtualWalls,
  onToggleVirtualWalls,
  soundActive,
  onToggleSound,
  onCameraPreset,
  onOpenTutorial,
  onOpenAchievements,
  onOpenGlossary,
  onOpenStudyHub,
  onOpenKosherRules,
  onOpenOfflineModal,
  onResetGame,
  unlockedBadgesCount,
  isOnline,
}) => {
  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm animate-fade-in pointer-events-auto"
      onClick={onClose}
    >
      <div 
        className="w-full max-w-xs h-full bg-slate-900 border-l border-slate-700/80 shadow-2xl flex flex-col justify-between overflow-y-auto text-slate-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drawer Header */}
        <div className="p-4 border-b border-slate-800 bg-slate-950/60 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className={`p-1.5 rounded-xl ${
              isKosher ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'
            }`}>
              {isKosher ? <CheckCircle2 className="w-5 h-5" /> : <AlertTriangle className="w-5 h-5" />}
            </div>
            <div>
              <div className="font-bold text-sm text-white">Eruv Explorer</div>
              <div className="text-[11px] text-slate-400">Mobile Navigation & Tools</div>
            </div>
          </div>

          <button
            onClick={() => {
              soundManager.playClick();
              onClose();
            }}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            aria-label="Close menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Status Pill Card */}
        <div className="p-4 bg-slate-950/40 border-b border-slate-800 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400">Status</span>
            <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
              isKosher ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
            }`}>
              {isKosher ? '🟢 KOSHER' : `🔴 ${totalTasks - fixedCount} BREACHES`}
            </span>
          </div>

          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-1.5 text-amber-300 font-mono font-bold">
              <Clock className="w-3.5 h-3.5" />
              <span>{minutesToShabbat}m to Sunset</span>
            </div>
            <span className="text-slate-400 font-mono">{fixedCount}/{totalTasks} Fixed</span>
          </div>

          <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
            <div 
              className={`h-full transition-all duration-300 ${isKosher ? 'bg-emerald-500' : 'bg-amber-500'}`}
              style={{ width: `${(fixedCount / totalTasks) * 100}%` }}
            />
          </div>
        </div>

        {/* Navigation Action Links */}
        <div className="p-3 space-y-1.5 flex-1 overflow-y-auto">
          <div className="text-[10px] uppercase font-bold tracking-wider text-slate-400 px-2 py-1">
            Learning & Exploration
          </div>

          <button
            onClick={() => {
              soundManager.playClick();
              onClose();
              onOpenStudyHub();
            }}
            className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl bg-slate-800/60 hover:bg-slate-800 text-xs font-semibold text-amber-300 transition-colors cursor-pointer border border-amber-500/20"
          >
            <div className="flex items-center gap-2.5">
              <ScrollText className="w-4 h-4 text-amber-400" />
              <span>Study Center & Shulchan Aruch</span>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-500" />
          </button>

          <button
            onClick={() => {
              soundManager.playClick();
              onClose();
              onOpenKosherRules();
            }}
            className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl bg-slate-800/40 hover:bg-slate-800 text-xs font-semibold text-emerald-300 transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-2.5">
              <Eye className="w-4 h-4 text-emerald-400" />
              <span>Kosher vs. Pasul Rules</span>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-500" />
          </button>

          <button
            onClick={() => {
              soundManager.playClick();
              onClose();
              onOpenGlossary();
            }}
            className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl bg-slate-800/40 hover:bg-slate-800 text-xs font-semibold text-sky-300 transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-2.5">
              <BookMarked className="w-4 h-4 text-sky-400" />
              <span>Hebrew/English Glossary</span>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-500" />
          </button>

          <button
            onClick={() => {
              soundManager.playClick();
              onClose();
              onOpenAchievements();
            }}
            className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl bg-slate-800/40 hover:bg-slate-800 text-xs font-semibold text-amber-200 transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-2.5">
              <Trophy className="w-4 h-4 text-amber-400" />
              <span>Achievements Gallery</span>
            </div>
            <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300">
              {unlockedBadgesCount}/10
            </span>
          </button>

          <button
            onClick={() => {
              soundManager.playClick();
              onClose();
              onOpenTutorial();
            }}
            className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl bg-slate-800/40 hover:bg-slate-800 text-xs font-semibold text-slate-200 transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-2.5">
              <HelpCircle className="w-4 h-4 text-slate-400" />
              <span>Tutorial Guide</span>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-500" />
          </button>

          <div className="text-[10px] uppercase font-bold tracking-wider text-slate-400 px-2 pt-3 pb-1">
            3D Camera Shortcuts
          </div>

          <div className="grid grid-cols-2 gap-1.5">
            <button
              onClick={() => {
                soundManager.playClick();
                onClose();
                onCameraPreset('overview');
              }}
              className="px-2.5 py-2 rounded-xl bg-slate-800/60 hover:bg-slate-700 text-xs text-slate-200 font-medium transition-colors text-left flex items-center gap-2 cursor-pointer"
            >
              <Compass className="w-3.5 h-3.5 text-sky-400" />
              <span>Overview</span>
            </button>

            <button
              onClick={() => {
                soundManager.playClick();
                onClose();
                onCameraPreset('synagogue');
              }}
              className="px-2.5 py-2 rounded-xl bg-slate-800/60 hover:bg-slate-700 text-xs text-slate-200 font-medium transition-colors text-left flex items-center gap-2 cursor-pointer"
            >
              <span>🕍 Synagogue</span>
            </button>

            <button
              onClick={() => {
                soundManager.playClick();
                onClose();
                onCameraPreset('tasks');
              }}
              className="col-span-2 px-2.5 py-2 rounded-xl bg-amber-500/20 border border-amber-500/30 hover:bg-amber-500/30 text-xs text-amber-300 font-medium transition-colors text-left flex items-center gap-2 cursor-pointer"
            >
              <span>⚠️ Focus Next Issue</span>
            </button>
          </div>

          <div className="text-[10px] uppercase font-bold tracking-wider text-slate-400 px-2 pt-3 pb-1">
            Preferences & Tools
          </div>

          {/* Sound Toggle */}
          <button
            onClick={() => {
              onToggleSound();
            }}
            className="w-full flex items-center justify-between px-3 py-2 rounded-xl bg-slate-800/40 hover:bg-slate-800 text-xs text-slate-300 transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-2">
              {soundActive ? <Volume2 className="w-4 h-4 text-emerald-400" /> : <VolumeX className="w-4 h-4 text-slate-500" />}
              <span>Audio Effects</span>
            </div>
            <span className="text-[11px] font-mono text-slate-400">{soundActive ? 'ON' : 'OFF'}</span>
          </button>

          {/* Virtual Walls Toggle */}
          <button
            onClick={() => {
              soundManager.playClick();
              onToggleVirtualWalls();
            }}
            className="w-full flex items-center justify-between px-3 py-2 rounded-xl bg-slate-800/40 hover:bg-slate-800 text-xs text-slate-300 transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-2">
              {showVirtualWalls ? <Eye className="w-4 h-4 text-emerald-400" /> : <EyeOff className="w-4 h-4 text-slate-500" />}
              <span>Virtual Walls (Gud Asek)</span>
            </div>
            <span className="text-[11px] font-mono text-slate-400">{showVirtualWalls ? 'ON' : 'OFF'}</span>
          </button>

          {/* Offline / PWA modal */}
          <button
            onClick={() => {
              soundManager.playClick();
              onClose();
              onOpenOfflineModal();
            }}
            className="w-full flex items-center justify-between px-3 py-2 rounded-xl bg-slate-800/40 hover:bg-slate-800 text-xs text-slate-300 transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <Download className="w-4 h-4 text-sky-400" />
              <span>Offline App & PWA</span>
            </div>
            <span className="text-[11px] font-mono text-emerald-400">{isOnline ? 'Online' : 'Offline'}</span>
          </button>
        </div>

        {/* Drawer Footer with Reset Button */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/60">
          <button
            onClick={() => {
              onClose();
              onResetGame();
            }}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-rose-950/40 border border-rose-500/30 text-rose-300 hover:bg-rose-900/50 text-xs font-semibold transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Inspection Run</span>
          </button>
        </div>
      </div>
    </div>
  );
};
