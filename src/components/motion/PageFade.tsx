import { useEffect, type ReactNode } from 'react'
import { motion, useReducedMotion } from 'motion/react'
import { useLocation } from 'react-router-dom'
import { motionTokens } from '@/lib/motion'

/**
 * Guest route change — content opacity only. Header/footer stay mounted outside.
 * Scroll jumps to top instantly (not animated).
 */
export function PageFade({ children }: { children: ReactNode }) {
  const { pathname } = useLocation()
  const reduce = useReducedMotion()

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' })
  }, [pathname])

  return (
    <motion.div
      key={pathname}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{
        duration: reduce ? 0 : motionTokens.page.duration,
        ease: motionTokens.page.ease,
      }}
    >
      {children}
    </motion.div>
  )
}
