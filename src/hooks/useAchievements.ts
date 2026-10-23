import { useState, useEffect, useCallback, useRef } from 'react';
import { Achievement } from '../types/achievements';
import { soundManager } from '../utils/audio';

const STORAGE_KEY = 'eruv_explorer_achievements_v1';

export const INITIAL_ACHIEVEMENTS: Achievement[] = [
  {
    id: 'first-fix',
    title: 'First Repair',
    hebrewTitle: 'תִּקּוּן רִאשׁוֹן (Tikkun Rishon)',
    description: 'Repaired your first perimeter breach before sunset.',
    requirement: 'Fix 1 eruv task along the town boundary.',
    icon: '🔧',
    rarity: 'bronze',
    points: 10,
    unlocked: false,
    progress: 0,
    maxProgress: 1,
  },
  {
    id: 'eruv-certified',
    title: 'Certified Eruv Inspector',
    hebrewTitle: 'מוּמְחֶה לְעֵירוּבִין (Mumcheh L\'Eruvin)',
    description: 'Fixed all active perimeter breaches and verified the communal eruv before sunset.',
    requirement: 'Complete all inspection tasks in your selected difficulty path.',
    icon: '🛡️',
    rarity: 'gold',
    points: 50,
    unlocked: false,
    progress: 0,
    maxProgress: 5,
  },
  {
    id: 'expert-posek',
    title: 'Rabbinic Posek',
    hebrewTitle: 'דַּיָּן וּפוֹסֵק (Dayan U\'Posek)',
    description: 'Mastered the Expert challenge: resolved all 8 complex breaches before the 25-minute sunset.',
    requirement: 'Repair all 8 halachic breaches on Expert difficulty.',
    icon: '👑',
    rarity: 'diamond',
    points: 100,
    unlocked: false,
    progress: 0,
    maxProgress: 8,
  },
  {
    id: 'infographics-scholar',
    title: 'Torah & Architecture Scholar',
    hebrewTitle: 'תַּלְמִיד חָכָם (Talmid Chacham)',
    description: 'Explored all 7 chapters of the Beginner\'s Visual Guide.',
    requirement: 'View all infographic tabs (Basics, Doorway, Domains, Rules, Matzah, Cities, Trivia).',
    icon: '📜',
    rarity: 'silver',
    points: 25,
    unlocked: false,
    progress: 0,
    maxProgress: 7,
  },
  {
    id: 'domains-master',
    title: 'Domain Master',
    hebrewTitle: 'אַרְבַּע רְשׁוּיוֹת (Arba Reshuyot)',
    description: 'Simulated carrying items across all 4 Shabbat legal domains.',
    requirement: 'Test transfers involving Reshut HaYachid, Reshut HaRabim, Karmelit, and Mekom Petur.',
    icon: '🏛️',
    rarity: 'silver',
    points: 25,
    unlocked: false,
    progress: 0,
    maxProgress: 4,
  },
  {
    id: 'sandbox-architect',
    title: 'Kosher Doorway Architect',
    hebrewTitle: 'בּוֹנֶה צוּרַת הַפֶּתַח (Boneh Tzurat HaPetach)',
    description: 'Engineered a 100% halachically valid Tzurat HaPetach in the Sandbox.',
    requirement: 'Configure overhead alignment, height >= 10 tefachim, and matzah dedication.',
    icon: '📐',
    rarity: 'silver',
    points: 20,
    unlocked: false,
    progress: 0,
    maxProgress: 1,
  },
  {
    id: 'quiz-ace',
    title: 'Halacha Master',
    hebrewTitle: 'רַב מֻבְהָק (Rav Muvhak)',
    description: 'Passed the Halacha Master Quiz with an honor score of 75% or higher.',
    requirement: 'Answer at least 6 out of 8 questions correctly in the quiz.',
    icon: '🏆',
    rarity: 'gold',
    points: 40,
    unlocked: false,
    progress: 0,
    maxProgress: 8,
  },
  {
    id: 'daily-learner',
    title: 'Daily Student of Halacha',
    hebrewTitle: 'יוֹם יוֹם (Yom Yom)',
    description: 'Fetched and studied a live Daily Halacha law from the Google Search Grounded engine.',
    requirement: 'Explore the Daily Halacha section or query a specific carrying topic.',
    icon: '📖',
    rarity: 'bronze',
    points: 15,
    unlocked: false,
    progress: 0,
    maxProgress: 1,
  },
  {
    id: 'streak-scholar',
    title: 'Torah Matmid',
    hebrewTitle: 'מַתְמִיד בַּתּוֹרָה (Matmid BaTorah)',
    description: 'Maintained a 3-day consecutive study streak in the Halachic Study Center.',
    requirement: 'Engage with daily eruv laws 3 days in a row.',
    icon: '🔥',
    rarity: 'gold',
    points: 35,
    unlocked: false,
    progress: 0,
    maxProgress: 3,
  },
  {
    id: 'virtual-walls',
    title: 'Gud Asek Visionary',
    hebrewTitle: 'גּוּד אַסֵּיק מְחִצָּתָא (Gud Asek)',
    description: 'Activated the glowing virtual halachic walls visualization.',
    requirement: 'Toggle the Gud Asek 3D walls projection.',
    icon: '✨',
    rarity: 'bronze',
    points: 10,
    unlocked: false,
    progress: 0,
    maxProgress: 1,
  },
  {
    id: 'trivia-hunter',
    title: 'Eruv Historian',
    hebrewTitle: 'דּוֹרֵשׁ רְשׁוּמוֹת (Doresh Reshumot)',
    description: 'Browsed the Did You Know facts archive and explored historical urban eruvin.',
    requirement: 'Shuffle or browse through the Did You Know facts collection.',
    icon: '💡',
    rarity: 'bronze',
    points: 15,
    unlocked: false,
    progress: 0,
    maxProgress: 3,
  },
  {
    id: 'offline-ready',
    title: 'Prepared for Anywhere',
    hebrewTitle: 'הֵכִין צְרָכָיו (Hechin Tzerachav)',
    description: 'Inspected offline deployment and PWA install options.',
    requirement: 'Open the Deploy App Offline modal.',
    icon: '📲',
    rarity: 'diamond',
    points: 30,
    unlocked: false,
    progress: 0,
    maxProgress: 1,
  },
];

export function useAchievements() {
  const [achievements, setAchievements] = useState<Achievement[]>(() => {
    if (typeof window === 'undefined') return INITIAL_ACHIEVEMENTS;
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed: Achievement[] = JSON.parse(stored);
        // Merge with initial in case new achievements were added
        return INITIAL_ACHIEVEMENTS.map(init => {
          const found = parsed.find(p => p.id === init.id);
          return found ? { ...init, ...found } : init;
        });
      }
    } catch {
      // Fallback
    }
    return INITIAL_ACHIEVEMENTS;
  });

  const [recentlyUnlocked, setRecentlyUnlocked] = useState<Achievement | null>(null);
  const toastTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Save to localStorage whenever achievements change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(achievements));
    } catch (e) {
      console.error('Failed to save achievements to localStorage', e);
    }
  }, [achievements]);

  const unlockAchievement = useCallback((id: string) => {
    setAchievements((prev) => {
      const target = prev.find(a => a.id === id);
      if (!target || target.unlocked) return prev;

      const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      const updated = prev.map(a => 
        a.id === id 
          ? { ...a, unlocked: true, unlockedAt: now, progress: a.maxProgress }
          : a
      );

      const newlyUnlocked = updated.find(a => a.id === id)!;
      setRecentlyUnlocked(newlyUnlocked);

      // Play joyful chime
      soundManager.playCelebration();

      if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
      toastTimeoutRef.current = setTimeout(() => {
        setRecentlyUnlocked(null);
      }, 5000);

      return updated;
    });
  }, []);

  const updateProgress = useCallback((id: string, progress: number) => {
    setAchievements((prev) => {
      const target = prev.find(a => a.id === id);
      if (!target || target.unlocked) return prev;

      const newProg = Math.min(progress, target.maxProgress);
      const isNowUnlocked = newProg >= target.maxProgress;

      if (isNowUnlocked) {
        unlockAchievement(id);
        return prev;
      }

      return prev.map(a => 
        a.id === id ? { ...a, progress: newProg } : a
      );
    });
  }, [unlockAchievement]);

  const resetAllAchievements = useCallback(() => {
    soundManager.playClick();
    setAchievements(INITIAL_ACHIEVEMENTS);
    localStorage.removeItem(STORAGE_KEY);
    setRecentlyUnlocked(null);
  }, []);

  const unlockedCount = achievements.filter(a => a.unlocked).length;
  const totalPoints = achievements.reduce((acc, a) => a.unlocked ? acc + a.points : acc, 0);
  const maxPoints = achievements.reduce((acc, a) => acc + a.points, 0);

  return {
    achievements,
    recentlyUnlocked,
    dismissToast: () => setRecentlyUnlocked(null),
    unlockAchievement,
    updateProgress,
    resetAllAchievements,
    unlockedCount,
    totalCount: achievements.length,
    totalPoints,
    maxPoints,
  };
}
