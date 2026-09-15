import { Dialog as DialogPrimitive } from 'radix-ui'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import type { ReactNode } from 'react'
import { cn } from '@/lib/cn'
import { easeEnter, easeExit, motionTokens } from '@/lib/motion'

export interface FormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: ReactNode
  description?: ReactNode
  children: ReactNode
  className?: string
  /** Wider panel for map/forms. Default max-w-[460px]. */
  size?: 'md' | 'lg'
}

/** Design-system dialog shell for multi-field forms (request / review). */
export function FormDialog({
  open,
  onOpenChange,
  title,
  description,
  children,
  className,
  size = 'md',
}: FormDialogProps) {
  const reduce = useReducedMotion()

  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <AnimatePresence>
        {open ? (
          <DialogPrimitive.Portal forceMount>
            <DialogPrimitive.Overlay asChild forceMount>
              <motion.div
                className="fixed inset-0 z-50 bg-surface-inverse/55 backdrop-blur-[1.5px]"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: reduce ? 0.15 : 0.25, ease: easeExit }}
              />
            </DialogPrimitive.Overlay>

            <DialogPrimitive.Content asChild forceMount>
              <motion.div
                className={cn(
                  'fixed top-1/2 left-1/2 z-50 flex max-h-[min(90vh,720px)] w-full flex-col overflow-y-auto rounded-panel bg-bg-page p-[26px] shadow-overlay',
                  size === 'lg' ? 'max-w-[640px]' : 'max-w-[460px]',
                  className,
                )}
                initial={
                  reduce
                    ? { opacity: 0, x: '-50%', y: '-50%' }
                    : { opacity: 0, scale: 0.96, x: '-50%', y: 'calc(-50% + 8px)' }
                }
                animate={{
                  opacity: 1,
                  scale: 1,
                  x: '-50%',
                  y: '-50%',
                  transition: {
                    duration: reduce ? 0 : motionTokens.overlay.duration,
                    ease: easeEnter,
                  },
                }}
                exit={
                  reduce
                    ? {
                        opacity: 0,
                        x: '-50%',
                        y: '-50%',
                        transition: { duration: 0.15, ease: easeExit },
                      }
                    : {
                        opacity: 0,
                        scale: 0.98,
                        x: '-50%',
                        y: 'calc(-50% + 4px)',
                        transition: {
                          duration: motionTokens.exit.duration,
                          ease: easeExit,
                        },
                      }
                }
              >
                <DialogPrimitive.Title className="w-full text-heading-h3 text-ink-primary">
                  {title}
                </DialogPrimitive.Title>
                {description ? (
                  <DialogPrimitive.Description className="mt-[8px] w-full text-[14px] leading-[1.55] font-medium text-ink-secondary">
                    {description}
                  </DialogPrimitive.Description>
                ) : (
                  <DialogPrimitive.Description className="sr-only">
                    {typeof title === 'string' ? title : 'Dialog'}
                  </DialogPrimitive.Description>
                )}
                <div className="mt-xl w-full">{children}</div>
              </motion.div>
            </DialogPrimitive.Content>
          </DialogPrimitive.Portal>
        ) : null}
      </AnimatePresence>
    </DialogPrimitive.Root>
  )
}
