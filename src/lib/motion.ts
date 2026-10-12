import type { Transition, Variants } from 'motion/react';

/** AFTERFRAME's motion vocabulary. Two curves, a handful of durations. */
export const EASE_CINEMA = [0.22, 1, 0.36, 1] as const;
export const EASE_SHUTTER = [0.76, 0, 0.24, 1] as const;

export const DURATION = { quick: 0.35, base: 0.7, slow: 1.1 } as const;

export const revealUp: Variants = {
  hidden: { opacity: 0, y: 28 },
  visible: { opacity: 1, y: 0, transition: { duration: DURATION.base, ease: EASE_CINEMA } },
};

export const stagger = (step = 0.08, delay = 0): Variants => ({
  hidden: {},
  visible: { transition: { staggerChildren: step, delayChildren: delay } },
});

export const lineReveal: Variants = {
  hidden: { y: '105%' },
  visible: { y: '0%', transition: { duration: 0.9, ease: EASE_CINEMA } },
};

export const fade: Transition = { duration: DURATION.quick, ease: EASE_CINEMA };
