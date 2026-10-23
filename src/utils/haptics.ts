/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Procedural Mobile Haptic Vibration Feedback Utility
 * Uses the Web Vibration API with safe fallback for unsupported environments & desktop.
 */
class HapticsManager {
  private _enabled: boolean = true;

  constructor() {
    try {
      const stored = localStorage.getItem('eruv_haptics_enabled');
      if (stored !== null) {
        this._enabled = stored === 'true';
      }
    } catch {
      this._enabled = true;
    }
  }

  /**
   * Whether the current browser / device supports the Web Vibration API
   */
  get isSupported(): boolean {
    return (
      typeof window !== 'undefined' &&
      'navigator' in window &&
      typeof navigator.vibrate === 'function'
    );
  }

  /**
   * Whether haptics are currently enabled
   */
  get enabled(): boolean {
    return this._enabled && this.isSupported;
  }

  set enabled(val: boolean) {
    this._enabled = val;
    try {
      localStorage.setItem('eruv_haptics_enabled', String(val));
    } catch {
      // Storage unavailable fallback
    }
  }

  /**
   * Ultra-light subtle pulse (10ms) for micro-interactions, subtle toggles, and chips
   */
  light() {
    this.vibrate(10);
  }

  /**
   * Crisp standard tap (15ms) for clicks on game elements, 3D poles, buttons, and navigation
   */
  tap() {
    this.vibrate(15);
  }

  /**
   * Medium tactile pulse (30ms) for wire tensioning, camera jumps, and domain transitions
   */
  medium() {
    this.vibrate(30);
  }

  /**
   * Firm tactile pulse (45ms) for primary action triggers
   */
  heavy() {
    this.vibrate(45);
  }

  /**
   * Joyful double-pulse for successfully fixing an eruv breach / inspection task
   */
  success() {
    this.vibrate([35, 50, 45]);
  }

  /**
   * Grand festive celebration pattern when all 5 breaches are repaired and town Eruv is 100% Kosher
   */
  celebration() {
    this.vibrate([40, 60, 40, 60, 60, 80, 100]);
  }

  /**
   * Double alert pulse for invalid/pasul construction
   */
  error() {
    this.vibrate([40, 50, 40]);
  }

  /**
   * Execute a pattern safely if supported and enabled
   */
  vibrate(pattern: number | number[]) {
    if (!this._enabled) return;
    try {
      if (this.isSupported) {
        navigator.vibrate(pattern);
      }
    } catch {
      // Silently ignore permissions policy or iframe restrictions
    }
  }
}

export const hapticsManager = new HapticsManager();
