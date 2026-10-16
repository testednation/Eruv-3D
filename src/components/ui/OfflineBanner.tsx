import React from 'react';
import { WifiOff, HardDrive, Download } from 'lucide-react';

interface OfflineBannerProps {
  isOnline: boolean;
  onOpenDeployModal: () => void;
}

export const OfflineBanner: React.FC<OfflineBannerProps> = ({ isOnline, onOpenDeployModal }) => {
  if (isOnline) return null;

  return (
    <div className="fixed top-20 left-1/2 -translate-x-1/2 z-40 pointer-events-auto flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/90 text-slate-950 font-bold text-xs shadow-xl backdrop-blur-md animate-fade-in border border-amber-300">
      <WifiOff className="w-3.5 h-3.5 shrink-0" />
      <span>Offline Mode — All 3D scenes, sandbox & halachot running on local cache</span>
      <button
        onClick={onOpenDeployModal}
        className="ml-1.5 px-2 py-0.5 rounded-full bg-slate-950 text-amber-300 text-[10px] hover:bg-slate-900 transition-colors cursor-pointer"
      >
        Settings
      </button>
    </div>
  );
};
