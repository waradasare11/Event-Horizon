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
      colors: ['#0F6E5F', '#2DD4BF', '#F59E0B', '#10B981', '#6366F1', '#EC4899'],
    });

    // Right cannon
    confetti({
      particleCount: 45,
      angle: 120,
      spread: 55,
      origin: { x: 0.9, y: 0.7 },
      colors: ['#0F6E5F', '#2DD4BF', '#F59E0B', '#10B981', '#6366F1', '#EC4899'],
    });

    // Center burst
    setTimeout(() => {
      confetti({
        particleCount: 50,
        spread: 80,
        origin: { y: 0.6 },
        colors: ['#0F6E5F', '#2DD4BF', '#F59E0B', '#34D399'],
      });
    }, 200);
  } catch (err) {
    console.warn('Confetti animation safely caught:', err);
  }
}
