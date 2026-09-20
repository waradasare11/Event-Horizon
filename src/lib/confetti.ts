import confetti from 'canvas-confetti';

/**
 * Fires a celebratory confetti blast tailored for fitness milestone achievements,
 * onboarding sign-ups, and goal timeline forecast completion.
 */
export function fireCelebrationConfetti() {
  try {
    // Left cannon
    confetti({
      particleCount: 45,
      angle: 60,
      spread: 55,
      origin: { x: 0.1, y: 0.7 },
      colors: ['#3B82F6', '#60A5FA', '#1D4ED8', '#38BDF8', '#0B1220', '#E8F1FF'],
    });

    // Right cannon
    confetti({
      particleCount: 45,
      angle: 120,
      spread: 55,
      origin: { x: 0.9, y: 0.7 },
      colors: ['#3B82F6', '#60A5FA', '#1D4ED8', '#38BDF8', '#0B1220', '#E8F1FF'],
    });

    // Center burst
    setTimeout(() => {
      confetti({
        particleCount: 50,
        spread: 80,
        origin: { y: 0.6 },
        colors: ['#3B82F6', '#60A5FA', '#38BDF8', '#1D4ED8'],
      });
    }, 200);
  } catch (err) {
    console.warn('Confetti animation safely caught:', err);
  }
}
