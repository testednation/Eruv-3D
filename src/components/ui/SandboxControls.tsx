import React, { useState } from 'react';
import { soundManager } from '../../utils/audio';
import { 
  Sliders, 
  CheckCircle2, 
  XCircle, 
  Info, 
  Ruler, 
  Sparkles, 
  ShieldCheck, 
  ShieldAlert,
  HelpCircle,
  Eye
} from 'lucide-react';

interface SandboxControlsProps {
  onKosherDoorwayBuilt?: () => void;
}

export const SandboxControls: React.FC<SandboxControlsProps> = ({ onKosherDoorwayBuilt }) => {
  // Sandbox parameters
  const [wirePosition, setWirePosition] = useState<'overhead' | 'side' | 'offset'>('overhead');
  const [postHeightTefachim, setPostHeightTefachim] = useState<number>(12); // min 10
  const [gapWidthAmot, setGapWidthAmot] = useState<number>(8); // max 10 without petach
  const [slatDistanceInches, setSlatDistanceInches] = useState<number>(2.5); // < 9.4 inches for lavud
  const [hasMatzah, setHasMatzah] = useState<boolean>(true);

  // Halachic evaluations
  const isOverheadValid = wirePosition === 'overhead';
  const isHeightValid = postHeightTefachim >= 10;
  const isGapValid = gapWidthAmot <= 10 || isOverheadValid;
  const isLavudValid = slatDistanceInches <= 9.4;
  const isOverallKosher = isOverheadValid && isHeightValid && isGapValid && hasMatzah;

  React.useEffect(() => {
    if (isOverallKosher && onKosherDoorwayBuilt) {
      onKosherDoorwayBuilt();
    }
  }, [isOverallKosher, onKosherDoorwayBuilt]);

  return (
    <div className="relative w-full max-w-5xl mx-auto p-3 sm:p-6 text-slate-100">
      {/* Title */}
      <div className="text-center max-w-2xl mx-auto mb-6">
        <span className="text-[11px] font-bold uppercase tracking-wider text-sky-400 bg-sky-950/60 px-3 py-1 rounded-full border border-sky-800">
          Halachic Architecture Sandbox
        </span>
        <h2 className="text-2xl sm:text-3xl font-serif font-bold text-white mt-2">
          Design & Test a Kosher Doorway (Tzurat HaPetach)
        </h2>
        <p className="text-xs sm:text-sm text-slate-300 mt-1">
          Adjust the physical measurements and alignment to see how ancient Talmudic architectural rules translate into real engineering.
        </p>
      </div>

      {/* Main Validity Meter */}
      <div className={`mb-6 p-5 rounded-3xl border shadow-2xl transition-all ${
        isOverallKosher 
          ? 'bg-emerald-950/50 border-emerald-500/50' 
          : 'bg-rose-950/50 border-rose-500/50'
      }`}>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className={`p-3 rounded-2xl ${
              isOverallKosher ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'
            }`}>
              {isOverallKosher ? <ShieldCheck className="w-8 h-8" /> : <ShieldAlert className="w-8 h-8" />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono uppercase tracking-wider text-slate-400">Doorway Construction Status</span>
                <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                  isOverallKosher ? 'bg-emerald-500/20 text-emerald-300' : 'bg-rose-500/20 text-rose-300'
                }`}>
                  {isOverallKosher ? '🟢 KOSHER (Valid Doorway)' : '🔴 PASUL (Invalid Construction)'}
                </span>
              </div>
              <h3 className="text-lg font-serif font-bold text-white mt-0.5">
                {isOverallKosher
                  ? 'The Tzurat HaPetach satisfies all halachic criteria!'
                  : 'Correction Required: One or more halachic requirements are breached.'}
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="text-right">
              <div className="text-[10px] uppercase font-bold text-slate-400">Talmudic Standard</div>
              <div className="text-xs font-mono text-amber-300">Talmud Eruvin 11b</div>
            </div>
          </div>
        </div>
      </div>

      {/* Real-Time Live Architectural Diagram */}
      <div className="mb-6 p-5 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl">
        <div className="flex items-center justify-between mb-3 border-b border-slate-800 pb-2">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-sky-400">
              Live Architectural Blueprint
            </span>
            <span className="text-[10px] text-slate-400">(Updates in Real-Time as you move controls)</span>
          </div>

          <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${
            isOverallKosher ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' : 'bg-rose-500/20 text-rose-300 border-rose-500/40'
          }`}>
            {isOverallKosher ? '✓ KOSHER GEOMETRY' : '✕ PASUL GEOMETRY'}
          </span>
        </div>

        {/* Dynamic SVG Canvas */}
        <div className="bg-slate-950 rounded-2xl p-4 border border-slate-800/80 flex items-center justify-center overflow-x-auto">
          <svg viewBox="0 0 460 200" className="w-full max-w-xl h-auto">
            {/* Ground Line */}
            <line x1="20" y1="180" x2="440" y2="180" stroke="#475569" strokeWidth="4" />
            <text x="230" y="195" fill="#64748b" fontSize="9" textAnchor="middle">Ground Line (Karka Olam)</text>

            {/* Post Height calculation: 10 tefachim is ~80px tall, scaled */}
            {(() => {
              const svgHeight = Math.min(130, Math.max(35, postHeightTefachim * 7.5));
              const postTopY = 180 - svgHeight;
              const leftPostX = 80;
              const rightPostX = 360;

              // Wire Y coordinates
              let wireY = postTopY - 4;
              let wireStartX = 50;
              let wireEndX = 390;
              let wireColor = isOverallKosher ? '#10b981' : '#ef4444';

              if (wirePosition === 'side') {
                wireY = postTopY + 24; // Side bracket lower down
              } else if (wirePosition === 'offset') {
                wireStartX = 110; // Shifted sideways
                wireEndX = 420;
              }

              return (
                <g>
                  {/* Virtual Halachic Wall (Gud Asek) */}
                  <rect
                    x={leftPostX + 16}
                    y={postTopY}
                    width={rightPostX - (leftPostX + 16)}
                    height={svgHeight}
                    fill={isOverallKosher ? '#10b981' : '#ef4444'}
                    opacity={isOverallKosher ? 0.15 : 0.05}
                    stroke={isOverallKosher ? '#10b981' : '#ef4444'}
                    strokeDasharray={isOverallKosher ? 'none' : '4 4'}
                    strokeWidth="1"
                  />
                  <text x="225" y={180 - svgHeight / 2} fill={isOverallKosher ? '#10b981' : '#ef4444'} fontSize="10" fontWeight="bold" textAnchor="middle">
                    {isOverallKosher ? 'GUD ASEK (Virtual Wall Active)' : 'VIRTUAL WALL BREACHED'}
                  </text>

                  {/* Left Post */}
                  <rect
                    x={leftPostX}
                    y={postTopY}
                    width="16"
                    height={svgHeight}
                    rx="3"
                    fill={isHeightValid ? '#38bdf8' : '#ef4444'}
                  />
                  {/* Left Top Cap */}
                  <rect
                    x={leftPostX - 2}
                    y={postTopY - 4}
                    width="20"
                    height="6"
                    rx="1"
                    fill="#94a3b8"
                  />

                  {/* Right Post */}
                  <rect
                    x={rightPostX}
                    y={postTopY}
                    width="16"
                    height={svgHeight}
                    rx="3"
                    fill={isHeightValid ? '#38bdf8' : '#ef4444'}
                  />
                  {/* Right Top Cap */}
                  <rect
                    x={rightPostX - 2}
                    y={postTopY - 4}
                    width="20"
                    height="6"
                    rx="1"
                    fill="#94a3b8"
                  />

                  {/* Side brackets if wirePosition is side */}
                  {wirePosition === 'side' && (
                    <>
                      <rect x={leftPostX + 16} y={wireY - 2} width="12" height="6" fill="#ef4444" />
                      <rect x={rightPostX + 16} y={wireY - 2} width="12" height="6" fill="#ef4444" />
                    </>
                  )}

                  {/* The Overhead Wire */}
                  <line
                    x1={wireStartX}
                    y1={wireY}
                    x2={wireEndX}
                    y2={wireY}
                    stroke={wireColor}
                    strokeWidth="4"
                    strokeLinecap="round"
                  />

                  {/* Wire Attachment Marker Dots */}
                  <circle cx={leftPostX + 8} cy={wirePosition === 'side' ? wireY : postTopY - 4} r="4" fill={isOverheadValid ? '#10b981' : '#ef4444'} />
                  <circle cx={rightPostX + 8} cy={wirePosition === 'side' ? wireY : postTopY - 4} r="4" fill={isOverheadValid ? '#10b981' : '#ef4444'} />

                  {/* Height Indicator Label */}
                  <line x1="60" y1={postTopY} x2="60" y2="180" stroke="#94a3b8" strokeWidth="1" strokeDasharray="2 2" />
                  <text x="50" y={180 - svgHeight / 2} fill={isHeightValid ? '#38bdf8' : '#ef4444'} fontSize="9" fontWeight="bold" textAnchor="middle">
                    {postHeightTefachim}T
                  </text>

                  {/* Width Indicator Label */}
                  <line x1={leftPostX} y1="170" x2={rightPostX + 16} y2="170" stroke="#94a3b8" strokeWidth="1" strokeDasharray="2 2" />
                  <text x="225" y="165" fill="#94a3b8" fontSize="9" textAnchor="middle">
                    Gap: {gapWidthAmot} Amot
                  </text>
                </g>
              );
            })()}

            {/* Matzah Box Status Badge inside graphic */}
            <g transform="translate(385, 20)">
              <rect x="0" y="0" width="60" height="26" rx="4" fill="#0f172a" stroke={hasMatzah ? '#10b981' : '#ef4444'} strokeWidth="1.5" />
              <text x="30" y="16" fill={hasMatzah ? '#10b981' : '#ef4444'} fontSize="8" fontWeight="bold" textAnchor="middle">
                {hasMatzah ? '🍞 Matzah ✓' : '🍞 Missing ✕'}
              </text>
            </g>
          </svg>
        </div>
      </div>

      {/* Control Sliders & Interactive Toggles */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {/* Parameter 1: Wire Alignment (Al Gabav) */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-xl">
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-300">
              1. Wire Attachment ("Al Gabav")
            </label>
            {isOverheadValid ? (
              <span className="text-xs font-bold text-emerald-400 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Kosher
              </span>
            ) : (
              <span className="text-xs font-bold text-rose-400 flex items-center gap-1">
                <XCircle className="w-3.5 h-3.5" /> Pasul
              </span>
            )}
          </div>
          <p className="text-xs text-slate-400 mb-3">
            Talmudic Rule: A doorway lintel must sit directly over the doorposts, not affixed to the side.
          </p>

          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => {
                soundManager.playClick();
                setWirePosition('overhead');
              }}
              className={`p-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                wirePosition === 'overhead'
                  ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300'
                  : 'bg-slate-800/60 border-slate-700 text-slate-400 hover:text-white'
              }`}
            >
              Directly on Top (Kosher)
            </button>
            <button
              onClick={() => {
                soundManager.playClick();
                setWirePosition('side');
              }}
              className={`p-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                wirePosition === 'side'
                  ? 'bg-rose-500/20 border-rose-500 text-rose-300'
                  : 'bg-slate-800/60 border-slate-700 text-slate-400 hover:text-white'
              }`}
            >
              Side Bracket (Pasul)
            </button>
            <button
              onClick={() => {
                soundManager.playClick();
                setWirePosition('offset');
              }}
              className={`p-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                wirePosition === 'offset'
                  ? 'bg-rose-500/20 border-rose-500 text-rose-300'
                  : 'bg-slate-800/60 border-slate-700 text-slate-400 hover:text-white'
              }`}
            >
              Offset by 2 inches (Pasul)
            </button>
          </div>
        </div>

        {/* Parameter 2: Post Height (Asarah Tefachim) */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-xl">
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-300">
              2. Post Height: {postHeightTefachim} Tefachim (~{(postHeightTefachim * 3.5).toFixed(0)} inches)
            </label>
            {isHeightValid ? (
              <span className="text-xs font-bold text-emerald-400 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> &ge; 10 Tefachim (Kosher)
              </span>
            ) : (
              <span className="text-xs font-bold text-rose-400 flex items-center gap-1">
                <XCircle className="w-3.5 h-3.5" /> Under 10 Tefachim (Pasul)
              </span>
            )}
          </div>
          <p className="text-xs text-slate-400 mb-3">
            Minimum legal partition height: 10 Tefachim (~32 to 40 inches / 80-100 cm).
          </p>

          <input
            type="range"
            min={4}
            max={25}
            value={postHeightTefachim}
            onChange={(e) => {
              setPostHeightTefachim(Number(e.target.value));
            }}
            className="w-full accent-sky-500 cursor-pointer"
          />
          <div className="flex justify-between text-[10px] text-slate-500 font-mono mt-1">
            <span>4 Tefachim (Too Low)</span>
            <span className="text-amber-400 font-bold">10 Tefachim Threshold</span>
            <span>25 Tefachim</span>
          </div>
        </div>

        {/* Parameter 3: Gap Width (Pirtzah vs Petach) */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-xl">
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-300">
              3. Gap Width: {gapWidthAmot} Amot (~{(gapWidthAmot * 1.5).toFixed(0)} feet)
            </label>
            {isGapValid ? (
              <span className="text-xs font-bold text-emerald-400 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Kosher
              </span>
            ) : (
              <span className="text-xs font-bold text-rose-400 flex items-center gap-1">
                <XCircle className="w-3.5 h-3.5" /> Breach &gt; 10 Amot (Pasul)
              </span>
            )}
          </div>
          <p className="text-xs text-slate-400 mb-3">
            An open gap without doorposts can only be up to 10 Amot (~15 ft). Any wider gap MUST have a Tzurat HaPetach.
          </p>

          <input
            type="range"
            min={2}
            max={20}
            value={gapWidthAmot}
            onChange={(e) => {
              setGapWidthAmot(Number(e.target.value));
            }}
            className="w-full accent-sky-500 cursor-pointer"
          />
          <div className="flex justify-between text-[10px] text-slate-500 font-mono mt-1">
            <span>2 Amot (~3 ft)</span>
            <span className="text-amber-400 font-bold">10 Amot Limit (~15 ft)</span>
            <span>20 Amot (~30 ft)</span>
          </div>
        </div>

        {/* Parameter 4: Fence Slat Gap (The Lavud Principle) */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-xl">
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-300">
              4. Fence Slat Gap: {slatDistanceInches} inches
            </label>
            {isLavudValid ? (
              <span className="text-xs font-bold text-emerald-400 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Lavud Applies (&lt; 3 Tefachim)
              </span>
            ) : (
              <span className="text-xs font-bold text-rose-400 flex items-center gap-1">
                <XCircle className="w-3.5 h-3.5" /> Gap is Open (&ge; 3 Tefachim)
              </span>
            )}
          </div>
          <p className="text-xs text-slate-400 mb-3">
            "Lavud": Any gap under 3 Tefachim (~9.4 in) is legally considered solid wall.
          </p>

          <input
            type="range"
            min={1}
            max={15}
            step={0.5}
            value={slatDistanceInches}
            onChange={(e) => {
              setSlatDistanceInches(Number(e.target.value));
            }}
            className="w-full accent-sky-500 cursor-pointer"
          />
          <div className="flex justify-between text-[10px] text-slate-500 font-mono mt-1">
            <span>1 in (Solid)</span>
            <span className="text-amber-400 font-bold">9.4 in (3 Tefachim)</span>
            <span>15 in (Open Gap)</span>
          </div>
        </div>
      </div>

      {/* Parameter 5: Communal Eruv Chatzerot Matzah */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-xl flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
            5. Communal Food Requirement (Eruv Chatzerot)
          </div>
          <div className="text-sm font-semibold text-white">
            Has the communal box of Matzah been dedicated on behalf of all residents?
          </div>
        </div>

        <button
          onClick={() => {
            soundManager.playClick();
            setHasMatzah(!hasMatzah);
          }}
          className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
            hasMatzah
              ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300'
              : 'bg-rose-500/20 border-rose-500 text-rose-300'
          }`}
        >
          {hasMatzah ? '✓ Matzah Dedicated (Kosher)' : '✕ Missing Matzah (Pasul)'}
        </button>
      </div>
    </div>
  );
};
