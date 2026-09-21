import {
  ArrowLeft as PhosphorArrowLeft,
  ArrowRight as PhosphorArrowRight,
  CaretLeft as PhosphorCaretLeft,
  CaretRight as PhosphorCaretRight,
} from '@phosphor-icons/react'
import type { IconProps as PhosphorIconProps } from '@phosphor-icons/react'
import { cn } from '@/lib/cn'

type DirectionalProps = Omit<PhosphorIconProps, 'ref'>

/**
 * Horizontal chevrons/arrows flip in RTL so “back/prev” always points
 * against the reading direction without per-call-site `rtl:rotate-180`.
 */
export function ArrowLeftIcon({ className, ...props }: DirectionalProps) {
  return <PhosphorArrowLeft className={cn('rtl:rotate-180', className)} {...props} />
}

export function ArrowRightIcon({ className, ...props }: DirectionalProps) {
  return <PhosphorArrowRight className={cn('rtl:rotate-180', className)} {...props} />
}

export function ChevronLeftIcon({ className, ...props }: DirectionalProps) {
  return <PhosphorCaretLeft className={cn('rtl:rotate-180', className)} {...props} />
}

export function ChevronRightIcon({ className, ...props }: DirectionalProps) {
  return <PhosphorCaretRight className={cn('rtl:rotate-180', className)} {...props} />
}
