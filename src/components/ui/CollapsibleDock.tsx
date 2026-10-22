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
  Download, 
  ScrollText, 
  Trophy,
  Sparkles
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
  onOpenStudyHub?: () => void;
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
  onOpenStudyHub,
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
    <>
      {/* =========================================================================
          MOBILE DEDICATED BOTTOM NAVIGATION BAR (< 768px)
          Designed specifically for touch ergonomics, thumbs, zero clutter.
          ========================================================================= */}
      <nav 
        className="md:hidden fixed bottom-0 left-0 right-0 z-30 bg-slate-900/95 border-t border-slate-800/90 backdrop-blur-lg px-2 py-1.5 flex items-center justify-around pointer-events-auto safe-area-inset-bottom"
        aria-label="Mobile Bottom Navigation"
      >
        {/* Tab 1: 3D Inspector */}
        <button
          onClick={() => handleModeChange('game')}
          className={`flex-1 flex flex-col items-center justify-center py-1 px-1 rounded-xl transition-all cursor-pointer ${
            currentMode === 'game'
              ? 'text-amber-400 font-bold'
              : 'text-slate-400 hover:text-slate-200'
          }`}
          style={{ minHeight: '48px' }}
        >
          <div className="relative">
            <Gamepad2 className="w-5 h-5" />
            <span className={`absolute -top-1 -right-2 text-[9px] px-1 rounded-full font-mono font-bold ${
              isKosher ? 'bg-emerald-500 text-slate-950' : 'bg-amber-500 text-slate-950'
            }`}>
              {fixedTasksCount}/{totalTasksCount}
            </span>
          </div>
          <span className="text-[10px] mt-0.5 tracking-tight">Inspect</span>
        </button>

        {/* Tab 2: Halachic Sandbox */}
        <button
          onClick={() => handleModeChange('sandbox')}
          className={`flex-1 flex flex-col items-center justify-center py-1 px-1 rounded-xl transition-all cursor-pointer ${
            currentMode === 'sandbox'
              ? 'text-sky-400 font-bold'
              : 'text-slate-400 hover:text-slate-200'
          }`}
          style={{ minHeight: '48px' }}
        >
          <Sliders className="w-5 h-5" />
          <span className="text-[10px] mt-0.5 tracking-tight">Sandbox</span>
        </button>

        {/* Tab 3: 4 Domains Sim */}
        <button
          onClick={() => handleModeChange('domains')}
          className={`flex-1 flex flex-col items-center justify-center py-1 px-1 rounded-xl transition-all cursor-pointer ${
            currentMode === 'domains'
              ? 'text-indigo-400 font-bold'
              : 'text-slate-400 hover:text-slate-200'
          }`}
          style={{ minHeight: '48px' }}
        >
          <Layers className="w-5 h-5" />
          <span className="text-[10px] mt-0.5 tracking-tight">Domains</span>
        </button>

        {/* Tab 4: Study Hub / Learn */}
        <button
          onClick={() => {
            soundManager.playClick();
            if (onOpenStudyHub) {
              onOpenStudyHub();
            } else {
              handleModeChange('daily-halacha');
            }
          }}
          className={`flex-1 flex flex-col items-center justify-center py-1 px-1 rounded-xl transition-all cursor-pointer ${
            currentMode === 'daily-halacha' || currentMode === 'infographics'
              ? 'text-emerald-400 font-bold'
              : 'text-slate-400 hover:text-slate-200'
          }`}
          style={{ minHeight: '48px' }}
        >
          <BookOpen className="w-5 h-5" />
          <span className="text-[10px] mt-0.5 tracking-tight">Learn</span>
        </button>

        {/* Tab 5: Halacha Quiz */}
        <button
          onClick={() => handleModeChange('quiz')}
          className={`flex-1 flex flex-col items-center justify-center py-1 px-1 rounded-xl transition-all cursor-pointer ${
            currentMode === 'quiz'
              ? 'text-purple-400 font-bold'
              : 'text-slate-400 hover:text-slate-200'
          }`}
          style={{ minHeight: '48px' }}
        >
          <HelpCircle className="w-5 h-5" />
          <span className="text-[10px] mt-0.5 tracking-tight">Quiz</span>
        </button>
      </nav>

      {/* =========================================================================
          DESKTOP / TABLET COLLAPSIBLE DOCK (>= 768px)
          Spacious, glassmorphic, non-occluding layout.
          ========================================================================= */}
      <div
        className={`hidden md:block fixed z-30 transition-all duration-300 ease-in-out left-1/2 -translate-x-1/2 pointer-events-auto ${
          isCollapsed ? 'bottom-2' : 'bottom-4'
        }`}
        style={{ width: 'min(980px, 94vw)' }}
      >
        {/* Collapse / Expand Toggle Tab */}
        <div className="flex justify-center -mb-px">
          <button
            onClick={() => {
              soundManager.playClick();
              setIsCollapsed(!isCollapsed);
            }}
            className="flex items-center gap-1.5 px-3 py-0.5 text-[11px] font-semibold uppercase tracking-wider text-slate-400 hover:text-slate-200 bg-slate-900/90 border border-b-0 border-slate-700/80 rounded-t-lg shadow-lg transition-colors cursor-pointer"
            aria-label={isCollapsed ? 'Show Controls' : 'Hide Controls'}
          >
            {isCollapsed ? (
              <>
                <ChevronUp className="w-3.5 h-3.5 text-amber-400" />
                <span>Show Dock</span>
              </>
            ) : (
              <>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                <span>Hide Dock</span>
              </>
            )}
          </button>
        </div>

        {/* Main Glassmorphic Control Dock */}
        {!isCollapsed && (
          <div className="bg-slate-900/95 border border-slate-700/80 rounded-2xl shadow-2xl p-2.5 text-slate-100 backdrop-blur-md">
            <div className="flex items-center justify-between gap-3">
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
                  <span className={`ml-1 text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
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
                  <span>Sandbox</span>
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
                  <span>4 Domains</span>
                </button>

                <button
                  onClick={() => {
                    if (onOpenStudyHub) {
                      soundManager.playClick();
                      onOpenStudyHub();
                    } else {
                      handleModeChange('daily-halacha');
                    }
                  }}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    currentMode === 'daily-halacha'
                      ? 'bg-amber-500 text-slate-950 shadow-md font-bold'
                      : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
                  }`}
                >
                  <ScrollText className="w-3.5 h-3.5" />
                  <span>Daily Law & Facts</span>
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
                  <span>Guide</span>
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
                  <span>Quiz</span>
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
                  <span>Walls</span>
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
                    Issue
                  </button>
                </div>

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
                  <span>Offline</span>
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
    </>
  );
};
