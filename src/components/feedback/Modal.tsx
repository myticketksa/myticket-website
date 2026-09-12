import { Dialog as DialogPrimitive } from 'radix-ui'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import type { ComponentProps, ReactNode } from 'react'
import { Button } from '@/components/ui'
import { cn } from '@/lib/cn'
import { easeEnter, easeExit, motionTokens } from '@/lib/motion'

/**
 * Figma `ModalScrim` — node 207:3048.
 */
export function ModalScrim({ className, ...props }: ComponentProps<'div'>) {
  return (
    <div
      className={cn('fixed inset-0 z-50 bg-surface-inverse/55 backdrop-blur-[1.5px]', className)}
      {...props}
    />
  )
}

export interface ModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: ReactNode
  body: ReactNode
  confirmLabel: ReactNode
  onConfirm?: () => void
  cancelLabel: ReactNode
  onCancel?: () => void
  className?: string
}

export function Modal({
  open,
  onOpenChange,
  title,
  body,
  confirmLabel,
  onConfirm,
  cancelLabel,
  onCancel,
  className,
}: ModalProps) {
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
                transition={{
                  duration: reduce ? 0.15 : 0.25,
                  ease: easeExit,
                }}
              />
            </DialogPrimitive.Overlay>

            <DialogPrimitive.Content asChild forceMount>
              <motion.div
                className={cn(
                  'fixed top-1/2 left-1/2 z-50 flex w-full max-w-[460px] flex-col items-start rounded-panel bg-bg-page p-[26px] shadow-overlay',
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
                <div className="flex w-full flex-col items-start overflow-clip pb-[6px]">
                  <DialogPrimitive.Title className="w-full text-heading-h3 text-ink-primary">
                    {title}
                  </DialogPrimitive.Title>
                </div>

                <div className="flex w-full flex-col items-start overflow-clip pb-xl">
                  <DialogPrimitive.Description className="w-full text-[14px] leading-[1.55] font-medium text-ink-secondary">
                    {body}
                  </DialogPrimitive.Description>
                </div>

                <div className="flex w-full flex-col items-start gap-[10px] overflow-clip">
                  <Button variant="destructive" size="md" onClick={onConfirm} className="w-full">
                    {confirmLabel}
                  </Button>
                  <DialogPrimitive.Close asChild>
                    <Button variant="ghost" size="md" onClick={onCancel} className="w-full">
                      {cancelLabel}
                    </Button>
                  </DialogPrimitive.Close>
                </div>
              </motion.div>
            </DialogPrimitive.Content>
          </DialogPrimitive.Portal>
        ) : null}
      </AnimatePresence>
    </DialogPrimitive.Root>
  )
}
