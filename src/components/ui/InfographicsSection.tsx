import React, { useState } from 'react';
import { 
  BookOpen, 
  Layers, 
  Compass, 
  ShieldCheck, 
  Sparkles, 
  CheckCircle2, 
  XCircle, 
  Ruler, 
  Eye, 
  MapPin, 
  HelpCircle,
  ArrowRight,
  Flame,
  Lightbulb
} from 'lucide-react';
import { SHABBAT_DOMAINS } from '../../data/eruvData';
import { ERUV_FACTS } from '../../data/eruvFacts';
import { soundManager } from '../../utils/audio';
import { KosherVisualizer } from './KosherVisualizer';

export const InfographicsSection: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'basics' | 'doorway' | 'domains' | 'golden_rules' | 'matzah' | 'real_world' | 'facts'>('basics');

  const tabs = [
    { id: 'basics', label: 'Eruv 101: The Basics', icon: BookOpen },
    { id: 'doorway', label: 'Anatomy of Tzurat HaPetach', icon: Compass },
    { id: 'domains', label: 'The 4 Domains Matrix', icon: Layers },
    { id: 'golden_rules', label: '5 Golden Rules', icon: ShieldCheck },
    { id: 'matzah', label: 'The Matzah Mystery', icon: Sparkles },
    { id: 'real_world', label: 'Real World Cities', icon: MapPin },
    { id: 'facts', label: 'Did You Know?', icon: Lightbulb },
  ];

  return (
    <div className="relative w-full max-w-6xl mx-auto p-3 sm:p-6 text-slate-100">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto mb-6">
        <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400 bg-emerald-950/60 px-3 py-1 rounded-full border border-emerald-800">
          Beginner's Visual Guide
        </span>
        <h2 className="text-2xl sm:text-3xl font-serif font-bold text-white mt-2">
          The Illustrated Laws of the Eruv
        </h2>
        <p className="text-xs sm:text-sm text-slate-300 mt-1">
          Explore visual diagrams, ancient Talmudic principles, and modern urban engineering made simple for beginners.
        </p>
      </div>

      {/* Navigation Pills */}
      <div className="flex flex-wrap items-center justify-center gap-1.5 mb-8 bg-slate-900/90 border border-slate-800 p-1.5 rounded-2xl max-w-3xl mx-auto">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => {
                soundManager.playClick();
                setActiveTab(tab.id as typeof activeTab);
              }}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                isActive
                  ? 'bg-emerald-500 text-slate-950 shadow-md font-bold'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab 1: Eruv 101: The Basics */}
      {activeTab === 'basics' && (
        <div className="space-y-6 animate-fade-in">
          {/* Comparison Hero Card */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Without Eruv */}
            <div className="bg-rose-950/20 border border-rose-500/30 rounded-3xl p-6 shadow-xl relative overflow-hidden">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-rose-400 bg-rose-950/60 px-3 py-1 rounded-full border border-rose-800">
                  Scenario A
                </span>
                <span className="text-xl">🚫</span>
              </div>
              <h3 className="text-xl font-serif font-bold text-white mb-2">
                Shabbat Without an Eruv
              </h3>
              <p className="text-sm text-slate-300 mb-4 leading-relaxed">
                Under Jewish law, carrying outdoors on Shabbat is prohibited. Without an eruv:
              </p>
              <ul className="space-y-2.5 text-xs text-rose-200/90">
                <li className="flex items-start gap-2">
                  <XCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                  <span><strong>Parents with babies</strong> cannot push strollers outside their homes.</span>
                </li>
                <li className="flex items-start gap-2">
                  <XCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                  <span><strong>House keys</strong> cannot be carried in pockets to lock front doors.</span>
                </li>
                <li className="flex items-start gap-2">
                  <XCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                  <span><strong>Prayer books (Siddurim)</strong>, Tallit shawls, coats, and medications cannot be carried to synagogue.</span>
                </li>
              </ul>
            </div>

            {/* With Eruv */}
            <div className="bg-emerald-950/20 border border-emerald-500/30 rounded-3xl p-6 shadow-xl relative overflow-hidden">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-emerald-400 bg-emerald-950/60 px-3 py-1 rounded-full border border-emerald-800">
                  Scenario B
                </span>
                <span className="text-xl">✨</span>
              </div>
              <h3 className="text-xl font-serif font-bold text-white mb-2">
                Shabbat With a Kosher Eruv
              </h3>
              <p className="text-sm text-slate-300 mb-4 leading-relaxed">
                The community perimeter and food partnership transform the neighborhood into one shared private domain:
              </p>
              <ul className="space-y-2.5 text-xs text-emerald-200/90">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span><strong>Strollers & toddlers</strong> can freely travel to parks and family gatherings.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span><strong>House keys & medications</strong> can be carried safely.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span><strong>Oneg Shabbat (Sabbath Joy)</strong>: Elders, families, and youth celebrate together at the synagogue.</span>
                </li>
              </ul>
            </div>
          </div>

          {/* The Two Halves of an Eruv */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl">
            <h3 className="text-lg font-serif font-bold text-white mb-3 text-center">
              An Eruv Has TWO Inseparable Halachic Halves
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-slate-800/50 p-4 rounded-2xl border border-slate-700/60">
                <div className="text-amber-400 font-bold text-sm mb-1 flex items-center gap-1.5">
                  <span>1. The Physical Boundary</span>
                  <span className="text-xs font-mono text-slate-400">(Tzurat HaPetach)</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Fences, walls, and continuous utility poles connected by overhead taut wire that legally convert the suburban area into an enclosed courtyard (Reshut HaYachid).
                </p>
              </div>

              <div className="bg-slate-800/50 p-4 rounded-2xl border border-slate-700/60">
                <div className="text-amber-400 font-bold text-sm mb-1 flex items-center gap-1.5">
                  <span>2. The Communal Food Union</span>
                  <span className="text-xs font-mono text-slate-400">(Eruv Chatzerot)</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  A shared box of food (traditionally Matzah) acquired on behalf of all Jewish residents, legally unifying all independent homes as a single shared household.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Anatomy of Tzurat HaPetach */}
      {activeTab === 'doorway' && (
        <div className="space-y-6 animate-fade-in">
          {/* Visual Doorway Diagram Card */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl">
            <div className="text-center max-w-xl mx-auto mb-6">
              <h3 className="text-xl font-serif font-bold text-white">
                How Does a Thin Wire Function as a Wall?
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Jewish law recognizes "Tzurat HaPetach" (the Form of a Doorway) as a legitimate partition.
                Just like a house has doorframes that open into rooms, an eruv is viewed as a series of connected doorways!
              </p>
            </div>

            {/* Visual SVG Diagram */}
            <div className="max-w-md mx-auto bg-slate-950 p-6 rounded-2xl border border-slate-800 flex flex-col items-center">
              <svg viewBox="0 0 320 220" className="w-full h-auto">
                {/* Ground */}
                <line x1="20" y1="200" x2="300" y2="200" stroke="#475569" strokeWidth="4" />
                <text x="160" y="215" fill="#94a3b8" fontSize="10" textAnchor="middle">Ground Level</text>

                {/* Left Post (Lechi) */}
                <rect x="50" y="40" width="16" height="160" rx="3" fill="#38bdf8" />
                <text x="58" y="125" fill="#0c1017" fontSize="9" fontWeight="bold" transform="rotate(-90 58 125)" textAnchor="middle">
                  LECHI (Doorpost)
                </text>

                {/* Right Post (Lechi) */}
                <rect x="254" y="40" width="16" height="160" rx="3" fill="#38bdf8" />
                <text x="262" y="125" fill="#0c1017" fontSize="9" fontWeight="bold" transform="rotate(-90 262 125)" textAnchor="middle">
                  LECHI (Doorpost)
                </text>

                {/* Lintel / Wire directly overhead */}
                <rect x="42" y="32" width="236" height="8" rx="2" fill="#10b981" />
                <text x="160" y="24" fill="#34d399" fontSize="11" fontWeight="bold" textAnchor="middle">
                  KORAH (Overhead Wire / Lintel)
                </text>

                {/* Virtual Halachic Wall (Gud Asek) projection */}
                <rect x="66" y="40" width="188" height="160" fill="#10b981" opacity="0.12" stroke="#10b981" strokeDasharray="4 4" />
                <text x="160" y="115" fill="#10b981" fontSize="10" fontWeight="bold" textAnchor="middle">
                  VIRTUAL WALL (Gud Asek)
                </text>
                <text x="160" y="132" fill="#94a3b8" fontSize="8" textAnchor="middle">
                  "Let the partition ascend to heaven"
                </text>

                {/* Overhead indicator arrows */}
                <path d="M 58 32 L 58 40" stroke="#f59e0b" strokeWidth="2" markerEnd="url(#arrow)" />
                <path d="M 262 32 L 262 40" stroke="#f59e0b" strokeWidth="2" />
              </svg>

              <div className="mt-4 text-center">
                <span className="text-xs font-mono font-bold text-amber-300 bg-amber-950/40 px-3 py-1 rounded-full border border-amber-800">
                  Talmud Eruvin 11b: "Al Gabav VeLo Min HaTzad"
                </span>
                <p className="text-xs text-slate-300 mt-2">
                  The wire must pass directly over the center top of both posts. If the wire is tied to the side of the post, the doorway illusion fails!
                </p>
              </div>
            </div>
          </div>

          {/* Interactive Real-Time Kosher vs. Pasul Visualizer */}
          <div className="mt-4">
            <KosherVisualizer currentRule="overhead" isCompact={false} />
          </div>
        </div>
      )}

      {/* Tab 3: The 4 Domains Matrix */}
      {activeTab === 'domains' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-fade-in">
          {SHABBAT_DOMAINS.map((domain) => (
            <div
              key={domain.id}
              className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-xl flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="w-3.5 h-3.5 rounded-full" style={{ backgroundColor: domain.color }} />
                    <h3 className="text-lg font-serif font-bold text-white">{domain.name}</h3>
                  </div>
                  <span className="text-base font-serif text-slate-400 font-bold" dir="rtl">
                    {domain.hebrew}
                  </span>
                </div>

                <p className="text-xs text-slate-300 mb-3 leading-relaxed">
                  {domain.description}
                </p>

                <div className="space-y-2 text-xs mb-4">
                  <div className="p-2 rounded-xl bg-slate-800/60 border border-slate-700/60">
                    <span className="text-slate-400 font-bold">Physical Criteria: </span>
                    <span className="text-slate-200">{domain.minHeight}</span>
                  </div>
                  <div className="p-2 rounded-xl bg-slate-800/60 border border-slate-700/60">
                    <span className="text-slate-400 font-bold">Carrying Rule: </span>
                    <span className="text-amber-300">{domain.carryingRule}</span>
                  </div>
                </div>
              </div>

              <div>
                <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                  Common Real-World Examples:
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {domain.examples.map((ex, i) => (
                    <span
                      key={i}
                      className="text-[11px] bg-slate-800 text-slate-300 px-2.5 py-1 rounded-lg border border-slate-700"
                    >
                      {ex}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tab 4: 5 Golden Rules */}
      {activeTab === 'golden_rules' && (
        <div className="space-y-4 animate-fade-in">
          {[
            {
              number: '01',
              title: 'Al Gabav: Wire Directly Overhead',
              hebrew: 'על גביו ולא מן הצד',
              desc: 'The crossbeam or wire must sit directly on top of the doorpost (Lechi). If it is fastened with an eyebolt to the side of the pole, or passes alongside without intersecting the vertical axis, the doorway form is legally void.',
              source: 'Talmud Eruvin 11b; Shulchan Aruch OC 362:11',
            },
            {
              number: '02',
              title: 'Lavud: Gaps Under 3 Tefachim are Solid',
              hebrew: 'לָבוּד',
              desc: 'A divine halachic measurement rule: Any empty gap measuring less than 3 Tefachim (approx. 9.4 inches / 24 cm) is deemed completely sealed and solid. This allows picket fences and guardrails to serve as kosher walls.',
              source: 'Talmud Shabbat 97a; Eruvin 9a',
            },
            {
              number: '03',
              title: 'Gud Asek: Virtual Upward Extension',
              hebrew: 'גּוּד אַסֵּיק מְחִצָּתָא',
              desc: 'Literally "pull and ascend the partition." Even if the wire is 30 feet in the air, Jewish law views the 40-inch plastic strip on the lower post as extending straight upward into the sky to meet the overhead cable.',
              source: 'Talmud Eruvin 11b',
            },
            {
              number: '04',
              title: 'Omed Merubeh Al HaParutz: Solid Outweighs Gaps',
              hebrew: 'עומד מרובה על הפרוץ',
              desc: 'In a perimeter without doorway forms, the solid portions of fencing or walls must be greater than the open breaches. However, with kosher Tzurat HaPetach doorways, even massive open distances can be enclosed!',
              source: 'Mishnah Eruvin 1:7',
            },
            {
              number: '05',
              title: 'Zero Tolerance for Broken Wires',
              hebrew: 'נפסקה הקורה',
              desc: 'If a single wire in a 20-mile eruv loop snaps due to wind, ice, or fallen branches on Shabbat, carrying is immediately forbidden in that sector. An eruv requires an unbroken continuous loop throughout the entire Sabbath.',
              source: 'Shulchan Aruch OC 365:1',
            },
          ].map((rule) => (
            <div
              key={rule.number}
              className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl flex items-start gap-4"
            >
              <div className="text-2xl font-mono font-extrabold text-amber-400 bg-amber-950/40 border border-amber-800/60 w-12 h-12 rounded-xl flex items-center justify-center shrink-0">
                {rule.number}
              </div>
              <div className="flex-1">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h3 className="text-base font-bold text-white font-serif">{rule.title}</h3>
                  <span className="text-xs font-serif text-amber-300 font-semibold" dir="rtl">
                    {rule.hebrew}
                  </span>
                </div>
                <p className="text-xs text-slate-300 mt-1.5 leading-relaxed">{rule.desc}</p>
                <div className="text-[10px] text-slate-500 font-mono mt-2">Source: {rule.source}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tab 5: The Matzah Mystery (Eruv Chatzerot) */}
      {activeTab === 'matzah' && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-6 animate-fade-in">
          <div className="text-center max-w-xl mx-auto">
            <span className="text-3xl mb-2 block">🍞</span>
            <h3 className="text-2xl font-serif font-bold text-white">
              Why Does an Eruv Require a Box of Matzah?
            </h3>
            <p className="text-xs text-slate-300 mt-1">
              Many people see the wire and assume that is the whole "Eruv". But the word <em>Eruv</em> itself means "blending" or "mixture" — specifically, the blending of meals!
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-slate-800/50 p-4 rounded-2xl border border-slate-700/60">
              <div className="text-sm font-bold text-amber-400 mb-1">1. The Solomonian Decree</div>
              <p className="text-xs text-slate-300 leading-relaxed">
                King Solomon saw that people might carry between private houses in a shared courtyard and mistakenly think carrying in a true public street was allowed. He enacted that residents must contribute bread to a shared meal.
              </p>
            </div>

            <div className="bg-slate-800/50 p-4 rounded-2xl border border-slate-700/60">
              <div className="text-sm font-bold text-amber-400 mb-1">2. One Shared Household</div>
              <p className="text-xs text-slate-300 leading-relaxed">
                By having a common food supply deposited in one location (the Synagogue or Rabbi's study), all neighbors are symbolically transformed into members of a single extended household dining at the same table!
              </p>
            </div>

            <div className="bg-slate-800/50 p-4 rounded-2xl border border-slate-700/60">
              <div className="text-sm font-bold text-amber-400 mb-1">3. Why Matzah?</div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Matzah is baked flat without moisture, allowing it to stay edible for years without spoiling or molding. This ensures the communal food remains fresh and valid for the entire Jewish calendar year!
              </p>
            </div>
          </div>

          <div className="p-4 bg-amber-950/20 border border-amber-600/30 rounded-2xl text-xs text-amber-200/90 leading-relaxed">
            <strong>The Annual Ritual (Zekiyah):</strong> Before Passover each year, the Rabbi or community trustee lifts a box of Matzah and recites: <em>"By means of this Eruv, it shall be permitted for all the residents of this neighborhood to transfer objects between domains on the Sabbath..."</em>
          </div>
        </div>
      )}

      {/* Tab 6: Real World Cities */}
      {activeTab === 'real_world' && (
        <div className="space-y-4 animate-fade-in">
          <div className="text-center max-w-xl mx-auto mb-4">
            <h3 className="text-xl font-serif font-bold text-white">
              Urban Eruvin Around the Globe
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              How modern metropolitan areas create imperceptible kosher perimeters spanning dozens of miles.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-bold text-sm text-white">Manhattan Eruv</h4>
                <span className="text-xs text-amber-400 font-mono">New York, USA</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed mb-3">
                Covers virtually the entire island of Manhattan! Utilizes the seawalls along the Hudson and East Rivers, fencing along the FDR Drive, and elevated transit embankments, connected by high-strength monofilament lines.
              </p>
              <div className="text-[11px] text-slate-400 font-mono">
                Inspected every Thursday night & Friday at dawn.
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-bold text-sm text-white">North London Eruv</h4>
                <span className="text-xs text-amber-400 font-mono">London, UK</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed mb-3">
                Spans 11 square miles across Barnet and Hendon. Utilizes 80 pairs of purpose-built posts and high-tensile wire, seamlessly blending into street furniture and lampposts.
              </p>
              <div className="text-[11px] text-slate-400 font-mono">
                Over 100,000 residents within perimeter.
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-bold text-sm text-white">Jerusalem Eruv</h4>
                <span className="text-xs text-amber-400 font-mono">Jerusalem, Israel</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed mb-3">
                Jerusalem features multiple overlapping eruvin maintained by the Chief Rabbinate and the Eidah Charedit. Hundreds of kilometers of wire span hills, ravines, and historic walls.
              </p>
              <div className="text-[11px] text-slate-400 font-mono">
                Weekly fleet of specialized inspection trucks.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 7: Did You Know? Facts & Curiosities */}
      {activeTab === 'facts' && (
        <div className="space-y-4 animate-fade-in">
          <div className="text-center max-w-xl mx-auto mb-4">
            <h3 className="text-xl font-serif font-bold text-white">
              Eruv Lore, History & Curiosities
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Fascinating historical milestones and modern engineering marvels behind the world's most unique legal perimeters.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {ERUV_FACTS.map((fact) => (
              <div
                key={fact.id}
                className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl flex flex-col justify-between space-y-2.5"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full border border-sky-500/30 bg-sky-500/20 text-sky-300">
                      {fact.category}
                    </span>
                    <span className="text-xs font-mono text-slate-400 flex items-center gap-1">
                      <span>{fact.icon}</span>
                      <span>{fact.tag}</span>
                    </span>
                  </div>

                  <h4 className="font-bold text-base text-white font-serif">
                    {fact.title}
                  </h4>

                  <p className="text-xs text-slate-300 leading-relaxed mt-1">
                    {fact.fact}
                  </p>
                </div>

                <div className="space-y-2 pt-2 border-t border-slate-800">
                  <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80 text-[11px] text-slate-400 leading-relaxed italic">
                    "{fact.historicalContext}"
                  </div>

                  <div className="text-[10px] text-slate-500 font-mono flex items-center gap-1">
                    <span>Source: {fact.source}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
