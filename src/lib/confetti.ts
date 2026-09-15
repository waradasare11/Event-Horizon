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
      colors: ['#D4AF37', '#F0D060', '#A68523', '#C6A04A', '#111111', '#F4EBD0'],
    });

    // Right cannon
    confetti({
      particleCount: 45,
      angle: 120,
      spread: 55,
      origin: { x: 0.9, y: 0.7 },
      colors: ['#D4AF37', '#F0D060', '#A68523', '#C6A04A', '#111111', '#F4EBD0'],
    });

    // Center burst
    setTimeout(() => {
      confetti({
        particleCount: 50,
        spread: 80,
        origin: { y: 0.6 },
        colors: ['#D4AF37', '#F0D060', '#F59E0B', '#C6A04A'],
      });
    }, 200);
  } catch (err) {
    console.warn('Confetti animation safely caught:', err);
  }
}
