import { motion, type HTMLMotionProps } from 'motion/react';
import { revealUp } from '@/lib/motion';

interface RevealProps extends HTMLMotionProps<'div'> {
  delay?: number;
}

/**
 * Scroll-triggered fade-up. Plays once, triggers early so content is never
 * withheld for long, and collapses to opacity-only under reduced motion
 * (handled globally by <MotionConfig reducedMotion="user">).
 */
export function Reveal({ delay = 0, children, ...rest }: RevealProps) {
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.15, margin: '0px 0px -8% 0px' }}
      variants={revealUp}
      transition={{ delay }}
      {...rest}
    >
      {children}
    </motion.div>
  );
}
