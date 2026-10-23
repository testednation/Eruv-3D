import React, { useState } from 'react';
import { 
  Download, 
  Wifi, 
  WifiOff, 
  CheckCircle2, 
  Smartphone, 
  Monitor, 
  X, 
  HardDrive, 
  ShieldCheck, 
  Sparkles,
  HelpCircle,
  Share2
} from 'lucide-react';
import { usePWAInstall } from '../../hooks/usePWAInstall';
import { soundManager } from '../../utils/audio';

interface OfflineDeployModalProps {
  isOpen: boolean;
  onClose: () => void;
  isSimulatedOffline: boolean;
  onToggleSimulatedOffline: (val: boolean) => void;
  isOnline: boolean;
}

export const OfflineDeployModal: React.FC<OfflineDeployModalProps> = ({
  isOpen,
  onClose,
  isSimulatedOffline,
  onToggleSimulatedOffline,
  isOnline,
}) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [installSuccess, setInstallSuccess] = useState(false);

  if (!isOpen) return null;

  const handleInstallClick = async () => {
    soundManager.playClick();
    const success = await install();
    if (success) {
      soundManager.playCelebration();
      setInstallSuccess(true);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
      <div className="bg-slate-900 border border-slate-700 rounded-3xl p-4 sm:p-6 shadow-2xl max-w-xl w-full max-h-[85vh] flex flex-col text-slate-100 overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-sky-500/20 text-sky-400 rounded-xl">
              <Download className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-serif font-bold text-white">Deploy & Run App Offline</h2>
              <p className="text-xs text-slate-400">PWA installation, offline service worker & local caching</p>
            </div>
          </div>
          <button
            onClick={() => {
              soundManager.playClick();
              onClose();
            }}
            className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Section 1: In-App PWA Install */}
        <div className="mb-5 p-4 rounded-2xl bg-gradient-to-br from-slate-800/80 to-slate-900 border border-slate-700/80 shadow-md">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-sky-300 flex items-center gap-1.5">
              <Smartphone className="w-3.5 h-3.5" />
              1. Install as Standalone App (PWA)
            </span>
            {isInstalled ? (
              <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-800 px-2 py-0.5 rounded-full flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> Installed
              </span>
            ) : (
              <span className="text-[10px] font-mono text-slate-400">Ready to Install</span>
            )}
          </div>

          <p className="text-xs text-slate-300 leading-relaxed mb-3">
            Install Eruv Explorer onto your home screen or desktop. It runs in full standalone mode with no browser URL bars and works 100% offline — perfect for studying and exploring anywhere without an internet connection!
          </p>

          {isInstalled ? (
            <div className="p-3 bg-emerald-950/40 border border-emerald-500/30 rounded-xl text-xs text-emerald-300 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>You are currently running Eruv Explorer as an installed standalone application!</span>
            </div>
          ) : isInstallable ? (
            <button
              onClick={handleInstallClick}
              className="w-full flex items-center justify-center gap-2 px-5 py-2.5 bg-sky-500 hover:bg-sky-400 text-slate-950 text-xs font-bold rounded-xl shadow-lg transition-all cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>Install Eruv Explorer on This Device</span>
            </button>
          ) : isIOS ? (
            <div className="p-3.5 bg-slate-800/90 border border-slate-700 rounded-xl space-y-1.5 text-xs text-slate-200">
              <div className="flex items-center gap-1.5 font-bold text-amber-300">
                <Share2 className="w-3.5 h-3.5" />
                <span>How to Install on iOS (iPhone / iPad):</span>
              </div>
              <ol className="list-decimal list-inside space-y-1 text-slate-300 text-[11px] leading-relaxed">
                <li>Tap the <strong>Share</strong> button in the Safari bottom bar.</li>
                <li>Scroll down and select <strong>Add to Home Screen</strong>.</li>
                <li>Tap <strong>Add</strong> in the top-right corner to launch anytime offline!</li>
              </ol>
            </div>
          ) : (
            <div className="p-3 bg-slate-800/70 border border-slate-700/60 rounded-xl text-xs text-slate-300 flex items-center justify-between">
              <span>Install prompt available in browser menu (Click <strong>Install App</strong> in address bar).</span>
              <Monitor className="w-4 h-4 text-slate-400 shrink-0 ml-2" />
            </div>
          )}
        </div>

        {/* Section 2: Offline Service Worker Status */}
        <div className="mb-5 p-4 rounded-2xl bg-slate-800/50 border border-slate-700/60">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-300 flex items-center gap-1.5">
              <HardDrive className="w-3.5 h-3.5" />
              2. Offline Storage & Caching
            </span>
            <span className="text-[10px] font-mono font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-800 px-2 py-0.5 rounded-full">
              Precached
            </span>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed mb-3">
            All 3D procedural textures, Three.js shaders, interactive quizzes, domain simulators, and Web Audio synthesizers are embedded and cached locally:
          </p>

          <div className="grid grid-cols-2 gap-2 text-[11px] mb-3">
            <div className="p-2 rounded-lg bg-slate-900/60 border border-slate-800 flex items-center gap-1.5 text-emerald-300">
              <CheckCircle2 className="w-3 h-3 text-emerald-400" />
              <span>3D Town Inspector</span>
            </div>
            <div className="p-2 rounded-lg bg-slate-900/60 border border-slate-800 flex items-center gap-1.5 text-emerald-300">
              <CheckCircle2 className="w-3 h-3 text-emerald-400" />
              <span>Halachic Sandbox</span>
            </div>
            <div className="p-2 rounded-lg bg-slate-900/60 border border-slate-800 flex items-center gap-1.5 text-emerald-300">
              <CheckCircle2 className="w-3 h-3 text-emerald-400" />
              <span>4 Domains Simulator</span>
            </div>
            <div className="p-2 rounded-lg bg-slate-900/60 border border-slate-800 flex items-center gap-1.5 text-emerald-300">
              <CheckCircle2 className="w-3 h-3 text-emerald-400" />
              <span>Visual Infographics</span>
            </div>
          </div>

          {/* Test Offline Simulation Toggle */}
          <div className="pt-3 border-t border-slate-700/60 flex items-center justify-between">
            <div>
              <div className="text-xs font-bold text-white">Simulate Offline Mode</div>
              <div className="text-[11px] text-slate-400">
                {isSimulatedOffline
                  ? 'Currently disconnected — running purely on local cache.'
                  : 'Toggle to test how the app behaves without internet connection.'}
              </div>
            </div>

            <button
              onClick={() => {
                soundManager.playClick();
                onToggleSimulatedOffline(!isSimulatedOffline);
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                isSimulatedOffline
                  ? 'bg-amber-500 text-slate-950 font-extrabold shadow-md'
                  : 'bg-slate-700 text-slate-300 hover:text-white'
              }`}
            >
              {isSimulatedOffline ? <WifiOff className="w-3.5 h-3.5" /> : <Wifi className="w-3.5 h-3.5" />}
              <span>{isSimulatedOffline ? 'Offline Mode Active' : 'Go Offline'}</span>
            </button>
          </div>
        </div>

        {/* Section 3: Self-Hosting / Deployment Info */}
        <div className="p-3.5 rounded-xl bg-slate-800/30 border border-slate-800 text-[11px] text-slate-400 space-y-1">
          <div className="font-bold text-slate-300">For Self-Hosting / Production Deploy:</div>
          <div>
            Run <code className="text-amber-300 bg-slate-900 px-1 py-0.5 rounded">npm run build</code> to generate the optimized, precached PWA package into the <code className="text-amber-300">dist/</code> directory.
          </div>
        </div>
      </div>
    </div>
  );
};
