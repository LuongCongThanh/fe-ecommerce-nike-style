'use client';

import { motion, useReducedMotion } from 'framer-motion';

const HIDDEN = { opacity: 0, transform: 'translateY(16px)' };
const SHOWN = { opacity: 1, transform: 'translateY(0px)' };

interface RevealProps {
  readonly children: React.ReactNode;
  readonly className?: string;
}

export function Reveal({ children, className }: RevealProps): React.JSX.Element {
  const prefersReducedMotion = useReducedMotion() === true;

  return (
    <motion.div
      initial={prefersReducedMotion ? SHOWN : HIDDEN}
      whileInView={SHOWN}
      viewport={{ once: true, margin: '-100px' }}
      transition={prefersReducedMotion ? { duration: 0 } : { duration: 0.35, ease: [0, 0, 0.2, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
