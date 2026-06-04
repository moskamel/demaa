// Shared Framer Motion animation variants
import type { Variants } from 'framer-motion'

export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] } },
}

export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { duration: 0.4, ease: 'easeOut' } },
}

export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.92 },
  show: { opacity: 1, scale: 1, transition: { duration: 0.45, ease: [0.25, 0.46, 0.45, 0.94] } },
}

export const slideInRight: Variants = {
  hidden: { opacity: 0, x: 40 },
  show: { opacity: 1, x: 0, transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] } },
}

export const stagger = (staggerChildren = 0.08, delayChildren = 0): Variants => ({
  hidden: {},
  show: { transition: { staggerChildren, delayChildren } },
})

export const cardHover = {
  rest: { scale: 1, y: 0, boxShadow: '0 2px 8px rgba(0,0,0,0.2)' },
  hover: { scale: 1.02, y: -4, boxShadow: '0 16px 40px rgba(0,0,0,0.4)', transition: { duration: 0.2, ease: 'easeOut' } },
}

export const buttonTap = { scale: 0.96, transition: { duration: 0.1 } }

export const popIn: Variants = {
  hidden: { opacity: 0, scale: 0.75 },
  show: { opacity: 1, scale: 1, transition: { type: 'spring', stiffness: 400, damping: 20 } },
}

export const typingDot: Variants = {
  animate: {
    y: [0, -6, 0],
    transition: { duration: 0.7, repeat: Infinity, ease: 'easeInOut' },
  },
}
