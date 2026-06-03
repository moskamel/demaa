import { useEffect, useRef, useState } from 'react'

interface Props {
  value: number
  duration?: number
  decimals?: number
  prefix?: string
  suffix?: string
  formatter?: (n: number) => string
}

function easeOutExpo(t: number) {
  return t === 1 ? 1 : 1 - Math.pow(2, -10 * t)
}

export default function AnimatedNumber({ value, duration = 900, decimals = 0, prefix = '', suffix = '', formatter }: Props) {
  const [display, setDisplay] = useState(0)
  const [animating, setAnimating] = useState(false)
  const rafRef = useRef<number>(0)
  const prevRef = useRef(0)

  useEffect(() => {
    const start = prevRef.current
    const end = value
    const startTime = performance.now()
    setAnimating(true)

    const tick = (now: number) => {
      const elapsed = now - startTime
      const progress = Math.min(elapsed / duration, 1)
      const eased = easeOutExpo(progress)
      const current = start + (end - start) * eased
      setDisplay(current)
      if (progress < 1) {
        rafRef.current = requestAnimationFrame(tick)
      } else {
        setDisplay(end)
        prevRef.current = end
        setAnimating(false)
      }
    }

    rafRef.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafRef.current)
  }, [value, duration])

  const formatted = formatter
    ? formatter(display)
    : display.toLocaleString('ar-EG', { maximumFractionDigits: decimals, minimumFractionDigits: decimals })

  return (
    <span style={{
      display: 'inline-block',
      transition: 'transform 0.15s',
      transform: animating ? 'scale(1.02)' : 'scale(1)',
    }}>
      {prefix}{formatted}{suffix}
    </span>
  )
}
