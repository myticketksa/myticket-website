import type { ImgHTMLAttributes } from 'react'
import saFlag from '@/assets/flags/sa.png'
import usFlag from '@/assets/flags/us.png'
import { cn } from '@/lib/cn'

type FlagImgProps = Omit<ImgHTMLAttributes<HTMLImageElement>, 'src' | 'alt'> & {
  /** Display width in px — height scales to keep the same aspect for both flags. */
  size?: number
}

const FLAG_CLASS = 'block rounded-[2px] object-cover'

/** Saudi Arabia flag (PNG) — sized to match the US flag box. */
export function FlagSaudiArabia({ size = 24, className, ...props }: FlagImgProps) {
  const height = Math.round((size * 42) / 80)
  return (
    <img
      src={saFlag}
      alt=""
      width={size}
      height={height}
      className={cn(FLAG_CLASS, className)}
      style={{ width: size, height, ...props.style }}
      aria-hidden="true"
      {...props}
    />
  )
}

/** United States flag (PNG). */
export function FlagUnitedStates({ size = 24, className, ...props }: FlagImgProps) {
  const height = Math.round((size * 42) / 80)
  return (
    <img
      src={usFlag}
      alt=""
      width={size}
      height={height}
      className={cn(FLAG_CLASS, className)}
      style={{ width: size, height, ...props.style }}
      aria-hidden="true"
      {...props}
    />
  )
}
