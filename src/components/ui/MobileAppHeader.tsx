/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { 
  ArrowLeft, 
  Gamepad2, 
  Sliders, 
  Layers, 
  BookOpen, 
  HelpCircle, 
  Volume2, 
  VolumeX, 
  Menu,
  ScrollText,
  ShieldCheck,
  ShieldAlert
} from 'lucide-react';
import { AppMode } from '../../types/eruv';
import { soundManager } from '../../utils/audio';

interface MobileAppHeaderProps {
  currentMode: AppMode;
  onBackToGame: () => void;
  onOpenMobileMenu: () => void;
  soundActive: boolean;
  onToggleSound: () => void;
  isKosher?: boolean;
}

export const MobileAppHeader: React.FC<MobileAppHeaderProps> = ({
  currentMode,
  onBackToGame,
  onOpenMobileMenu,
  soundActive,
  onToggleSound,
  isKosher = false,
}) => {
  // If in 3D game mode, InspectorHUD already has its own floating bar
  if (currentMode === 'game') return null;

  const getModeDetails = () => {
    switch (currentMode) {
      case 'sandbox':
        return { title: 'Doorway Sandbox', icon: Sliders, color: 'text-sky-400' };
      case 'domains':
        return { title: '4 Domains Sim', icon: Layers, color: 'text-indigo-400' };
      case 'infographics':
        return { title: 'Visual Guide', icon: BookOpen, color: 'text-emerald-400' };
      case 'quiz':
        return { title: 'Halacha Quiz', icon: HelpCircle, color: 'text-purple-400' };
      case 'daily-halacha':
        return { title: 'Daily Halacha', icon: ScrollText, color: 'text-amber-400' };
      default:
        return { title: 'Eruv Explorer', icon: Gamepad2, color: 'text-white' };
    }
  };

  const mode = getModeDetails();
  const ModeIcon = mode.icon;

  return (
    <header className="sticky top-0 left-0 right-0 z-30 bg-slate-900/95 backdrop-blur-md border-b border-slate-800/90 safe-area-inset-top px-3 py-2 flex items-center justify-between pointer-events-auto">
      {/* Left: Back to 3D Inspection */}
      <button
        onClick={() => {
          soundManager.playClick();
          onBackToGame();
        }}
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-xs font-semibold text-slate-200 hover:text-white transition-colors cursor-pointer border border-slate-700/60"
        style={{ minHeight: '38px' }}
        aria-label="Back to 3D Inspection view"
      >
        <ArrowLeft className="w-4 h-4 text-amber-400" />
        <span className="font-sans">3D Town</span>
      </button>

      {/* Center: Current View Title & Icon */}
      <div className="flex items-center gap-1.5">
        <ModeIcon className={`w-4 h-4 ${mode.color} shrink-0`} />
        <span className="font-serif font-bold text-xs sm:text-sm text-white truncate max-w-[150px] sm:max-w-none">
          {mode.title}
        </span>
      </div>

      {/* Right: Sound Toggle & Hamburger Menu */}
      <div className="flex items-center gap-1">
        <button
          onClick={() => {
            soundManager.playClick();
            onToggleSound();
          }}
          className={`p-2 rounded-xl transition-colors cursor-pointer border border-slate-700/60 ${
            soundActive 
              ? 'bg-slate-800/80 text-amber-400 hover:text-amber-300' 
              : 'bg-slate-800/80 text-slate-500 hover:text-slate-400'
          }`}
          style={{ minWidth: '38px', minHeight: '38px' }}
          aria-label={soundActive ? 'Mute sound' : 'Unmute sound'}
        >
          {soundActive ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
        </button>

        <button
          onClick={() => {
            soundManager.playClick();
            onOpenMobileMenu();
          }}
          className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-200 hover:text-white transition-colors cursor-pointer border border-slate-700/60"
          style={{ minWidth: '38px', minHeight: '38px' }}
          aria-label="Open mobile menu"
        >
          <Menu className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};
