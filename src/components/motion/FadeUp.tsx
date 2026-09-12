import { type ReactNode } from 'react'
import { motion, useReducedMotion } from 'motion/react'
import { cn } from '@/lib/cn'
import { easeEnter, ENTRANCE_Y, motionTokens } from '@/lib/motion'

export interface FadeUpProps {
  children: ReactNode
  className?: string
  /** Seconds before the entrance starts. */
  delay?: number
  /** Translate distance in px (ignored when reduced motion). */
  distance?: number
  duration?: number
  /** When false, animates on mount instead of whileInView. */
  inView?: boolean
  /** Optional scale-from (e.g. 0.98 for CTA banners). */
  scaleFrom?: number
}

/**
 * Viewport (or mount) entrance — opacity + translateY (+ optional scale).
 * Triggers once; never animates layout-affecting properties.
 */
export function FadeUp({
  children,
  className,
  delay = 0,
  distance = ENTRANCE_Y,
  duration = motionTokens.entrance.duration,
  inView = true,
  scaleFrom,
}: FadeUpProps) {
  const reduce = useReducedMotion()
  const hidden = reduce
    ? { opacity: 0 }
    : {
        opacity: 0,
        y: distance,
        ...(scaleFrom != null ? { scale: scaleFrom } : {}),
      }
  const shown = reduce
    ? { opacity: 1 }
    : {
        opacity: 1,
        y: 0,
        ...(scaleFrom != null ? { scale: 1 } : {}),
      }
  const transition = reduce
    ? { duration: 0 }
    : { duration, delay, ease: easeEnter }

  if (!inView) {
    return (
      <motion.div
        className={cn(className)}
        initial={hidden}
        animate={shown}
        transition={transition}
      >
        {children}
      </motion.div>
    )
  }

  return (
    <motion.div
      className={cn(className)}
      initial={hidden}
      whileInView={shown}
      viewport={{ once: true, amount: 0.2 }}
      transition={transition}
    >
      {children}
    </motion.div>
  )
}
