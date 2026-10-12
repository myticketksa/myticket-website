import {
  Children,
  type ReactNode,
  isValidElement,
  cloneElement,
  type ReactElement,
} from 'react'
import { motion, useReducedMotion } from 'motion/react'
import { cn } from '@/lib/cn'
import { useEntranceFailsafe } from './useEntranceFailsafe'
import {
  easeEnter,
  ENTRANCE_Y_CARD,
  ENTRANCE_Y_MOBILE,
  motionTokens,
  STAGGER_DELAY,
  STAGGER_DELAY_MOBILE,
  STAGGER_MAX,
} from '@/lib/motion'

export interface StaggerGroupProps {
  children: ReactNode
  className?: string
  /** Override max animated children (default 6). */
  max?: number
  distance?: number
  /**
   * When false (default), animates on mount — safe for catalog grids that
   * often mount empty while fetching, then fill in. Viewport-gated entrances
   * left whole result grids at opacity 0 until scroll (QA #5/#7).
   */
  inView?: boolean
}

/**
 * Card-grid entrance. First `max` children stagger; the rest appear instantly.
 * Defaults to mount animation so cold-load catalog pages never paint blank.
 */
export function StaggerGroup({
  children,
  className,
  max = STAGGER_MAX,
  distance,
  inView = false,
}: StaggerGroupProps) {
  const reduce = useReducedMotion()
  const forced = useEntranceFailsafe(!reduce && inView)
  const isMobile =
    typeof window !== 'undefined' ? window.matchMedia('(max-width: 767px)').matches : false
  const y = distance ?? (isMobile ? ENTRANCE_Y_MOBILE : ENTRANCE_Y_CARD)
  const stagger = isMobile ? STAGGER_DELAY_MOBILE : STAGGER_DELAY

  const items = Children.toArray(children)
  // Remount once when the first items arrive so a cold empty grid still staggers.
  const readyKey = items.length > 0 ? 'ready' : 'empty'

  if (reduce) {
    return <div className={cn(className)}>{children}</div>
  }

  const body = items.map((child, index) => {
    if (index >= max) {
      return (
        <div key={isValidElement(child) ? child.key ?? index : index}>{child}</div>
      )
    }

    return (
      <motion.div
        key={isValidElement(child) ? child.key ?? index : index}
        variants={{
          hidden: { opacity: 0, y },
          show: {
            opacity: 1,
            y: 0,
            transition: {
              duration: motionTokens.entrance.duration,
              ease: easeEnter,
            },
          },
        }}
        className="min-w-0"
      >
        {isValidElement(child)
          ? cloneElement(child as ReactElement<{ className?: string }>, {
              className: cn(
                (child as ReactElement<{ className?: string }>).props.className,
                'h-full',
              ),
            })
          : child}
      </motion.div>
    )
  })

  const variants = {
    hidden: {},
    show: {
      transition: { staggerChildren: stagger },
    },
  }

  if (!inView) {
    return (
      <motion.div
        key={readyKey}
        className={cn(className)}
        initial="hidden"
        animate="show"
        variants={variants}
      >
        {body}
      </motion.div>
    )
  }

  return (
    <motion.div
      key={readyKey}
      className={cn(className)}
      initial="hidden"
      whileInView="show"
      // `amount` is a fraction of THIS element, not of the screen. A results
      // grid is often several screens tall, so any fraction above a sliver can
      // never be satisfied and the entrance never runs. Trigger on first pixel.
      viewport={{ once: true, amount: 'some' }}
      animate={forced ? 'show' : undefined}
      variants={variants}
    >
      {body}
    </motion.div>
  )
}
