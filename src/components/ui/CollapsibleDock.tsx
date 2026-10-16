import React, { useState } from 'react';
import { 
  Gamepad2, 
  Sliders, 
  Layers, 
  BookOpen, 
  HelpCircle, 
  Volume2, 
  VolumeX, 
  Eye, 
  Compass, 
  ChevronDown, 
  ChevronUp, 
  CheckCircle2, 
  AlertTriangle,
  Download,
  ScrollText,
  Trophy
} from 'lucide-react';
import { AppMode } from '../../types/eruv';
import { soundManager } from '../../utils/audio';

interface CollapsibleDockProps {
  currentMode: AppMode;
  onSelectMode: (mode: AppMode) => void;
  isKosher: boolean;
  fixedTasksCount: number;
  totalTasksCount: number;
  showVirtualWalls: boolean;
  onToggleVirtualWalls: () => void;
  onCameraPreset: (preset: 'overview' | 'synagogue' | 'tasks' | 'perimeter') => void;
  onOpenGlossary: () => void;
  onOpenOfflineModal: () => void;
  onOpenTutorial?: () => void;
  onOpenAchievements?: () => void;
  unlockedBadgesCount?: number;
  isOnline: boolean;
}

export const CollapsibleDock: React.FC<CollapsibleDockProps> = ({
  currentMode,
  onSelectMode,
  isKosher,
  fixedTasksCount,
  totalTasksCount,
  showVirtualWalls,
  onToggleVirtualWalls,
  onCameraPreset,
  onOpenGlossary,
  onOpenOfflineModal,
  onOpenTutorial,
  onOpenAchievements,
  unlockedBadgesCount = 0,
  isOnline,
}) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [soundActive, setSoundActive] = useState(true);

  const toggleSound = () => {
    soundManager.enabled = !soundActive;
    setSoundActive(!soundActive);
    if (!soundActive) {
      soundManager.playClick();
    }
  };

  const handleModeChange = (mode: AppMode) => {
    soundManager.playClick();
    onSelectMode(mode);
  };

  return (
    <div
      className={`fixed z-30 transition-all duration-300 ease-in-out left-1/2 -translate-x-1/2 pointer-events-auto ${
        isCollapsed ? 'bottom-2' : 'bottom-5'
      }`}
      style={{ width: 'min(960px, 95vw)' }}
    >
      {/* Collapse / Expand Toggle Tab */}
      <div className="flex justify-center -mb-px">
        <button
          onClick={() => {
            soundManager.playClick();
            setIsCollapsed(!isCollapsed);
          }}
          className="flex items-center gap-1.5 px-4 py-1 text-xs font-semibold uppercase tracking-wider text-slate-300 bg-slate-900/90 border border-b-0 border-slate-700/80 rounded-t-lg shadow-lg hover:bg-slate-800 transition-colors cursor-pointer"
          aria-label={isCollapsed ? 'Show Controls' : 'Hide Controls'}
        >
          {isCollapsed ? (
            <>
              <ChevronUp className="w-3.5 h-3.5 text-amber-400" />
              <span>Show Controls</span>
            </>
          ) : (
            <>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              <span>Hide Controls</span>
            </>
          )}
        </button>
      </div>

      {/* Main Glassmorphic Control Dock */}
      {!isCollapsed && (
        <div className="bg-slate-900/95 border border-slate-700/80 rounded-2xl shadow-2xl p-2.5 sm:p-3 text-slate-100 backdrop-blur-md">
          <div className="flex flex-wrap items-center justify-between gap-2.5">
            {/* Mode Switcher Tabs */}
            <div className="flex items-center gap-1 bg-slate-800/80 p-1 rounded-xl border border-slate-700/50">
              <button
                onClick={() => handleModeChange('game')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  currentMode === 'game'
                    ? 'bg-amber-500 text-slate-950 shadow-md font-bold'
                    : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
                }`}
              >
                <Gamepad2 className="w-3.5 h-3.5" />
                <span>3D Inspector</span>
                <span className={`ml-1 text-[10px] px-1.5 py-0.5 rounded-full font-mono ${
                  currentMode === 'game' ? 'bg-amber-600/30 text-slate-950 font-bold' : 'bg-slate-700 text-slate-300'
                }`}>
                  {fixedTasksCount}/{totalTasksCount}
                </span>
              </button>

              <button
                onClick={() => handleModeChange('sandbox')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  currentMode === 'sandbox'
                    ? 'bg-sky-500 text-slate-950 shadow-md font-bold'
                    : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
                }`}
              >
                <Sliders className="w-3.5 h-3.5" />
                <span>Halachic Sandbox</span>
              </button>

              <button
                onClick={() => handleModeChange('domains')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  currentMode === 'domains'
                    ? 'bg-indigo-500 text-white shadow-md font-bold'
                    : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>4 Domains Sim</span>
              </button>

              <button
                onClick={() => handleModeChange('infographics')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  currentMode === 'infographics'
                    ? 'bg-emerald-500 text-slate-950 shadow-md font-bold'
                    : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
                }`}
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>Visual Guide</span>
              </button>

              <button
                onClick={() => handleModeChange('quiz')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  currentMode === 'quiz'
                    ? 'bg-purple-500 text-white shadow-md font-bold'
                    : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
                }`}
              >
                <HelpCircle className="w-3.5 h-3.5" />
                <span>Halacha Quiz</span>
              </button>

              <button
                onClick={() => handleModeChange('daily-halacha')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  currentMode === 'daily-halacha'
                    ? 'bg-amber-500 text-slate-950 shadow-md font-bold'
                    : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
                }`}
              >
                <ScrollText className="w-3.5 h-3.5" />
                <span>Daily Halacha</span>
              </button>
            </div>

            {/* Quick Actions & Toggles */}
            <div className="flex items-center gap-1.5 ml-auto">
              {/* Virtual Walls Toggle */}
              <button
                onClick={() => {
                  soundManager.playClick();
                  onToggleVirtualWalls();
                }}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-colors cursor-pointer ${
                  showVirtualWalls
                    ? 'bg-emerald-950/60 border-emerald-500/50 text-emerald-300'
                    : 'bg-slate-800/60 border-slate-700 text-slate-400'
                }`}
                title="Toggle visual representation of Gud Asek (Virtual Halachic Walls)"
              >
                <Eye className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Gud Asek Walls</span>
              </button>

              {/* Camera Views dropdown/preset */}
              <div className="flex items-center bg-slate-800/80 rounded-lg p-0.5 border border-slate-700/50">
                <button
                  onClick={() => {
                    soundManager.playClick();
                    onCameraPreset('overview');
                  }}
                  className="px-2 py-1 text-[11px] font-medium text-slate-300 hover:text-white hover:bg-slate-700 rounded transition-colors cursor-pointer"
                  title="Overview Camera"
                >
                  <Compass className="w-3 h-3 inline mr-1" />
                  Town
                </button>
                <button
                  onClick={() => {
                    soundManager.playClick();
                    onCameraPreset('synagogue');
                  }}
                  className="px-2 py-1 text-[11px] font-medium text-slate-300 hover:text-white hover:bg-slate-700 rounded transition-colors cursor-pointer"
                  title="Focus on Synagogue"
                >
                  Shul
                </button>
                <button
                  onClick={() => {
                    soundManager.playClick();
                    onCameraPreset('tasks');
                  }}
                  className="px-2 py-1 text-[11px] font-medium text-slate-300 hover:text-white hover:bg-slate-700 rounded transition-colors cursor-pointer"
                  title="Next Inspection Task"
                >
                  Inspect
                </button>
              </div>

              {/* Tutorial Button */}
              {onOpenTutorial && (
                <button
                  onClick={() => {
                    soundManager.playClick();
                    onOpenTutorial();
                  }}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold text-amber-300 hover:text-white bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 rounded-lg transition-colors cursor-pointer"
                  title="Open Interactive Tutorial & Kosher Rules Guide"
                >
                  <HelpCircle className="w-3.5 h-3.5" />
                  <span>Tutorial</span>
                </button>
              )}

              {/* Badges / Achievements Button */}
              {onOpenAchievements && (
                <button
                  onClick={() => {
                    soundManager.playClick();
                    onOpenAchievements();
                  }}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold text-amber-200 hover:text-white bg-slate-800/80 hover:bg-slate-700 border border-slate-700/60 rounded-lg transition-colors cursor-pointer"
                  title="View Achievements & Badges"
                >
                  <Trophy className="w-3.5 h-3.5 text-amber-400" />
                  <span className="hidden sm:inline">Badges</span>
                  <span className="text-[10px] font-mono font-bold px-1.5 py-0.2 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    {unlockedBadgesCount}
                  </span>
                </button>
              )}

              {/* Glossary Button */}
              <button
                onClick={() => {
                  soundManager.playClick();
                  onOpenGlossary();
                }}
                className="px-2.5 py-1.5 text-xs font-medium text-slate-300 hover:text-white bg-slate-800/80 border border-slate-700/50 rounded-lg transition-colors cursor-pointer"
                title="Hebrew / English Eruv Glossary"
              >
                Glossary
              </button>

              {/* Deploy Offline / Install Button */}
              <button
                onClick={() => {
                  soundManager.playClick();
                  onOpenOfflineModal();
                }}
                className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-bold text-sky-300 hover:text-white bg-sky-950/60 hover:bg-sky-900/60 border border-sky-500/40 rounded-lg transition-colors cursor-pointer"
                title="Deploy App Offline / Install PWA"
              >
                {!isOnline ? (
                  <span className="w-2 h-2 rounded-full bg-amber-400" />
                ) : (
                  <Download className="w-3.5 h-3.5" />
                )}
                <span>Deploy Offline</span>
              </button>

              {/* Sound Toggle */}
              <button
                onClick={toggleSound}
                className="p-1.5 text-slate-400 hover:text-white bg-slate-800/80 border border-slate-700/50 rounded-lg transition-colors cursor-pointer"
                aria-label={soundActive ? 'Mute audio' : 'Unmute audio'}
              >
                {soundActive ? <Volume2 className="w-4 h-4 text-amber-400" /> : <VolumeX className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
