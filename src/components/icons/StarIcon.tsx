import type { IconProps } from './types'

/** Figma `Icon/Star`, geometry exported from node set 207:1595. */
export function StarIcon({ size = 24, ...props }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      focusable="false"
      {...props}
    >
      <path d="M12 2L15 8.6L22 9.5L16.8 14.3L18.3 21L12 17.5L5.7 21L7.2 14.3L2 9.5L9 8.6L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}
