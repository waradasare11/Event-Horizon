/**
 * PeakForm AI Mobile Haptic Feedback Utility
 * Leverages the Navigator Vibration API on supported mobile browsers & webviews
 * Provides tactile confirmation for set completion, workout finishes, and quick actions.
 */

export const triggerHaptic = (pattern: number | number[] = 30): boolean => {
  if (typeof window !== 'undefined' && 'navigator' in window && typeof navigator.vibrate === 'function') {
    try {
      return navigator.vibrate(pattern);
    } catch {
      return false;
    }
  }
  return false;
};

/**
 * Crisp light tactile feedback for checking off a set or exercise
 */
export const triggerHapticSetComplete = (): boolean => {
  return triggerHaptic([35]);
};

/**
 * Celebratory multi-pulse haptic pattern for finishing an entire workout session
 */
export const triggerHapticWorkoutComplete = (): boolean => {
  return triggerHaptic([60, 50, 100, 50, 180]);
};

/**
 * Quick tap feedback for interactive buttons & toggles
 */
export const triggerHapticTap = (): boolean => {
  return triggerHaptic(20);
};

/**
 * Alert feedback for timer completion or warnings
 */
export const triggerHapticAlert = (): boolean => {
  return triggerHaptic([100, 50, 100]);
};
