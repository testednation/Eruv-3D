import React, { useState } from 'react';
import { 
  Compass, 
  Wrench, 
  ShieldCheck, 
  Layers, 
  Trophy, 
  ArrowRight, 
  ArrowLeft, 
  CheckCircle2, 
  X, 
  Sparkles,
  Eye,
  Sliders,
  BookOpen
} from 'lucide-react';
import { soundManager } from '../../utils/audio';
import { KosherVisualizer } from './KosherVisualizer';

interface TutorialModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenAchievements?: () => void;
  initialStep?: number;
}

export const TutorialModal: React.FC<TutorialModalProps> = ({
  isOpen,
  onClose,
  onOpenAchievements,
  initialStep = 0,
}) => {
  const [currentStep, setCurrentStep] = useState(initialStep);

  React.useEffect(() => {
    if (isOpen && initialStep !== undefined) {
      setCurrentStep(initialStep);
    }
  }, [isOpen, initialStep]);

  if (!isOpen) return null;

  const steps = [
    {
      title: 'Welcome to Eruv Explorer!',
      subtitle: 'Understanding the Jewish Laws of the Eruv for Beginners',
      icon: '🏘️',
      badge: 'Introduction',
      content: (
        <div className="space-y-3 text-xs sm:text-sm text-slate-300 leading-relaxed">
          <p>
            On the Sabbath (Shabbat), Torah law prohibits carrying objects between different domains (such as carrying a house key or pushing a baby stroller from home onto a public road).
          </p>
          <div className="p-3.5 bg-amber-950/30 border border-amber-600/30 rounded-2xl text-amber-200">
            <strong>What is an Eruv?</strong> An Eruv is an ingenious communal boundary (combining physical partitions, utility poles, and taut overhead wire) that legally transforms an entire neighborhood into one shared Private Domain (<em>Reshut HaYachid</em>).
          </div>
          <p>
            This allows young families to push strollers to synagogue, carry house keys, prayer books, coats, and medications, and celebrate Shabbat together!
          </p>
        </div>
      ),
    },
    {
      title: 'How to Navigate the 3D Town',
      subtitle: 'Interactive 3D Camera & Inspection Controls',
      icon: '🧭',
      badge: '3D Navigation',
      content: (
        <div className="space-y-3 text-xs sm:text-sm text-slate-300 leading-relaxed">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 my-2">
            <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700/60 text-center">
              <div className="text-xl mb-1">🖱️</div>
              <div className="font-bold text-white text-xs">Orbit & Drag</div>
              <div className="text-[11px] text-slate-400 mt-0.5">Click and drag with mouse or finger to rotate the town view.</div>
            </div>
            <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700/60 text-center">
              <div className="text-xl mb-1">🔍</div>
              <div className="font-bold text-white text-xs">Scroll to Zoom</div>
              <div className="text-[11px] text-slate-400 mt-0.5">Use mouse wheel or pinch to zoom close into poles and wires.</div>
            </div>
            <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700/60 text-center">
              <div className="text-xl mb-1">🎯</div>
              <div className="font-bold text-white text-xs">Click to Inspect</div>
              <div className="text-[11px] text-slate-400 mt-0.5">Click directly on any telephone pole or task beacon to focus.</div>
            </div>
          </div>
          <p className="text-xs text-slate-400">
            Tip: You can also use the camera shortcut pills (<strong>Town</strong>, <strong>Shul</strong>, <strong>Inspect</strong>) in the bottom dock to quickly jump between areas!
          </p>
        </div>
      ),
    },
    {
      title: 'Mending Friday Breaches',
      subtitle: 'The 5 Critical Inspection Tasks',
      icon: '🔧',
      badge: 'Game Quest',
      content: (
        <div className="space-y-3 text-xs sm:text-sm text-slate-300 leading-relaxed">
          <p>
            It is Friday afternoon, and you are the community Eruv Inspector! You must inspect the 8 perimeter utility poles and resolve 5 halachic breaches before Shabbat starts:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
            <div className="p-2.5 rounded-xl bg-slate-800/60 border border-slate-700/60 flex items-start gap-2">
              <span className="text-amber-400 font-bold shrink-0">1.</span>
              <span><strong>Snapped Cable:</strong> Splice & tension the fallen wire.</span>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-800/60 border border-slate-700/60 flex items-start gap-2">
              <span className="text-amber-400 font-bold shrink-0">2.</span>
              <span><strong>Side Attachment:</strong> Move wire from side bracket directly on top.</span>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-800/60 border border-slate-700/60 flex items-start gap-2">
              <span className="text-amber-400 font-bold shrink-0">3.</span>
              <span><strong>Leaning Pole:</strong> Realign snowplow-struck pole to 90 degrees.</span>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-800/60 border border-slate-700/60 flex items-start gap-2">
              <span className="text-amber-400 font-bold shrink-0">4.</span>
              <span><strong>Alley Breach:</strong> Span a kosher Tzurat HaPetach doorway.</span>
            </div>
          </div>
          <div className="p-2.5 rounded-xl bg-amber-950/30 border border-amber-600/30 text-amber-200 text-xs">
            <strong>Task 5: Eruv Chatzerot!</strong> Don't forget to visit the Central Synagogue to dedicate the communal Matzah box on behalf of the town!
          </div>
        </div>
      ),
    },
    {
      title: 'Real-Time Kosher vs. Pasul Rules',
      subtitle: 'How to Visually Tell If a Boundary is Kosher',
      icon: '✨',
      badge: 'Halacha Visualizer',
      content: (
        <div className="space-y-3 text-xs sm:text-sm text-slate-300 leading-relaxed">
          <p>
            An eruv relies on strict architectural geometry. Click through the categories below to see real-time comparisons of Kosher (valid) vs. Pasul (invalid) configurations:
          </p>
          <div className="my-1">
            <KosherVisualizer currentRule="overhead" isCompact={false} />
          </div>
          <p className="text-xs text-slate-400">
            Rule of thumb: The wire must pass directly over the top of the post (<em>Al Gabav</em>). If attached to the side or broken, it is <em>Pasul</em> (invalid).
          </p>
        </div>
      ),
    },
    {
      title: 'Explore All Modes & Features',
      subtitle: 'Interactive Halachic Engineering Suite',
      icon: '🎛️',
      badge: 'App Modes',
      content: (
        <div className="space-y-2.5 text-xs text-slate-300">
          <div className="p-2.5 rounded-xl bg-slate-800/60 border border-slate-700/60 flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-sky-500/20 text-sky-400 shrink-0">
              <Sliders className="w-4 h-4" />
            </div>
            <div>
              <div className="font-bold text-white text-xs">Halachic Sandbox</div>
              <div className="text-[11px] text-slate-400">Experiment with post heights, wire positions, and the Lavud fence gap slider.</div>
            </div>
          </div>

          <div className="p-2.5 rounded-xl bg-slate-800/60 border border-slate-700/60 flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-indigo-500/20 text-indigo-400 shrink-0">
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <div className="font-bold text-white text-xs">4 Domains Carrying Sim</div>
              <div className="text-[11px] text-slate-400">Test carrying strollers, keys, or phones across Reshut HaYachid, Reshut HaRabim, and Karmelit.</div>
            </div>
          </div>

          <div className="p-2.5 rounded-xl bg-slate-800/60 border border-slate-700/60 flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400 shrink-0">
              <BookOpen className="w-4 h-4" />
            </div>
            <div>
              <div className="font-bold text-white text-xs">Visual Guide & Quiz</div>
              <div className="text-[11px] text-slate-400">Read illustrated infographics and test your skills with the Halacha Master Quiz!</div>
            </div>
          </div>
        </div>
      ),
    },
    {
      title: 'Earn Inspector Badges & Achievements',
      subtitle: 'Track Your Mastery of Jewish Law',
      icon: '🏆',
      badge: 'Badges',
      content: (
        <div className="space-y-3 text-xs sm:text-sm text-slate-300 leading-relaxed text-center">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center text-3xl my-2">
            🏆
          </div>
          <p>
            As you inspect the perimeter, read the visual guide, experiment in the sandbox, and study daily halachot, you will unlock <strong>10 unique badges</strong>!
          </p>
          <div className="p-3 bg-slate-800/70 border border-slate-700 rounded-xl text-xs text-slate-300">
            Earn up to <strong>250 Achievement Points</strong> from Bronze to Diamond tiers. You can view your badges anytime using the <strong>Badges</strong> button in the bottom dock!
          </div>
        </div>
      ),
    },
  ];

  const current = steps[currentStep];

  const handleNext = () => {
    soundManager.playClick();
    if (currentStep + 1 < steps.length) {
      setCurrentStep(s => s + 1);
    } else {
      onClose();
    }
  };

  const handlePrev = () => {
    soundManager.playClick();
    if (currentStep > 0) {
      setCurrentStep(s => s - 1);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="bg-slate-900 border border-slate-700 rounded-3xl p-4 sm:p-6 shadow-2xl max-w-xl w-full max-h-[88vh] flex flex-col text-slate-100 overflow-hidden">
        {/* Header Bar */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
          <div className="flex items-center gap-2">
            <span className="text-2xl">{current.icon}</span>
            <div>
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-amber-400 bg-amber-950/60 px-2 py-0.5 rounded-full border border-amber-800">
                {current.badge} • Step {currentStep + 1} of {steps.length}
              </span>
              <h3 className="text-base sm:text-lg font-serif font-bold text-white mt-1">
                {current.title}
              </h3>
            </div>
          </div>

          <button
            onClick={() => {
              soundManager.playClick();
              onClose();
            }}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
            aria-label="Close tutorial"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step Subtitle */}
        <div className="text-xs font-medium text-slate-400 mb-3">
          {current.subtitle}
        </div>

        {/* Step Content */}
        <div className="overflow-y-auto pr-1 flex-1 mb-4">
          {current.content}
        </div>

        {/* Step Progress Dots & Navigation Footer */}
        <div className="flex flex-wrap items-center justify-between border-t border-slate-800 pt-3 gap-2">
          <button
            onClick={onClose}
            className="text-xs text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            Skip Tutorial
          </button>

          {/* Dots */}
          <div className="flex items-center gap-1.5">
            {steps.map((_, idx) => (
              <button
                key={idx}
                onClick={() => {
                  soundManager.playClick();
                  setCurrentStep(idx);
                }}
                className={`h-2 rounded-full transition-all cursor-pointer ${
                  currentStep === idx ? 'w-6 bg-amber-500' : 'w-2 bg-slate-700 hover:bg-slate-600'
                }`}
                aria-label={`Go to step ${idx + 1}`}
              />
            ))}
          </div>

          <div className="flex items-center gap-2">
            {currentStep > 0 && (
              <button
                onClick={handlePrev}
                className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300 transition-colors cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back</span>
              </button>
            )}

            <button
              onClick={handleNext}
              className="flex items-center gap-1 px-4 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition-all shadow-md cursor-pointer"
            >
              <span>{currentStep + 1 === steps.length ? 'Get Started!' : 'Next'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
