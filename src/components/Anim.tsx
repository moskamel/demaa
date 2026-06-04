/**
 * Reusable animation primitives — wrap any element to get motion.
 * All respect prefers-reduced-motion automatically via Framer Motion.
 */
import React from 'react'
import { motion, useInView, type HTMLMotionProps } from 'framer-motion'

// ── Shared easing ────────────────────────────────────────────────────────────
const ease = [0.25, 0.46, 0.45, 0.94] as const
const spring = { type: 'spring', stiffness: 380, damping: 28 } as const

// ── Scroll-triggered fade + slide up ─────────────────────────────────────────
export function FadeUp({
  children, delay = 0, duration = 0.45, className, style,
}: {
  children: React.ReactNode; delay?: number; duration?: number;
  className?: string; style?: React.CSSProperties
}) {
  const ref = React.useRef(null)
  const inView = useInView(ref, { once: true, margin: '-60px' })
  return (
    <motion.div ref={ref} className={className} style={style}
      initial={{ opacity: 0, y: 20 }}
      animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
      transition={{ duration, delay, ease }}>
      {children}
    </motion.div>
  )
}

// ── Scroll-triggered fade in ─────────────────────────────────────────────────
export function FadeIn({
  children, delay = 0, duration = 0.4, className, style,
}: {
  children: React.ReactNode; delay?: number; duration?: number;
  className?: string; style?: React.CSSProperties
}) {
  const ref = React.useRef(null)
  const inView = useInView(ref, { once: true, margin: '-40px' })
  return (
    <motion.div ref={ref} className={className} style={style}
      initial={{ opacity: 0 }}
      animate={inView ? { opacity: 1 } : { opacity: 0 }}
      transition={{ duration, delay, ease: 'easeOut' }}>
      {children}
    </motion.div>
  )
}

// ── Scroll-triggered scale in ────────────────────────────────────────────────
export function ScaleIn({
  children, delay = 0, className, style,
}: {
  children: React.ReactNode; delay?: number;
  className?: string; style?: React.CSSProperties
}) {
  const ref = React.useRef(null)
  const inView = useInView(ref, { once: true, margin: '-50px' })
  return (
    <motion.div ref={ref} className={className} style={style}
      initial={{ opacity: 0, scale: 0.94 }}
      animate={inView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.94 }}
      transition={{ duration: 0.4, delay, ease }}>
      {children}
    </motion.div>
  )
}

// ── Stagger container — children animate in sequence ────────────────────────
export function StaggerList({
  children, staggerDelay = 0.07, className, style,
}: {
  children: React.ReactNode; staggerDelay?: number;
  className?: string; style?: React.CSSProperties
}) {
  const ref = React.useRef(null)
  const inView = useInView(ref, { once: true, margin: '-50px' })
  return (
    <motion.div ref={ref} className={className} style={style}
      initial="hidden"
      animate={inView ? 'show' : 'hidden'}
      variants={{ hidden: {}, show: { transition: { staggerChildren: staggerDelay } } }}>
      {children}
    </motion.div>
  )
}

// ── Stagger item — use inside StaggerList ────────────────────────────────────
export function StaggerItem({
  children, className, style,
}: {
  children: React.ReactNode; className?: string; style?: React.CSSProperties
}) {
  return (
    <motion.div className={className} style={style}
      variants={{
        hidden: { opacity: 0, y: 16 },
        show: { opacity: 1, y: 0, transition: { duration: 0.4, ease } },
      }}>
      {children}
    </motion.div>
  )
}

// ── Hoverable card — lifts on hover ─────────────────────────────────────────
export function AnimCard({
  children, lift = 5, className, style, onClick,
}: {
  children: React.ReactNode; lift?: number;
  className?: string; style?: React.CSSProperties; onClick?: () => void
}) {
  return (
    <motion.div className={className} style={{ cursor: onClick ? 'pointer' : undefined, ...style }}
      whileHover={{ y: -lift, boxShadow: '0 16px 40px rgba(0,0,0,0.35)' }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
      onClick={onClick}>
      {children}
    </motion.div>
  )
}

// ── Pressable button ─────────────────────────────────────────────────────────
export function AnimBtn({
  children, className, style, onClick, disabled, type, title,
  ...rest
}: HTMLMotionProps<'button'> & { disabled?: boolean }) {
  return (
    <motion.button
      {...rest}
      className={className}
      style={style}
      onClick={onClick}
      disabled={disabled}
      type={type}
      title={title}
      whileHover={!disabled ? { scale: 1.03 } : {}}
      whileTap={!disabled ? { scale: 0.96 } : {}}
      transition={spring}>
      {children}
    </motion.button>
  )
}

// ── Page entrance wrapper ────────────────────────────────────────────────────
export function PageEnter({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease }}>
      {children}
    </motion.div>
  )
}

// ── Number pop — for stat numbers ────────────────────────────────────────────
export function PopNumber({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  const ref = React.useRef(null)
  const inView = useInView(ref, { once: true })
  return (
    <motion.span ref={ref}
      initial={{ opacity: 0, scale: 0.7 }}
      animate={inView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.7 }}
      transition={{ type: 'spring', stiffness: 500, damping: 22, delay }}>
      {children}
    </motion.span>
  )
}
