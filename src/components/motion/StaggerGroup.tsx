import {
  Children,
  type ReactNode,
  isValidElement,
  cloneElement,
  type ReactElement,
} from 'react'
import { motion, useReducedMotion } from 'motion/react'
import { cn } from '@/lib/cn'
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
}

/**
 * Card-grid viewport entrance. First `max` children stagger; the rest appear instantly.
 */
export function StaggerGroup({
  children,
  className,
  max = STAGGER_MAX,
  distance,
}: StaggerGroupProps) {
  const reduce = useReducedMotion()
  const isMobile =
    typeof window !== 'undefined' ? window.matchMedia('(max-width: 767px)').matches : false
  const y = distance ?? (isMobile ? ENTRANCE_Y_MOBILE : ENTRANCE_Y_CARD)
  const stagger = isMobile ? STAGGER_DELAY_MOBILE : STAGGER_DELAY

  const items = Children.toArray(children)

  if (reduce) {
    return <div className={cn(className)}>{children}</div>
  }

  return (
    <motion.div
      className={cn(className)}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: 0.15 }}
      variants={{
        hidden: {},
        show: {
          transition: { staggerChildren: stagger },
        },
      }}
    >
      {items.map((child, index) => {
        if (index >= max) {
          return (
            <div key={isValidElement(child) ? child.key ?? index : index}>{child}</div>
          )
        }

        const wrapped = (
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
        return wrapped
      })}
    </motion.div>
  )
}
