import { useEffect } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { Toast } from '@/components/feedback'
import { useAppDispatch, useAppSelector } from '@/app/hooks'
import { toastDismissed } from '@/features/ui/uiSlice'
import { easeEnter, easeExit, motionTokens } from '@/lib/motion'

/** Global toast stack — bottom-left, auto-dismiss with enter/exit motion. */
export function ToastViewport() {
  const dispatch = useAppDispatch()
  const toasts = useAppSelector((state) => state.ui.toasts)
  const reduce = useReducedMotion()

  useEffect(() => {
    if (toasts.length === 0) return
    const timers = toasts.map((toast) =>
      window.setTimeout(() => dispatch(toastDismissed(toast.id)), 4000),
    )
    return () => timers.forEach((id) => window.clearTimeout(id))
  }, [toasts, dispatch])

  return (
    <div className="pointer-events-none fixed bottom-[24px] left-[24px] z-[80] flex w-[min(360px,calc(100vw-48px))] flex-col gap-[14px]">
      <AnimatePresence initial={false}>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            layout={!reduce}
            className="pointer-events-auto"
            initial={
              reduce
                ? { opacity: 0 }
                : { opacity: 0, y: 12 }
            }
            animate={{
              opacity: 1,
              y: 0,
              transition: {
                duration: reduce ? 0 : motionTokens.toastEnter.duration,
                ease: easeEnter,
              },
            }}
            exit={{
              opacity: 0,
              y: reduce ? 0 : 8,
              transition: {
                duration: reduce ? 0 : motionTokens.toastExit.duration,
                ease: easeExit,
              },
            }}
          >
            <Toast
              tone={toast.tone === 'neutral' ? 'neutral' : toast.tone}
              title={toast.message}
              subtitle=" "
            />
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}
