import React, { useState } from 'react';
import { CheckCircle2, XCircle, Info, ChevronRight, Sparkles } from 'lucide-react';
import { soundManager } from '../../utils/audio';

export interface KosherRuleComparison {
  id: string;
  title: string;
  hebrewTerm: string;
  kosherLabel: string;
  kosherDesc: string;
  pasulLabel: string;
  pasulDesc: string;
  type: 'overhead' | 'broken' | 'leaning' | 'lavud' | 'matzah' | 'height';
}

export const KOSHER_COMPARISONS: KosherRuleComparison[] = [
  {
    id: 'overhead',
    title: 'Wire Alignment: Top vs. Side ("Al Gabav")',
    hebrewTerm: 'על גביו ולא מן הצד',
    kosherLabel: 'KOSHER: Directly Overhead',
    kosherDesc: 'The wire rests directly over the center top of the post or sits inside a grooved top cap. This forms a true legal doorway.',
    pasulLabel: 'PASUL: Attached to Side Bracket',
    pasulDesc: 'Fastening the wire to an eyebolt or screw on the side of the pole fails the architectural form of a doorway.',
    type: 'overhead',
  },
  {
    id: 'broken',
    title: 'Perimeter Continuity: Unbroken vs. Snapped',
    hebrewTerm: 'נפסקה הקורה / פירצה',
    kosherLabel: 'KOSHER: Continuous Loop',
    kosherDesc: 'A taut, unbroken cable spans from post to post with zero physical breaches around the entire sector.',
    pasulLabel: 'PASUL: Broken or Fallen Cable',
    pasulDesc: 'Even a 1-millimeter gap or broken wire hanging down immediately breaches the private domain for all residents.',
    type: 'broken',
  },
  {
    id: 'leaning',
    title: 'Post Alignment: Upright vs. Slanted',
    hebrewTerm: 'לחי עומד',
    kosherLabel: 'KOSHER: Vertical Upright Post',
    kosherDesc: 'The post stands upright perpendicular to the ground, allowing the virtual wall (Gud Asek) to project straight up.',
    pasulLabel: 'PASUL: Severe Tilt / Leaning Angle',
    pasulDesc: 'A pole bent or tilted excessively cannot form a valid vertical doorpost plane.',
    type: 'leaning',
  },
  {
    id: 'lavud',
    title: 'Gap Sizing: Under 3 Tefachim ("Lavud")',
    hebrewTerm: 'לָבוּד',
    kosherLabel: 'KOSHER: Gap < 3 Tefachim (< 9.4 in)',
    kosherDesc: 'Picket fences with narrow gaps are halachically regarded as 100% solid, unbroken walls.',
    pasulLabel: 'PASUL: Gap ≥ 3 Tefachim (≥ 9.4 in)',
    pasulDesc: 'Open gaps 3 tefachim or wider are treated as open holes in the perimeter.',
    type: 'lavud',
  },
  {
    id: 'matzah',
    title: 'Communal Partnership: Dedicated Food vs. Missing',
    hebrewTerm: 'עירובי חצרות',
    kosherLabel: 'KOSHER: Communal Matzah Dedicated',
    kosherDesc: 'A common box of shelf-stable Matzah is acquired on behalf of all residents, uniting all houses into one home.',
    pasulLabel: 'PASUL: Missing Food Partnership',
    pasulDesc: 'Without the shared food deposit, private homes remain legally isolated and carrying outside is forbidden.',
    type: 'matzah',
  },
];

interface KosherVisualizerProps {
  currentRule?: string;
  isCompact?: boolean;
}

export const KosherVisualizer: React.FC<KosherVisualizerProps> = ({
  currentRule = 'overhead',
  isCompact = false,
}) => {
  const [selectedRuleId, setSelectedRuleId] = useState<string>(currentRule);

  const activeRule = KOSHER_COMPARISONS.find(r => r.id === selectedRuleId) || KOSHER_COMPARISONS[0];

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-4 sm:p-5 text-slate-100 shadow-xl">
      {/* Title */}
      <div className="flex items-center justify-between gap-2 border-b border-slate-800 pb-3 mb-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-white font-serif">
              Real-Time Kosher vs. Pasul Visualizer
            </h4>
            <div className="text-[10px] text-slate-400">Visual architectural reference diagrams</div>
          </div>
        </div>

        {/* Category selector pills */}
        {!isCompact && (
          <div className="flex flex-wrap gap-1">
            {KOSHER_COMPARISONS.map(r => (
              <button
                key={r.id}
                onClick={() => {
                  soundManager.playClick();
                  setSelectedRuleId(r.id);
                }}
                className={`px-2 py-1 text-[10px] rounded-lg font-medium transition-colors cursor-pointer ${
                  selectedRuleId === r.id
                    ? 'bg-amber-500 text-slate-950 font-bold'
                    : 'bg-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                {r.title.split(':')[0]}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Side-by-side comparison graphics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* KOSHER PANEL (GREEN) */}
        <div className="p-3.5 rounded-2xl bg-emerald-950/30 border border-emerald-500/40 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{activeRule.kosherLabel}</span>
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                VALID
              </span>
            </div>

            {/* SVG Illustration for Kosher */}
            <div className="bg-slate-950/80 rounded-xl p-3 border border-emerald-500/20 flex items-center justify-center my-2">
              {activeRule.type === 'overhead' && (
                <svg viewBox="0 0 160 110" className="w-full max-w-[140px] h-24">
                  <line x1="10" y1="100" x2="150" y2="100" stroke="#475569" strokeWidth="3" />
                  {/* Upright Post */}
                  <rect x="74" y="24" width="12" height="76" rx="2" fill="#38bdf8" />
                  <rect x="71" y="20" width="18" height="6" rx="1" fill="#94a3b8" />
                  {/* Overhead Wire */}
                  <line x1="10" y1="14" x2="150" y2="14" stroke="#10b981" strokeWidth="4" />
                  {/* Virtual alignment arrow */}
                  <path d="M 80 14 L 80 20" stroke="#34d399" strokeWidth="2" strokeDasharray="2 2" />
                  <circle cx="80" cy="14" r="4" fill="#10b981" />
                  <text x="80" y="8" fill="#10b981" fontSize="8" fontWeight="bold" textAnchor="middle">Directly Over Center</text>
                </svg>
              )}

              {activeRule.type === 'broken' && (
                <svg viewBox="0 0 160 110" className="w-full max-w-[140px] h-24">
                  <line x1="10" y1="100" x2="150" y2="100" stroke="#475569" strokeWidth="3" />
                  <rect x="25" y="24" width="10" height="76" rx="2" fill="#38bdf8" />
                  <rect x="125" y="24" width="10" height="76" rx="2" fill="#38bdf8" />
                  {/* Taut Wire */}
                  <line x1="15" y1="20" x2="145" y2="20" stroke="#10b981" strokeWidth="3.5" />
                  <text x="80" y="14" fill="#10b981" fontSize="8" fontWeight="bold" textAnchor="middle">Continuous & Taut</text>
                </svg>
              )}

              {activeRule.type === 'leaning' && (
                <svg viewBox="0 0 160 110" className="w-full max-w-[140px] h-24">
                  <line x1="10" y1="100" x2="150" y2="100" stroke="#475569" strokeWidth="3" />
                  {/* Upright 90 degree post */}
                  <rect x="74" y="24" width="12" height="76" rx="2" fill="#38bdf8" />
                  <line x1="10" y1="16" x2="150" y2="16" stroke="#10b981" strokeWidth="3" />
                  {/* 90 deg angle indicator */}
                  <path d="M 86 90 L 92 90 L 92 100" fill="none" stroke="#10b981" strokeWidth="1.5" />
                  <text x="80" y="10" fill="#10b981" fontSize="8" fontWeight="bold" textAnchor="middle">Perpendicular (90°)</text>
                </svg>
              )}

              {activeRule.type === 'lavud' && (
                <svg viewBox="0 0 160 110" className="w-full max-w-[140px] h-24">
                  <line x1="10" y1="100" x2="150" y2="100" stroke="#475569" strokeWidth="3" />
                  {/* Picket slats with gap < 3 tefachim */}
                  <rect x="40" y="30" width="10" height="70" fill="#f8fafc" rx="1" />
                  <rect x="62" y="30" width="10" height="70" fill="#f8fafc" rx="1" />
                  <rect x="84" y="30" width="10" height="70" fill="#f8fafc" rx="1" />
                  <rect x="106" y="30" width="10" height="70" fill="#f8fafc" rx="1" />
                  <rect x="50" y="30" width="12" height="70" fill="#10b981" opacity="0.2" />
                  <text x="80" y="20" fill="#10b981" fontSize="8" fontWeight="bold" textAnchor="middle">Gaps &lt; 9.4 in = Solid Wall</text>
                </svg>
              )}

              {activeRule.type === 'matzah' && (
                <svg viewBox="0 0 160 110" className="w-full max-w-[140px] h-24">
                  <rect x="50" y="45" width="60" height="30" rx="3" fill="#ca8a04" stroke="#eab308" strokeWidth="2" />
                  <rect x="52" y="55" width="56" height="8" fill="#1e3a8a" />
                  <text x="80" y="62" fill="#ffffff" fontSize="7" fontWeight="bold" textAnchor="middle">MATZAH</text>
                  <circle cx="80" cy="32" r="8" fill="#10b981" />
                  <path d="M 76 32 L 79 35 L 85 29" stroke="#ffffff" strokeWidth="2" fill="none" />
                  <text x="80" y="92" fill="#10b981" fontSize="8" fontWeight="bold" textAnchor="middle">Communal Food Union</text>
                </svg>
              )}
            </div>

            <p className="text-[11px] text-emerald-200/90 leading-relaxed">
              {activeRule.kosherDesc}
            </p>
          </div>
        </div>

        {/* PASUL PANEL (RED) */}
        <div className="p-3.5 rounded-2xl bg-rose-950/30 border border-rose-500/40 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-rose-400 flex items-center gap-1.5">
                <XCircle className="w-4 h-4 text-rose-400 shrink-0" />
                <span>{activeRule.pasulLabel}</span>
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30">
                INVALID
              </span>
            </div>

            {/* SVG Illustration for Pasul */}
            <div className="bg-slate-950/80 rounded-xl p-3 border border-rose-500/20 flex items-center justify-center my-2">
              {activeRule.type === 'overhead' && (
                <svg viewBox="0 0 160 110" className="w-full max-w-[140px] h-24">
                  <line x1="10" y1="100" x2="150" y2="100" stroke="#475569" strokeWidth="3" />
                  {/* Upright Post */}
                  <rect x="74" y="24" width="12" height="76" rx="2" fill="#38bdf8" />
                  {/* Side bracket */}
                  <rect x="86" y="45" width="12" height="6" fill="#ef4444" />
                  {/* Wire clipped to side */}
                  <line x1="10" y1="48" x2="150" y2="48" stroke="#ef4444" strokeWidth="4" />
                  <circle cx="92" cy="48" r="4" fill="#ef4444" />
                  <text x="80" y="16" fill="#ef4444" fontSize="8" fontWeight="bold" textAnchor="middle">Side Bracket (No Doorway)</text>
                </svg>
              )}

              {activeRule.type === 'broken' && (
                <svg viewBox="0 0 160 110" className="w-full max-w-[140px] h-24">
                  <line x1="10" y1="100" x2="150" y2="100" stroke="#475569" strokeWidth="3" />
                  <rect x="25" y="24" width="10" height="76" rx="2" fill="#38bdf8" />
                  <rect x="125" y="24" width="10" height="76" rx="2" fill="#38bdf8" />
                  {/* Broken Dangling Wire */}
                  <path d="M 25 24 Q 45 40 55 80" stroke="#ef4444" strokeWidth="3" fill="none" />
                  <path d="M 125 24 Q 105 40 95 85" stroke="#ef4444" strokeWidth="3" fill="none" />
                  <text x="80" y="14" fill="#ef4444" fontSize="8" fontWeight="bold" textAnchor="middle">Snapped Wire Gap (Pirtzah)</text>
                </svg>
              )}

              {activeRule.type === 'leaning' && (
                <svg viewBox="0 0 160 110" className="w-full max-w-[140px] h-24">
                  <line x1="10" y1="100" x2="150" y2="100" stroke="#475569" strokeWidth="3" />
                  {/* Severely leaning post */}
                  <g transform="rotate(25 80 100)">
                    <rect x="74" y="24" width="12" height="76" rx="2" fill="#ef4444" />
                  </g>
                  <line x1="10" y1="16" x2="150" y2="16" stroke="#ef4444" strokeWidth="3" />
                  <text x="80" y="10" fill="#ef4444" fontSize="8" fontWeight="bold" textAnchor="middle">Leaning Post (&gt; 20° Tilt)</text>
                </svg>
              )}

              {activeRule.type === 'lavud' && (
                <svg viewBox="0 0 160 110" className="w-full max-w-[140px] h-24">
                  <line x1="10" y1="100" x2="150" y2="100" stroke="#475569" strokeWidth="3" />
                  {/* Wide gaps */}
                  <rect x="25" y="30" width="10" height="70" fill="#f8fafc" rx="1" />
                  <rect x="80" y="30" width="10" height="70" fill="#f8fafc" rx="1" />
                  <rect x="135" y="30" width="10" height="70" fill="#f8fafc" rx="1" />
                  <text x="52" y="65" fill="#ef4444" fontSize="8" fontWeight="bold" textAnchor="middle">GAP &gt; 9.4"</text>
                  <text x="80" y="20" fill="#ef4444" fontSize="8" fontWeight="bold" textAnchor="middle">Breach (Lavud Fails)</text>
                </svg>
              )}

              {activeRule.type === 'matzah' && (
                <svg viewBox="0 0 160 110" className="w-full max-w-[140px] h-24">
                  <rect x="50" y="45" width="60" height="30" rx="3" fill="#334155" stroke="#ef4444" strokeWidth="2" strokeDasharray="4 4" />
                  <circle cx="80" cy="60" r="10" fill="#ef4444" opacity="0.3" />
                  <line x1="72" y1="52" x2="88" y2="68" stroke="#ef4444" strokeWidth="2.5" />
                  <line x1="88" y1="52" x2="72" y2="68" stroke="#ef4444" strokeWidth="2.5" />
                  <text x="80" y="92" fill="#ef4444" fontSize="8" fontWeight="bold" textAnchor="middle">Missing Food Union</text>
                </svg>
              )}
            </div>

            <p className="text-[11px] text-rose-200/90 leading-relaxed">
              {activeRule.pasulDesc}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
