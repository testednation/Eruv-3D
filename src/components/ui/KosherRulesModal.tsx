import React from 'react';
import { Sparkles, X, Eye } from 'lucide-react';
import { soundManager } from '../../utils/audio';
import { KosherVisualizer } from './KosherVisualizer';

interface KosherRulesModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultRule?: string;
}

export const KosherRulesModal: React.FC<KosherRulesModalProps> = ({
  isOpen,
  onClose,
  defaultRule = 'overhead',
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="bg-slate-900 border border-slate-700 rounded-3xl p-5 sm:p-6 shadow-2xl max-w-2xl w-full max-h-[88vh] flex flex-col text-slate-100 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-emerald-500/20 text-emerald-400 rounded-xl">
              <Eye className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-serif font-bold text-white">
                  Real-Time Kosher vs. Pasul Guide
                </h2>
                <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Visual Rules
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Pictures & architectural schematics showing what is halachically valid or invalid
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              soundManager.playClick();
              onClose();
            }}
            className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content: Full interactive KosherVisualizer with all category pills */}
        <div className="overflow-y-auto pr-1 flex-1 space-y-4">
          <KosherVisualizer currentRule={defaultRule} isCompact={false} />

          <div className="p-3.5 bg-slate-800/60 border border-slate-700/60 rounded-2xl text-xs text-slate-300 space-y-1.5 leading-relaxed">
            <div className="font-bold text-amber-300 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>How Rabbis & Inspectors Certify an Eruv:</span>
            </div>
            <p>
              Before every single Shabbat, inspectors drive or walk the entire perimeter loop. If a storm snaps even one wire, or a construction crew clips a wire onto a side bracket instead of running it directly over the top of the pole, the eruv is declared <strong>Pasul (Invalid)</strong> and the community is alerted that carrying outside is prohibited.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-4 pt-3 border-t border-slate-800 flex justify-end">
          <button
            onClick={() => {
              soundManager.playClick();
              onClose();
            }}
            className="px-5 py-2 text-xs font-semibold text-slate-950 bg-amber-500 hover:bg-amber-400 rounded-xl transition-all shadow-md cursor-pointer"
          >
            Got It!
          </button>
        </div>
      </div>
    </div>
  );
};
