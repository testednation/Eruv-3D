/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import confetti from 'canvas-confetti';
import { soundManager } from '../utils/audio';
import { hapticsManager } from '../utils/haptics';

const STREAK_STORAGE_KEY = 'eruv_study_streak_v1';

export interface StudyStreakData {
  currentStreak: number;
  longestStreak: number;
  lastStudyDate: string | null;
  totalDays: number;
  studyDates: string[]; // YYYY-MM-DD
  lastAction?: string;
}

export interface DayProgress {
  dayName: string; // 'Sun', 'Mon', etc.
  dateStr: string;
  isToday: boolean;
  isCompleted: boolean;
  isFuture: boolean;
}

export interface StreakMilestone {
  days: number;
  title: string;
  hebrewTitle: string;
  description: string;
  icon: string;
  isUnlocked: boolean;
}

const TORAH_QUOTES = [
  {
    quote: "כָּל הַשּׁוֹנֶה הֲלָכוֹת בְּכָל יוֹם, מֻבְטָח לוֹ שֶׁהוּא בֶּן הָעוֹלָם הַבָּא",
    translation: "Whoever studies halachot every single day is assured a place in the World to Come.",
    source: "Talmud Bavli, Niddah 73a / Megillah 28b",
  },
  {
    quote: "עֲשֵׂה תּוֹרָתְךָ קֶבַע",
    translation: "Make your Torah study a fixed, unwavering daily appointment.",
    source: "Pirkei Avot 1:15 (Shammai)",
  },
  {
    quote: "אֵינוֹ דּוֹמֶה שׁוֹנֶה פִּרְקוֹ מֵאָה פְּעָמִים לְשׁוֹנֶה פִּרְקוֹ מֵאָה וְאַחַת",
    translation: "One who reviews a chapter 100 times cannot be compared to one who reviews it 101 times.",
    source: "Chagigah 9b",
  },
  {
    quote: "גְּדוֹלָה מִצְוָה בְּעוֹנָתָהּ, וְאֵין יוֹם שֶׁאֵין בּוֹ תּוֹרָה",
    translation: "Great is a mitzvah performed in its proper time; let no day pass without words of Torah.",
    source: "Midrash Rabbah",
  },
  {
    quote: "תּוֹרָה מְגִנָּה וּמַצָּלָה, בֵּין בִּזְמַן שֶׁעוֹסֵק בָּהּ וּבֵין שֶׁאֵינוֹ עוֹסֵק בָּהּ",
    translation: "Torah study shields and preserves, creating a sacred perimeter for the soul like an eruv for the city.",
    source: "Sotah 21a",
  },
];

export const STREAK_MILESTONES: StreakMilestone[] = [
  {
    days: 1,
    title: 'First Step',
    hebrewTitle: 'הַתְחָלָה טוֹבָה',
    description: 'Began your daily journey into Hilchot Eruvin.',
    icon: '🌱',
    isUnlocked: false,
  },
  {
    days: 3,
    title: 'Diligent Student',
    hebrewTitle: 'מַתְמִיד בַּתּוֹרָה',
    description: 'Maintained 3 consecutive days of halachic study.',
    icon: '🔥',
    isUnlocked: false,
  },
  {
    days: 7,
    title: 'Eruv Pillar',
    hebrewTitle: 'עַמּוּד הָעֵירוּב',
    description: 'Completed a full week of daily eruv exploration.',
    icon: '🏛️',
    isUnlocked: false,
  },
  {
    days: 14,
    title: 'Halacha Guardian',
    hebrewTitle: 'מִבְצַר הַהֲלָכָה',
    description: 'Fortified two continuous weeks of daily learning.',
    icon: '🛡️',
    isUnlocked: false,
  },
  {
    days: 30,
    title: 'Chazakah Master',
    hebrewTitle: 'חֲזָקָה שֶׁל תּוֹרָה',
    description: 'Established a 30-day halachic habit of daily review.',
    icon: '👑',
    isUnlocked: false,
  },
];

export const getTodayDateString = (): string => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const getYesterdayDateString = (): string => {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export function useStudyStreak() {
  const [streakData, setStreakData] = useState<StudyStreakData>(() => {
    if (typeof window === 'undefined') {
      return {
        currentStreak: 0,
        longestStreak: 0,
        lastStudyDate: null,
        totalDays: 0,
        studyDates: [],
      };
    }

    try {
      const stored = localStorage.getItem(STREAK_STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch {
      // Fallback
    }

    return {
      currentStreak: 0,
      longestStreak: 0,
      lastStudyDate: null,
      totalDays: 0,
      studyDates: [],
    };
  });

  const todayStr = getTodayDateString();
  const yesterdayStr = getYesterdayDateString();

  // Evaluate current active streak accounting for lapse if user missed yesterday
  const effectiveStreak = useMemo(() => {
    if (!streakData.lastStudyDate) return 0;
    if (streakData.lastStudyDate === todayStr) {
      return streakData.currentStreak;
    }
    if (streakData.lastStudyDate === yesterdayStr) {
      return streakData.currentStreak;
    }
    // Lapsed (more than 1 day missed)
    return 0;
  }, [streakData.lastStudyDate, streakData.currentStreak, todayStr, yesterdayStr]);

  const studiedToday = streakData.lastStudyDate === todayStr;

  // Save to localStorage whenever streakData updates
  useEffect(() => {
    try {
      localStorage.setItem(STREAK_STORAGE_KEY, JSON.stringify(streakData));
    } catch (e) {
      console.error('Failed to save study streak to localStorage', e);
    }
  }, [streakData]);

  // Record a daily study session action
  const recordStudyAction = useCallback((actionDescription: string = 'Studied Daily Halacha') => {
    const today = getTodayDateString();
    const yesterday = getYesterdayDateString();

    setStreakData((prev) => {
      // If already checked in today, update action note but don't re-increment
      if (prev.lastStudyDate === today) {
        return {
          ...prev,
          lastAction: actionDescription,
        };
      }

      // Check if continuing streak from yesterday or starting new
      let nextStreak = 1;
      if (prev.lastStudyDate === yesterday) {
        nextStreak = prev.currentStreak + 1;
      }

      const nextLongest = Math.max(nextStreak, prev.longestStreak);
      const updatedDates = prev.studyDates.includes(today)
        ? prev.studyDates
        : [...prev.studyDates.slice(-60), today]; // keep last 60 days

      // Trigger tactile & audio celebrations
      soundManager.playCelebration();
      hapticsManager.celebration();

      try {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.7 },
          colors: ['#f59e0b', '#fbbf24', '#10b981', '#38bdf8'],
        });
      } catch {
        // Fallback
      }

      return {
        currentStreak: nextStreak,
        longestStreak: nextLongest,
        lastStudyDate: today,
        totalDays: prev.totalDays + 1,
        studyDates: updatedDates,
        lastAction: actionDescription,
      };
    });
  }, []);

  // 7-day week view for the current week (Sunday to Saturday)
  const weekProgress: DayProgress[] = useMemo(() => {
    const result: DayProgress[] = [];
    const now = new Date();
    const currentDayOfWeek = now.getDay(); // 0 = Sunday, 6 = Saturday
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Shabbat'];

    for (let i = 0; i < 7; i++) {
      const targetDate = new Date(now);
      targetDate.setDate(now.getDate() - currentDayOfWeek + i);
      const y = targetDate.getFullYear();
      const m = String(targetDate.getMonth() + 1).padStart(2, '0');
      const d = String(targetDate.getDate()).padStart(2, '0');
      const dateStr = `${y}-${m}-${d}`;

      const isToday = i === currentDayOfWeek;
      const isFuture = i > currentDayOfWeek;
      const isCompleted = streakData.studyDates.includes(dateStr);

      result.push({
        dayName: dayNames[i],
        dateStr,
        isToday,
        isCompleted,
        isFuture,
      });
    }

    return result;
  }, [streakData.studyDates]);

  // Milestone list with unlocked status
  const milestones = useMemo(() => {
    return STREAK_MILESTONES.map((m) => ({
      ...m,
      isUnlocked: effectiveStreak >= m.days || streakData.longestStreak >= m.days,
    }));
  }, [effectiveStreak, streakData.longestStreak]);

  // Next milestone to hit
  const nextMilestone = useMemo(() => {
    return milestones.find((m) => effectiveStreak < m.days) || milestones[milestones.length - 1];
  }, [milestones, effectiveStreak]);

  // Daily Torah quote (deterministic based on day of year so all users see same daily encouragement)
  const todayQuote = useMemo(() => {
    const dayOfYear = Math.floor(
      (new Date().getTime() - new Date(new Date().getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24)
    );
    return TORAH_QUOTES[dayOfYear % TORAH_QUOTES.length];
  }, []);

  // Tier classification for styling
  const streakTier = useMemo(() => {
    if (effectiveStreak >= 30) return { name: 'Chazakah', color: 'text-amber-300', bg: 'bg-amber-500/20', border: 'border-amber-400', glow: 'shadow-amber-500/40' };
    if (effectiveStreak >= 14) return { name: 'Fortress', color: 'text-purple-300', bg: 'bg-purple-500/20', border: 'border-purple-400', glow: 'shadow-purple-500/40' };
    if (effectiveStreak >= 7) return { name: 'Pillar', color: 'text-sky-300', bg: 'bg-sky-500/20', border: 'border-sky-400', glow: 'shadow-sky-500/40' };
    if (effectiveStreak >= 3) return { name: 'Matmid', color: 'text-orange-400', bg: 'bg-orange-500/20', border: 'border-orange-500', glow: 'shadow-orange-500/30' };
    return { name: 'Apprentice', color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/40', glow: 'shadow-amber-500/20' };
  }, [effectiveStreak]);

  // Reset streak helper for testing or fresh start
  const resetStreak = useCallback(() => {
    setStreakData({
      currentStreak: 0,
      longestStreak: 0,
      lastStudyDate: null,
      totalDays: 0,
      studyDates: [],
    });
  }, []);

  return {
    currentStreak: effectiveStreak,
    longestStreak: streakData.longestStreak,
    totalDays: streakData.totalDays,
    studiedToday,
    lastStudyDate: streakData.lastStudyDate,
    weekProgress,
    milestones,
    nextMilestone,
    todayQuote,
    streakTier,
    recordStudyAction,
    resetStreak,
  };
}
