/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { ERUV_FACTS, EruvFact } from '../data/eruvFacts';
import { soundManager } from '../utils/audio';

interface UseTriviaToastOptions {
  isGameMode: boolean;
  isInspecting: boolean;
  onFactSeen?: (totalSeen: number) => void;
}

export function useTriviaToast({
  isGameMode,
  isInspecting,
  onFactSeen,
}: UseTriviaToastOptions) {
  const [currentFact, setCurrentFact] = useState<EruvFact | null>(null);
  const [isVisible, setIsVisible] = useState<boolean>(false);
  const [isEnabled, setIsEnabled] = useState<boolean>(true);
  
  const seenFactIdsRef = useRef<Set<string>>(new Set());
  const timerRef = useRef<number | null>(null);
  const hasTriggeredInitialRef = useRef<boolean>(false);

  // Pick a random fact that hasn't been shown recently
  const selectNextFact = useCallback((): EruvFact => {
    const unread = ERUV_FACTS.filter(f => !seenFactIdsRef.current.has(f.id));
    const pool = unread.length > 0 ? unread : ERUV_FACTS;
    
    // If pool reset needed
    if (unread.length === 0) {
      seenFactIdsRef.current.clear();
    }

    const randomIndex = Math.floor(Math.random() * pool.length);
    const chosen = pool[randomIndex];
    seenFactIdsRef.current.add(chosen.id);

    if (onFactSeen) {
      onFactSeen(seenFactIdsRef.current.size);
    }

    return chosen;
  }, [onFactSeen]);

  // Trigger showing a fact
  const showFact = useCallback(() => {
    if (!isEnabled) return;
    const fact = selectNextFact();
    setCurrentFact(fact);
    setIsVisible(true);
    soundManager.playTriviaChime();
  }, [isEnabled, selectNextFact]);

  // Dismiss current fact and schedule the next random toast
  const dismissFact = useCallback(() => {
    setIsVisible(false);

    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }

    // Schedule next appearance between 45s and 75s
    if (isGameMode && isEnabled) {
      const nextDelayMs = Math.floor(Math.random() * 30000) + 45000; // 45-75s
      timerRef.current = window.setTimeout(() => {
        if (!isInspecting) {
          showFact();
        }
      }, nextDelayMs);
    }
  }, [isGameMode, isEnabled, isInspecting, showFact]);

  // Next Fact action: manually cycle to another fact right now
  const nextFact = useCallback(() => {
    const fact = selectNextFact();
    setCurrentFact(fact);
    setIsVisible(true);
    soundManager.playTriviaChime();
  }, [selectNextFact]);

  // Toggle trivia toasts on/off
  const toggleEnabled = useCallback(() => {
    setIsEnabled(prev => {
      const next = !prev;
      if (!next) {
        setIsVisible(false);
        if (timerRef.current) clearTimeout(timerRef.current);
      }
      return next;
    });
  }, []);

  // Main scheduler effect
  useEffect(() => {
    // If not in game mode or disabled or currently inspecting a breach
    if (!isGameMode || !isEnabled || isInspecting) {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
      // If currently inspecting a breach, temporarily hide the toast so it doesn't collide
      if (isInspecting && isVisible) {
        setIsVisible(false);
      }
      return;
    }

    // If already showing a toast, don't schedule another one
    if (isVisible) return;

    // Schedule initial or next toast
    const delay = !hasTriggeredInitialRef.current
      ? Math.floor(Math.random() * 8000) + 14000 // 14-22s for first impression
      : Math.floor(Math.random() * 30000) + 45000; // 45-75s subsequent

    hasTriggeredInitialRef.current = true;

    timerRef.current = window.setTimeout(() => {
      showFact();
    }, delay);

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [isGameMode, isEnabled, isInspecting, isVisible, showFact]);

  return {
    currentFact,
    isVisible,
    isEnabled,
    dismissFact,
    nextFact,
    toggleEnabled,
  };
}
