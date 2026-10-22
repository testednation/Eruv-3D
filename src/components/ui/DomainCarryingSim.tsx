import React, { useState } from 'react';
import { SHABBAT_DOMAINS } from '../../data/eruvData';
import { soundManager } from '../../utils/audio';
import { 
  ArrowRight, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  Home, 
  Car, 
  Trees, 
  Flame, 
  HelpCircle,
  Sparkles
} from 'lucide-react';

interface CarryingItem {
  id: string;
  name: string;
  icon: string;
  isMuktzeh: boolean;
  notes: string;
}

const ITEMS: CarryingItem[] = [
  { id: 'stroller', name: 'Baby in Stroller', icon: '👶', isMuktzeh: false, notes: 'Essential for young families on Shabbat' },
  { id: 'siddur', name: 'Prayer Book (Siddur)', icon: '📖', isMuktzeh: false, notes: 'Needed for Shabbat services' },
  { id: 'keys', name: 'House Keys', icon: '🔑', isMuktzeh: false, notes: 'Allows locking home safely' },
  { id: 'medicine', name: 'Inhaler / Medicine', icon: '💊', isMuktzeh: false, notes: 'Health needs for day' },
  { id: 'phone', name: 'Smartphone', icon: '📱', isMuktzeh: true, notes: 'MUKTZEH: Forbidden to carry even within an eruv!' },
  { id: 'umbrella', name: 'Open Umbrella', icon: '☂️', isMuktzeh: true, notes: 'Constructing a temporary roof (Ohel) is prohibited' },
];

export const DomainCarryingSim: React.FC = () => {
  const [selectedFromDomain, setSelectedFromDomain] = useState<string>('reshut-hayachid');
  const [selectedToDomain, setSelectedToDomain] = useState<string>('karmelit');
  const [selectedItem, setSelectedItem] = useState<CarryingItem>(ITEMS[0]);
  const [hasEruv, setHasEruv] = useState<boolean>(true);

  const fromDomain = SHABBAT_DOMAINS.find(d => d.id === selectedFromDomain)!;
  const toDomain = SHABBAT_DOMAINS.find(d => d.id === selectedToDomain)!;

  // Compute halachic ruling
  const getRuling = () => {
    if (selectedItem.isMuktzeh) {
      return {
        status: 'prohibited',
        badge: 'FORBIDDEN (MUKTZEH)',
        badgeColor: 'bg-rose-500/20 text-rose-400 border-rose-500/30',
        title: 'Muktzeh Restriction Violates Shabbat Laws',
        explanation: `${selectedItem.name} is "Muktzeh" (set aside from Shabbat use). An Eruv only removes the prohibition of transferring between domains (Hotza'ah); it NEVER permits handling Muktzeh items like phones, wallets, or forbidden equipment!`,
        source: 'Talmud Shabbat 123b; Shulchan Aruch OC 308',
      };
    }

    if (selectedFromDomain === selectedToDomain && selectedFromDomain === 'reshut-hayachid') {
      return {
        status: 'permitted',
        badge: 'PERMITTED',
        badgeColor: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
        title: 'Carrying Within a Private Domain',
        explanation: 'Carrying entirely within an enclosed Private Domain (e.g. inside your house, private fenced yard, or building) is 100% permitted by Biblical and Rabbinic law.',
        source: 'Talmud Shabbat 96a',
      };
    }

    if (toDomain.id === 'mekom-petur' || fromDomain.id === 'mekom-petur') {
      return {
        status: 'exempt',
        badge: 'EXEMPT (PERMITTED)',
        badgeColor: 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30',
        title: 'Mekom Petur is an Exempt Domain',
        explanation: 'Because a Mekom Petur (like a tall narrow fire hydrant or bollard) is smaller than 4x4 tefachim and higher than 3 tefachim, Biblical and Rabbinic carrying laws do not classify transfer to/from it as a domain violation.',
        source: 'Talmud Shabbat 6a; Shulchan Aruch OC 345:18',
      };
    }

    // Between Reshut HaYachid and Reshut HaRabim
    if (
      (selectedFromDomain === 'reshut-hayachid' && selectedToDomain === 'reshut-harabim') ||
      (selectedFromDomain === 'reshut-harabim' && selectedToDomain === 'reshut-hayachid')
    ) {
      return {
        status: 'biblical_prohibition',
        badge: 'BIBLICAL PROHIBITION (D\'ORAITA)',
        badgeColor: 'bg-rose-600/30 text-rose-300 border-rose-500/40',
        title: 'Direct Torah Violation of Hotza\'ah!',
        explanation: 'Transferring an object between a true Private Domain (Reshut HaYachid) and a true Biblical Public Domain (Reshut HaRabim) is one of the 39 Melachot explicitly derived from the construction of the Tabernacle (Mishkan). A standard eruv wire cannot enclose a true Biblical Reshut HaRabim without actual closing gates according to many authorities.',
        source: 'Exodus 36:6; Talmud Shabbat 96b',
      };
    }

    // Between Reshut HaYachid and Karmelit (Suburban street/park)
    if (
      (selectedFromDomain === 'reshut-hayachid' && selectedToDomain === 'karmelit') ||
      (selectedFromDomain === 'karmelit' && selectedToDomain === 'reshut-hayachid') ||
      (selectedFromDomain === 'karmelit' && selectedToDomain === 'karmelit')
    ) {
      if (hasEruv) {
        return {
          status: 'permitted_with_eruv',
          badge: 'PERMITTED VIA KOSHER ERUV',
          badgeColor: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
          title: 'Transformed into One Private Domain!',
          explanation: 'The Tzurat HaPetach eruv perimeter and the communal Eruv Chatzerot matzah symbolically transform the entire suburban neighborhood (Karmelit) into one giant shared Reshut HaYachid. Carrying is now fully kosher and celebrated!',
          source: 'Talmud Eruvin 11b, 49a; Shulchan Aruch OC 362',
        };
      } else {
        return {
          status: 'rabbinic_prohibition',
          badge: 'RABBINIC PROHIBITION (D\'RABBANAN)',
          badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
          title: 'Forbidden Without an Eruv',
          explanation: 'Without a certified Eruv, transferring an object between a home and a sidewalk/park (Karmelit) is strictly prohibited by Rabbinic decree to safeguard the Sabbath. Parents cannot push strollers and keys cannot be carried outside.',
          source: 'Talmud Shabbat 6a; Shulchan Aruch OC 346:1',
        };
      }
    }

    return {
      status: 'prohibited',
      badge: 'FORBIDDEN',
      badgeColor: 'bg-rose-500/20 text-rose-400 border-rose-500/30',
      title: 'Domain Boundary Cross Without Valid Enclosure',
      explanation: 'Transfer between these domains is restricted without valid eruv enclosure.',
      source: 'Talmud Shabbat 6a',
    };
  };

  const ruling = getRuling();

  return (
    <div className="relative w-full max-w-5xl mx-auto p-3 sm:p-6 text-slate-100">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto mb-6">
        <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-400 bg-indigo-950/60 px-3 py-1 rounded-full border border-indigo-800">
          Interactive Halacha Simulator
        </span>
        <h2 className="text-2xl sm:text-3xl font-serif font-bold text-white mt-2">
          The 4 Shabbat Domains: What Can You Carry?
        </h2>
        <p className="text-xs sm:text-sm text-slate-300 mt-1">
          Select an item and simulate transferring it between different Jewish legal domains to see how an Eruv transforms Shabbat observance.
        </p>
      </div>

      {/* Item Selector */}
      <div className="mb-6 bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-xl">
        <label className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-2">
          Step 1: Choose What You Want to Carry:
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
          {ITEMS.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                soundManager.playClick();
                setSelectedItem(item);
              }}
              className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                selectedItem.id === item.id
                  ? 'bg-indigo-600/20 border-indigo-500 ring-2 ring-indigo-500/40 text-white'
                  : 'bg-slate-800/60 border-slate-700/60 text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <div className="text-2xl mb-1">{item.icon}</div>
              <div className="text-xs font-bold truncate">{item.name}</div>
              {item.isMuktzeh && (
                <span className="text-[9px] font-mono font-bold text-rose-400 mt-0.5">Muktzeh</span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Domain Selection Columns */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {/* Source Domain */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-xl">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-2">
            Step 2: Starting Location (From):
          </label>
          <div className="space-y-2">
            {SHABBAT_DOMAINS.map((domain) => (
              <button
                key={domain.id}
                onClick={() => {
                  soundManager.playClick();
                  setSelectedFromDomain(domain.id);
                }}
                className={`w-full p-3 rounded-xl border text-left transition-all cursor-pointer flex items-start justify-between ${
                  selectedFromDomain === domain.id
                    ? 'border-indigo-500 bg-indigo-950/40 text-white shadow-md'
                    : 'border-slate-800 bg-slate-800/40 text-slate-300 hover:bg-slate-800'
                }`}
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: domain.color }} />
                    <span className="font-bold text-sm text-white">{domain.name}</span>
                    <span className="text-xs text-slate-400 font-serif" dir="rtl">{domain.hebrew}</span>
                  </div>
                  <p className="text-xs text-slate-300 mt-1">{domain.description}</p>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Destination Domain */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-xl">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-2">
            Step 3: Destination Location (To):
          </label>
          <div className="space-y-2">
            {SHABBAT_DOMAINS.map((domain) => (
              <button
                key={domain.id}
                onClick={() => {
                  soundManager.playClick();
                  setSelectedToDomain(domain.id);
                }}
                className={`w-full p-3 rounded-xl border text-left transition-all cursor-pointer flex items-start justify-between ${
                  selectedToDomain === domain.id
                    ? 'border-indigo-500 bg-indigo-950/40 text-white shadow-md'
                    : 'border-slate-800 bg-slate-800/40 text-slate-300 hover:bg-slate-800'
                }`}
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: domain.color }} />
                    <span className="font-bold text-sm text-white">{domain.name}</span>
                    <span className="text-xs text-slate-400 font-serif" dir="rtl">{domain.hebrew}</span>
                  </div>
                  <p className="text-xs text-slate-300 mt-1">{domain.description}</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Community Eruv Status Toggle */}
      <div className="mb-6 bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-xl flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Neighborhood Eruv Status:
          </div>
          <div className="text-sm font-semibold text-white">
            Is there a certified Kosher Eruv enclosing the neighborhood?
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              soundManager.playClick();
              setHasEruv(true);
            }}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              hasEruv
                ? 'bg-emerald-500 text-slate-950 shadow-md font-extrabold'
                : 'bg-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            🟢 Kosher Eruv Active
          </button>
          <button
            onClick={() => {
              soundManager.playClick();
              setHasEruv(false);
            }}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              !hasEruv
                ? 'bg-rose-500 text-white shadow-md font-extrabold'
                : 'bg-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            🔴 No Eruv / Wire Broken
          </button>
        </div>
      </div>

      {/* Halachic Ruling Card */}
      <div className="bg-slate-900 border border-slate-700/80 rounded-3xl p-6 shadow-2xl">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-3 mb-4">
          <div className="flex items-center gap-2">
            <span className="text-xl">{selectedItem.icon}</span>
            <span className="text-sm font-bold text-white">
              Carrying {selectedItem.name} from {fromDomain.name} → {toDomain.name}
            </span>
          </div>

          <span className={`text-xs font-mono font-bold px-3 py-1 rounded-full border ${ruling.badgeColor}`}>
            {ruling.badge}
          </span>
        </div>

        <h3 className="text-lg font-serif font-bold text-white mb-2">
          {ruling.title}
        </h3>

        <p className="text-sm text-slate-300 leading-relaxed mb-4">
          {ruling.explanation}
        </p>

        <div className="p-3 bg-slate-800/60 rounded-xl border border-slate-700/60 flex items-center justify-between text-xs text-slate-400">
          <span>Halachic Foundation:</span>
          <span className="font-mono text-sky-300">{ruling.source}</span>
        </div>
      </div>
    </div>
  );
};
